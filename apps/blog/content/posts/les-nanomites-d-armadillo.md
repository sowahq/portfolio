---
title: "Les nanomites d'Armadillo : l'anti-debug poussé à l'extrême"
description: "Les nanomites d'Armadillo remplacent des sauts par des points d'arrêt résolus par un processus parent. Comment ça marche, et comment on les contourne."
pubDate: 04/04/2026
image: /blog-img/les-nanomites-d-armadillo/header.png
tags: ["reverse engineering", "obfuscation", "anti-debug", "assembly"]
slug: les-nanomites-d-armadillo
published: true
cible: "le protecteur Armadillo"
outils: ["x64dbg", "IDA Pro"]
ateliers: ["protections"]
court: "Armadillo"
---

# Introduction

Quand on entend le mot "nanomite", on pense souvent à de la science-fiction, à des nanorobots microscopiques qui dévorent du métal ou réparent des cellules. Mais dans le monde du reverse engineering, c'est un terme qui a longtemps donné des sueurs froides aux analystes. 

Clarifions tout de suite : par "nanomites d’Armadillo", on ne parle pas de nanotechnologie au sens scientifique. Il s'agit du nom (très marketing) donné à une technique redoutable d'**anti-debug** et d'**anti-reverse-engineering** utilisée par le célèbre protecteur Windows **Armadillo**.

Armadillo utilisait une combinaison ingénieuse de **self-debugging** (le programme se débogue lui-même) et de ces fameuses nanomites pour rendre un binaire extrêmement hostile à l'analyse statique et dynamique.

# 1. L'architecture d'Armadillo : Le Debug Blocker

Pour comprendre les nanomites, il faut d'abord comprendre l'environnement dans lequel elles évoluent. Armadillo repose sur un concept fondamental appelé le **Debug Blocker**.

L'idée est diaboliquement simple : sous Windows, un processus ne peut être débogué que par **un seul débogueur à la fois**. 

