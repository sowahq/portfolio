---
title: "Steamworks : le jeu vous croit sur parole"
seoTitle: "Steamworks et DLC : le jeu vous croit sur parole"
description: "Quand un jeu demande s'il possède un DLC, la réponse est calculée dans son propre processus. Pourquoi Steamworks n'est pas une frontière de sécurité."
pubDate: 08/05/2026
image: /blog-img/steamworks-le-jeu-vous-croit-sur-parole/header.png
tags: ["reverse engineering", "steam", "hooking", "c++"]
slug: steamworks-le-jeu-vous-croit-sur-parole
published: true
cible: "les interfaces Steamworks"
outils: []
ateliers: ["jeux"]
court: "Steamworks"
---

# Introduction

Quand un jeu affiche « contenu additionnel non détecté », il n'a interrogé personne. Il a appelé une fonction dans une DLL posée à côté de son exécutable, et il a cru la réponse.

Rien ne part sur le réseau, rien n'est signé. Un appel, une valeur de retour, et le jeu passe à autre chose.

Ce qui rend le sujet intéressant, c'est qu'il n'y a rien de cassé là-dedans. L'API fait exactement ce qu'elle documente. Ce sont les jeux qui s'en servent pour un usage auquel elle n'a jamais prétendu servir, et on va voir jusqu'où ça va.

> ⚠️ **Ce post n'explique pas comment débloquer des DLC.** C'est une analyse de ce qu'une vérification de propriété **côté client** garantit, de ce qu'elle ne garantit pas, et de la façon correcte de la faire. ⚠️

# 1. Comment un jeu demande « est-ce que je possède ça ? »

Steamworks propose deux chemins pour ça. Ce qui les sépare, c'est l'endroit d'où sort le pointeur d'interface, et ça décide du nombre de hooks nécessaires plus loin.

## 1.1 Par la factory exportée

Le cas le plus fréquent. Un jeu C++ moderne écrit simplement :

```cpp
if (SteamApps()->BIsDlcInstalled(1234560)) {
    unlock_dlc_content();
}
```

`SteamApps()` est un accesseur inline du SDK. Sous le capot, il récupère son pointeur d'interface via une **fonction usine** (factory) exportée par `steam_api64.dll`, `SteamInternal_FindOrCreateUserInterface`.

L'API plate (la couche C générée au-dessus des interfaces C++, celle qu'utilisent les bindings pour C#, Godot et compagnie) arrive au même endroit :

```c
SteamAPI_ISteamApps_BIsDlcInstalled(SteamApps(), 1234560);
```

Même factory, même pointeur. Pour la suite, c'est un seul et même chemin.

## 1.2 Par ISteamClient

L'autre voie passe par l'interface racine :

```cpp
ISteamApps* apps = SteamClient()->GetISteamApps(user, pipe, "STEAMAPPS_INTERFACE_VERSION008");
if (apps->BIsDlcInstalled(1234560)) {
    unlock_dlc_content();
}
```

Ici, `ISteamApps` ne vient pas de la factory exportée. C'est `ISteamClient` qui le fabrique en interne, et ce détail va nous coûter deux hooks de plus.

![Les deux chemins pour atteindre ISteamApps](/blog-img/steamworks-le-jeu-vous-croit-sur-parole/01-deux-chemins.png)

# 2. Tout se passe chez vous

Dans les deux cas, la question et la réponse circulent entre deux morceaux de code chargés dans [le même processus, le vôtre]{.text-red-600.font-semibold}. Il n'y a ni paquet réseau ni frontière de privilège entre les deux, seulement un `call` et un `ret`.

## 2.1 Une interface Steamworks, c'est une vtable

`ISteamApps` est une classe C++ abstraite. En mémoire, un pointeur d'interface pointe vers une structure dont le premier champ pointe vers une table de pointeurs de fonctions, la **vtable**.

L'appel `apps->BIsDlcInstalled(1234560)` se compile en quelque chose comme :

```asm
mov  rcx, apps            ; rcx = le pointeur d'interface (this)
mov  edx, 12D680h         ; edx = 1234560, l'app id du DLC
mov  rax, [rcx]           ; rax = la vtable
call qword ptr [rax+38h]  ; slot 7 (7 * 8 octets) = BIsDlcInstalled
```