Quand un programme protégé par Armadillo se lance, il ne lance pas directement le code utile. À la place :
1. Le processus original démarre (on l'appelle le **Parent**).
2. Ce Parent lance une seconde instance de lui-même (l'**Enfant**) en utilisant l'API Windows `CreateProcess` avec le flag `DEBUG_PROCESS`.
3. Le Parent agit désormais comme le débogueur légitime de l'Enfant.

![Architecture Debug Blocker : Parent (Debugueur) -> Enfant (Protégé)](/blog-img/les-nanomites-d-armadillo/debug-blocker.png)

**Pourquoi c'est fort ?** Parce que si vous essayez d'attacher votre x64dbg ou OllyDbg au processus Enfant (qui contient le vrai code), Windows vous dira gentiment d'aller voir ailleurs : le processus est déjà en cours de débogage !

# 2. Le mécanisme exact des Nanomites

Maintenant que le Parent tient l'Enfant en laisse, il peut interagir avec lui via les événements de débogage. C'est ici qu'entrent en scène les nanomites. Le but est de **casser l'analyse statique** en détruisant le graphe de flot de contrôle.

## 2.1. La mutation du code (ASM)

Lors de la protection, Armadillo repère des instructions de saut conditionnel et les remplace par des instructions **`INT 3`** (opcode `0xCC`). 

Voyons la différence dans un désassembleur comme IDA Pro :

**Avant protection (Code classique, lisible) :**
```asm
; Vérification d'une licence (EAX = 1 si OK)
test eax, eax           
jnz licence_valide      ; Si EAX != 0, on saute au code de succès (75 05)
call message_erreur     ; Sinon, on affiche l'erreur
exit
```

**Après protection via Armadillo (Graphe cassé) :**
```asm
; Le saut JNZ a disparu au profit d'une interruption
test eax, eax           
int 3                   ; 0xCC - Déclenche une exception de debug
db 0x90                 ; Octet de remplissage (NOP)
call message_erreur     ; IDA pense que le code continue ici quoi qu'il arrive
exit
```

Pour un reverse engineer, le code ne ressemble plus à rien. Le flux logique est interrompu par des exceptions et IDA affiche souvent des **"Jumpouts"** car il ne sait plus où va le code.

## 2.2. L'exécution à la volée

À l'exécution, voici ce qu'il se passe à chaque fois que l'Enfant rencontre une nanomite :

![Cycle d'exécution d'une Nanomite](/blog-img/les-nanomites-d-armadillo/nanomite-execution-flow.png)

1. L'Enfant exécute l'instruction **`INT 3`**.
2. Cela déclenche une exception matérielle : `EXCEPTION_BREAKPOINT`.
3. Le flux d'exécution de l'Enfant est suspendu par Windows.
4. Windows notifie le Parent (le débogueur) via l'API `WaitForDebugEvent`.
5. Le Parent récupère l'état des registres de l'Enfant via `GetThreadContext`.
6. Le Parent consulte sa **table secrète** : *"À cette adresse, c'était un JNZ. Est-ce que le flag Zero est activé ?"*
7. Le Parent modifie le registre `EIP` de l'Enfant via `SetThreadContext` pour le faire pointer vers la bonne destination.
8. Le Parent relance l'Enfant.

C'est une symbiose parfaite : le programme "cassé" ne peut pas fonctionner sans son Parent pour recoller les morceaux à la volée.

# 3. Analyse et contournement

Évidemment, ce n'est pas une protection infaillible. Au fil du temps, les analystes ont développé des méthodes pour vaincre cette armure.

## 3.1. La reconstruction (Nanomite Fixing)

L'objectif est de trouver l'adresse de la table des nanomites en mémoire du Parent, de la déchiffrer, puis d'écrire un script pour **patcher** l'Enfant en remplaçant les `0xCC` par les bons opcodes de saut originaux (`74` pour JZ, `75` pour JNZ, etc.).

## 3.2. Le piège des "Fausses Nanomites"

Pour compliquer la tâche, Armadillo utilisait des leurres. Un octet `0xCC` peut apparaître légitimement dans une instruction, et il ne faut surtout pas le patcher !

```asm
; Une instruction parfaitement légitime avec CC dans l'adresse
mov eax, dword ptr [0x0040CC00]  ; L'adresse contient CC !

; Si votre script remplace bêtement TOUS les CC par des sauts :
; Vous corrompez le programme et il crash immédiatement.
```

# Conclusion

Les nanomites d'Armadillo sont un exemple fascinant de détournement des mécanismes de l'OS (le debugging) pour en faire une arme de protection. En déplaçant la logique décisionnelle hors du flux d'instructions, Armadillo a forcé les reverse engineers à changer de paradigme.

Aujourd'hui, cette technique a évolué vers l'**obfuscation par virtualisation**, où ce n'est plus juste un saut qui est caché, mais l'intégralité du code, comme nous l'avons vu dans [notre précédent dossier](/posts/l-obfuscation-via-la-virtualisation).

Le jeu du chat et de la souris continue !

# Références

Armadillo est un produit des années 2000, et son éditeur n'existe plus. Ce qui reste vérifiable, c'est l'API Windows sur laquelle toute la technique repose.

## Le protecteur

:::ref-grid
::ref-card{url="https://web.archive.org/web/2010/http://www.siliconrealms.com/" title="Silicon Realms — SoftwarePassport / Armadillo"}
Le site de l'éditeur, via Internet Archive : le domaine a changé de mains depuis.
::

::ref-card{url="https://forum.tuts4you.com/" title="Tuts4You"}
Le forum où se trouve l'essentiel des analyses publiques d'Armadillo de l'époque, nanomites comprises.
::
:::

## Les API Windows utilisées

:::ref-grid
::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags" title="Process creation flags"}
`DEBUG_PROCESS`, le flag qui fait du Parent le débogueur de l'Enfant. Section 1.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessa" title="CreateProcess"}
L'appel qui lance la seconde instance sous débogage.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/debug/debugging-events" title="Debugging Events"}
`EXCEPTION_DEBUG_EVENT` et le code `EXCEPTION_BREAKPOINT` levé par `INT 3`.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/api/debugapi/nf-debugapi-waitfordebugevent" title="WaitForDebugEvent"}
La boucle d'attente côté Parent, étape 4 de la section 2.2.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreadcontext" title="GetThreadContext"}
La lecture des registres et des flags de l'Enfant suspendu.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-setthreadcontext" title="SetThreadContext"}
La réécriture d'`EIP`, qui remplace le saut supprimé à la protection.
::

::ref-card{url="https://learn.microsoft.com/en-us/windows/win32/api/debugapi/nf-debugapi-debugactiveprocess" title="DebugActiveProcess"}
L'attachement d'un débogueur, et l'échec attendu quand le processus en a déjà un.
::
:::

## Outils

:::ref-grid
::ref-card{url="https://github.com/x64dbg/x64dbg" title="x64dbg"}
Le débogueur qui se heurte au Debug Blocker de la section 1.
::

::ref-card{url="https://hex-rays.com/ida-pro" title="IDA Pro"}
Le point de vue statique, celui que les nanomites cassent.
::
:::

## Sur ce blog

:::ref-grid
::ref-card{url="/posts/l-obfuscation-via-la-virtualisation" title="L'obfuscation via la virtualisation"}
La suite logique de cette technique : cacher le code entier, plus seulement un saut.
::

::ref-card{url="/posts/steamworks-le-jeu-vous-croit-sur-parole" title="Steamworks : le jeu vous croit sur parole"}
Le cas inverse : une vérification qu'aucune protection ne défend.
::
:::