![La vtable avant et après le hook](/blog-img/steamworks-le-jeu-vous-croit-sur-parole/02-vtable-hook.png)

`[rax+38h]` est une case mémoire inscriptible dans notre propre processus. Si on y écrit l'adresse d'une autre fonction, le jeu appelle cette autre fonction sans s'en apercevoir. Il ne vérifie pas où pointe son slot 7, et il n'a aucune raison de le faire : c'est le compilateur qui a généré cet accès.

## 2.2 Le versioning, ou pourquoi les numéros de slot comptent

Les index de slot dépendent de la version de l'interface. `STEAMAPPS_INTERFACE_VERSION008` et `STEAMAPPS_INTERFACE_VERSION005` n'ont pas la même disposition, parce que Valve ajoute des méthodes au fil des versions.

Elle en retire aussi. `ISteamUtils::GetAppID` occupait le slot 9 tant que `GetCSERIPPort` existait juste avant ; cette méthode a disparu des versions récentes, et tout ce qui la suivait a reculé d'un cran. Un shim qui code en dur le mauvais index n'obtient pas une mauvaise réponse, il appelle une fonction qui n'a rien à voir avec les arguments d'une autre, et le jeu crashe.

D'où la chaîne de version passée aux factories. C'est aussi ce qui nous dit à quelle interface on a affaire, à chaque appel.

# 3. Construire le shim

![Le shim dans le processus du jeu](/blog-img/steamworks-le-jeu-vous-croit-sur-parole/03-shim-en-place.png)

Le principe est de se placer entre les factories et le jeu. On laisse la DLL de Valve fabriquer ses interfaces, puisqu'elle fait tout le travail réel, et on repeint quelques slots au passage.

## 3.1 Intercepter les usines

Deux exports de la vraie `steam_api64.dll` nous intéressent, et il faut les distinguer :

- `SteamInternal_FindOrCreateUserInterface(HSteamUser, const char*)`, celle que finissent par appeler `SteamApps()`, `SteamUtils()` et les autres accesseurs ;
- `SteamInternal_CreateInterface(const char*)`, celle qui sert notamment à obtenir `ISteamClient`, l'interface racine de la section 1.2.

On les accroche avec [MinHook](https://github.com/TsudaKageyu/minhook), et le principe est le même dans les deux cas :

```cpp
static void* (__cdecl* real_FindOrCreateUserInterface)(int32_t, const char*) = nullptr;

static void* __cdecl my_FindOrCreateUserInterface(int32_t user, const char* version) {
    auto* iface = real_FindOrCreateUserInterface(user, version);  // la vraie usine tourne

    if (iface && version)
        on_new_interface(iface, version);                         // on inspecte le résultat

    return iface;
}
```

Au moment où notre DLL est chargée, `steam_api64.dll` n'est peut-être pas encore mappée, et l'ordre de chargement ne nous appartient pas. Faire quoi que ce soit de sérieux depuis `DllMain` est une mauvaise idée : on y est sous le **loader lock**, où beaucoup d'appels Win32 se figent ou se comportent mal.

La solution habituelle est de lancer un thread qui attend l'apparition du module, avec une limite.

```cpp
static DWORD WINAPI wait_for_steam_api(LPVOID) {
    for (int i = 0; i < 200; ++i) {
        if (GetModuleHandleA("steam_api64.dll")) {
            install_hooks();
            return 0;
        }
        Sleep(50);
    }
    return 0;   // dix secondes, puis on abandonne proprement
}
```

## 3.2 Le piège de la convention d'appel

Là on tombe sur un truc rigolo. Les méthodes d'une interface C++ sont en `__thiscall`, le pointeur `this` arrive dans un registre. Mais MinHook nous donne une adresse brute, et `__thiscall` ne se déclare pas sur une fonction libre en C++.

Le contournement classique est `__fastcall`, qui passe aussi ses premiers arguments par registre. Sauf que la disposition diffère entre x86 et x64 : en x64 le `this` est dans `RCX`, en x86 il est dans `ECX` mais `EDX` est réservé par la convention. Il faut donc déclarer un paramètre bidon en 32 bits, et pas en 64.

Deux macros, et on n'y pense plus :

```cpp
#ifdef _WIN64
#define THISCALL(...) void* self, ##__VA_ARGS__
#define FORWARD(...)  self, ##__VA_ARGS__
#else
#define THISCALL(...) void* self, void* edx, ##__VA_ARGS__
#define FORWARD(...)  self, edx, ##__VA_ARGS__
#endif
```

## 3.3 Repeindre les slots

Le hook lui-même tient en quelques lignes :

```cpp
static bool (__fastcall* real_BIsDlcInstalled)(THISCALL(uint32_t)) = nullptr;

static bool __fastcall my_BIsDlcInstalled(THISCALL(uint32_t app_id)) {
    if (in_unlock_list(app_id))
        return true;

    return real_BIsDlcInstalled(FORWARD(app_id));   // sinon, on laisse Steam répondre
}
```

Le `return` vers l'original compte autant que le reste. On ne ment que sur ce qui est explicitement listé, le reste passe intact ; un shim qui répond `true` à tout se fait repérer par n'importe quel jeu qui teste un app id bidon.

L'installation se fait à la volée, quand une interface passe par nos factories :

```cpp
void on_new_interface(void* iface, std::string_view version) {
    if (!version.starts_with("STEAMAPPS_INTERFACE_VERSION"))
        return;

    auto** vtable = *reinterpret_cast<void***>(iface);

    MH_CreateHook(vtable[6], &my_BIsSubscribedApp, (void**)&real_BIsSubscribedApp);
    MH_CreateHook(vtable[7], &my_BIsDlcInstalled,  (void**)&real_BIsDlcInstalled);
    MH_EnableHook(MH_ALL_HOOKS);
}
```

# 4. Combien de hooks, au juste ?

Les numéros de slot ne se devinent pas, ils se lisent dans le header du SDK, où l'ordre de déclaration des méthodes virtuelles est l'ordre de la vtable. La [documentation de `ISteamApps`](https://partner.steamgames.com/doc/api/ISteamApps) décrit ce que fait chaque méthode, mais c'est le header qui donne l'ordre.

```cpp
// isteamapps.h, STEAMAPPS_INTERFACE_VERSION008
virtual bool BIsSubscribed() = 0;                     // slot 0
virtual bool BIsLowViolence() = 0;                    // 1
virtual bool BIsCybercafe() = 0;                      // 2
virtual bool BIsVACBanned() = 0;                      // 3
virtual const char* GetCurrentGameLanguage() = 0;     // 4
virtual const char* GetAvailableGameLanguages() = 0;  // 5
virtual bool BIsSubscribedApp(AppId_t appID) = 0;     // 6
virtual bool BIsDlcInstalled(AppId_t appID) = 0;      // 7
```

On compte, et on obtient les index ci-dessous. Ils valent pour les versions d'interface indiquées ; dans une autre version, recomptez dans le header correspondant plutôt que de me croire.

| Interface | Version | Slot | Méthode | Rôle |
|---|---|---|---|---|
| `ISteamApps` | 008 | 6 | `BIsSubscribedApp` | possède-t-il l'app ? |
| `ISteamApps` | 008 | 7 | `BIsDlcInstalled` | possède-t-il le DLC ? |
| `ISteamUtils` | 009 | 9 | `GetAppID` | quel jeu croit-il être ? |
| `ISteamClient` | 017 | 9 | `GetISteamUtils` | plomberie |
| `ISteamClient` | 017 | 15 | `GetISteamApps` | plomberie |

**Trois hooks** font le travail. Les deux derniers rattrapent le chemin de la section 1.2 : ces interfaces ne passent jamais par les factories, il faut les attraper à leur sortie d'usine.

La surface à couvrir pour faire mentir un jeu sur ce qu'il possède tient donc en une poignée de slots.

# 5. Le même principe, partout

Vu comme ça, deux slots dans une vtable sur une API précise, ça reste anecdotique. Mais le schéma ne change jamais, et la plupart des cracks classiques reposent sur cette seule propriété.

Le motif tient en trois lignes :

1. Le programme pose une question sur ses propres droits, `BIsDlcInstalled`, `IsLicensed`, `checkActivation`, `user.isPro`, peu importe le nom.
2. La réponse est calculée dans son processus.
3. Le programme branche dessus.

Tant que ces trois lignes sont vraies, il existe un endroit unique où la réponse peut être remplacée. Le reste est une affaire de granularité :

- patcher le saut (`jz` → `jmp`), la plus ancienne méthode, qui modifie le binaire sur disque ;
- hooker la fonction, sans toucher au fichier, en repeignant un pointeur en mémoire, ce qu'on vient de faire ;
- remplacer toute la bibliothèque, le principe des émulateurs Steam, avec une réimplémentation de `steam_api64.dll` qui répond ce qu'on lui demande de répondre. Goldberg Emulator, le plus connu, est publié en logiciel libre et sert aussi à tester un jeu en LAN sans client Steam.

Les trois cassent la même hypothèse, celle du programme qui se croit lui-même.

L'asymétrie de coût fait le reste. Côté éditeur, une garantie réelle demande un serveur, une identité, un protocole, des tickets signés et une infrastructure à maintenir. Côté attaquant, il faut [retourner un booléen]{.text-red-600.font-semibold}. Une vérification côté client n'est donc jamais à moitié contournée, elle l'est entièrement dès que quelqu'un s'y intéresse.

Ce qui résiste résiste pour la raison inverse : la réponse n'est pas produite chez le joueur, ou ce qui est protégé n'est pas sur sa machine. Un DLC dont les fichiers ne sont pas livrés ne se débloque pas avec un booléen, il n'y a rien à débloquer. Une logique de jeu qui tourne sur un serveur autoritatif ne peut pas se mentir à elle-même.

# 6. La contre-mesure existe, et elle est documentée

Rien de ce que je viens de décrire n'est un secret. La page [User Authentication and Ownership](https://partner.steamgames.com/doc/features/auth) de Valve décrit la vérification comme un aller-retour vers le backend Steam, et la doc de la Web API est encore plus directe :

> This MUST be called from a secure server, and can never be used directly by clients!
>
> Documentation Steamworks, `ISteamUserAuth/AuthenticateUserTicket`

La bonne façon de faire tient en deux étapes :

1. Le client demande un ticket d'authentification (`GetAuthTicketForWebApi`) et l'envoie à **votre** serveur.
2. Votre serveur valide ce ticket auprès de la Web API Steam ([`ISteamUserAuth/AuthenticateUserTicket`](https://partner.steamgames.com/doc/webapi/ISteamUserAuth)), puis vérifie la propriété avec [`ISteamUser/CheckAppOwnership`](https://partner.steamgames.com/doc/webapi/ISteamUser).

![Vérification côté client contre vérification côté serveur](/blog-img/steamworks-le-jeu-vous-croit-sur-parole/04-client-vs-serveur.png)

Cette fois, la réponse est [produite par un serveur de Valve, signée]{.text-emerald-600.font-semibold}, puis consommée par un serveur à vous. Le processus du joueur ne fait plus que transporter le ticket. Il peut mentir tant qu'il veut sur ce qu'il croit posséder, personne ne l'écoute.

Un shim comme celui-ci ne peut rien contre ça, parce qu'il n'y a rien à casser : il répond à une question qu'on lui pose.

Ça suppose évidemment d'avoir un serveur, ce qui pour un jeu solo est une vraie contrainte. La vérification côté client reste défendable dans ce cas, à condition de savoir qu'on choisit un compromis.

# 7. Et le DRM dans tout ça ?

On me posera la question, alors autant y répondre tout de suite : non, ce qui précède n'a rien à voir avec le SteamStub, le wrapper de protection que Valve applique optionnellement aux exécutables.

Ce sont deux étages différents. Le SteamStub est un **packer**. Il chiffre l'exécutable, ajoute une section `.bind` qui devient le point d'entrée, et déchiffre le vrai code en mémoire au lancement. Il embarque les protections habituelles de ce genre de dispositif, détection de débogueur, mesures de temps d'exécution, contrôles d'intégrité.

Sa faiblesse est celle de tous les packers de ce type, et elle est connue depuis toujours : à un instant donné, le code déchiffré se trouve en mémoire, en clair, parce qu'il faut bien que le processeur puisse l'exécuter. Toute la protection consiste à rendre cet instant difficile à observer.

Je m'arrête là volontairement. Décrire l'architecture d'une protection relève de l'analyse ; fournir de quoi la contourner est autre chose, et ce n'est pas l'objet de ce blog. La faiblesse des vérifications côté client, elle, est documentée par l'éditeur lui-même.

# Conclusion

Une frontière de sécurité, c'est un endroit où les deux côtés ne se font pas confiance. Un appel de vtable dans votre propre processus ne remplit pas cette condition, et c'est pour ça que trois hooks suffisent. Un jeu qui vérifie ses droits **côté client** exprime une préférence, et espère qu'on la respecte.

Si vous concevez ce genre de vérification, la question à se poser est de savoir qui produit la réponse, et si vous pouvez la vérifier sans faire confiance à celui qui vous l'apporte.

Voilà, j'espère que ce tour d'horizon vous aura éclairé sur un coin de Steamworks dont on parle assez peu. Les extraits de code sont volontairement réduits à l'os : ce qui compte ici, ce n'est pas l'outil, c'est ce que son existence dit de l'API.

# Références

Tout ce qui est affirmé plus haut se recoupe avec de la documentation publique. Les numéros de slot, eux, se lisent dans les headers du SDK, pas dans la doc en ligne.

## Documentation Steamworks

:::ref-grid
::ref-card{url="https://partner.steamgames.com/doc/api/steam_api" title="Steamworks API Overview"}
Les accesseurs inline (`SteamApps()`, `SteamUtils()`) et l'initialisation du SDK. Section 1.
::

::ref-card{url="https://partner.steamgames.com/doc/api/ISteamApps" title="ISteamApps"}
Le rôle de `BIsSubscribedApp` et `BIsDlcInstalled`. La doc ne donne pas l'ordre des méthodes virtuelles.
::

::ref-card{url="https://partner.steamgames.com/downloads/list" title="SDK Steamworks"}
`isteamapps.h`, la seule source qui fait foi pour les numéros de slot de la section 4.
::

::ref-card{url="https://partner.steamgames.com/doc/features/auth" title="User Authentication and Ownership"}
Le circuit ticket → backend Steam décrit en section 6.
::

::ref-card{url="https://partner.steamgames.com/doc/webapi/ISteamUserAuth" title="ISteamUserAuth"}
`AuthenticateUserTicket`, d'où vient la citation « This MUST be called from a secure server ».
::

::ref-card{url="https://partner.steamgames.com/doc/webapi/ISteamUser" title="ISteamUser"}
`CheckAppOwnership`, la vérification de propriété côté serveur.
::
:::

## Outillage et plateforme

:::ref-grid
::ref-card{url="https://github.com/TsudaKageyu/minhook" title="MinHook"}
La bibliothèque de hooking utilisée en section 3.
::

::ref-card{url="https://learn.microsoft.com/en-us/cpp/build/x64-calling-convention" title="x64 calling convention"}
Pourquoi le `this` arrive dans `RCX` en x64, et pas ailleurs. Section 3.2.
::

::ref-card{url="https://learn.microsoft.com/en-us/cpp/cpp/fastcall" title="__fastcall"}
Le détail x86 qui impose le paramètre bidon `edx` dans les macros.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-best-practices" title="DLL Best Practices"}
Ce qui est interdit sous loader lock, donc depuis `DllMain`. Section 3.1.
::

::ref-card{url="https://gitlab.com/Mr_Goldberg/goldberg_emulator" title="Goldberg Emulator"}
La réimplémentation libre de `steam_api` citée en section 5. Plus maintenue par son auteur d'origine.
::
:::

## Sur ce blog

:::ref-grid
::ref-card{url="/posts/l-obfuscation-via-la-virtualisation" title="L'obfuscation via la virtualisation"}
L'étage au-dessus : quand ce n'est plus un booléen qu'on cache, mais le code entier.
::
:::
