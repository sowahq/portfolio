---
title: "J'ai reverse un frigo de voiture (oui.)"
seoTitle: "Reverse d'un frigo de voiture Tuya BLE (oui.)"
description: "Mon frigo de voiture s'est retrouvé bloqué sur une appli Tuya payante. J'ai reverse son protocole Bluetooth pour le piloter moi-même, sans cloud."
pubDate: 08/20/2026
image: /blog-img/reverse-frigo-de-voiture-tuya-ble/header.png
tags: ["reverse engineering", "bluetooth", "tuya", "frida", "react native"]
slug: reverse-frigo-de-voiture-tuya-ble
published: true
cible: "frigo de voiture"
protocole: "Tuya BLE"
outils: ["bleak", "frida", "jadx"]
ateliers: ["matériel", "mobile"]
court: "frigo Tuya BLE"
---

# Introduction

J'ai un frigo de voiture. Un vrai, à compresseur, qui descend bien en dessous de zéro dans le coffre. Et comme tout est « smart » aujourd'hui, il se pilote en Bluetooth depuis le téléphone.

Sauf que j'ai fait une bêtise à l'installation : j'ai téléchargé la mauvaise app. Le frigo est compatible Tuya, donc n'importe quelle app Tuya officielle aurait fait l'affaire. Mais je suis tombé sur un reskin tiers, payant, et je l'ai appairé avec. Résultat : mon frigo s'est verrouillé sur l'appkey de cette app payante, et en prime son Bluetooth refusait de se connecter proprement chez moi.

Donc j'ai fait ce que je fais toujours dans ces cas-là : j'ai voulu comprendre comment il parle, et lui parler moi-même. Sans l'app payante, sans cloud.

Ce post raconte le pourquoi et le comment. Comment un frigo à 200 balles se retrouve à causer un protocole chiffré de Tuya, pourquoi la clé pour le piloter n'est ni devinable ni brute-forçable, et comment je l'ai quand même récupérée sans cracker le paywall ni la protection anti-tamper de l'app.

⚠️ On parle de **mon** frigo, lié à **mon** compte. C'est de l'interopérabilité avec mon propre matériel, pas un tuto pour taper le voisin. Aucune protection technique n'a été contournée : ni le paywall, ni l'anti-tamper de l'app. La clé que je récupère existe déjà dans mon compte, je la lis avec mes propres identifiants, c'est tout. ⚠️

# 1. Reconnaissance : qui parle sur le Bluetooth ?

Première étape, écouter. J'ai sorti [bleak](https://github.com/hbldh/bleak) et scanné le Bluetooth Low Energy autour de moi pour voir ce qui annonce quoi.

Un appareil sort du lot, nommé `TY`, avec un service `0xa201` et un manufacturer ID `0x07D0`. `0x07D0`, c'est `2000` en décimal, et c'est l'identifiant de **Tuya**. Le frigo n'est pas un truc maison : c'est un module Tuya BLE rebadgé, comme des milliers d'objets « smart » chinois.

Pour être sûr que ce `TY` est bien mon frigo et pas une prise connectée du voisin, j'ai fait le test le plus con qui soit : j'ai débranché le frigo. Le `TY` a disparu des annonces, et n'est pas revenu pendant une minute. C'est lui.

## 1.1. Décoder l'annonce

L'annonce Tuya n'est pas vide, elle contient des infos sur l'appareil. Le format est documenté par la lib de référence : le début identifie un « product id », et la fin contient l'UUID du device, **chiffré en AES-128-CBC** avec une clé dérivée du product id. On peut donc le déchiffrer hors ligne :

```python
import hashlib
from Crypto.Cipher import AES

service_data = bytes.fromhex("008fd302f709ca62e5")
mfr = bytes.fromhex("82030000010063e6d30ad78a6d2cccc2bde8638df292")

raw_product_id = service_data[1:]
is_bound = (mfr[0] & 0x80) != 0     # lié à un compte ?
raw_uuid = mfr[6:]

key = hashlib.md5(raw_product_id).digest()
uuid = AES.new(key, AES.MODE_CBC, key).decrypt(raw_uuid)
print(uuid.decode())   # yyjqe050z0bs9606
```

On récupère l'UUID `yyjqe050z0bs9606`, la version du protocole (3), et un flag `is_bound` qui vaut vrai : **le frigo est déjà lié à un compte**. Il va falloir composer avec ça.

# 2. Le mur : le local_key

Le profil GATT confirme le protocole Tuya BLE : service `0x1910`, une caractéristique d'écriture, une de notification. Le souci, c'est que tout le trafic applicatif est chiffré. Et pas avec l'UUID qu'on vient de sortir.

Une session Tuya BLE se dérive de deux secrets :

- le **`local_key`** : 16 caractères, émis par le cloud Tuya au moment de l'appairage ;
- le **`device_id`** : l'identifiant du device côté cloud.

La clé de login est `md5(local_key[:6])`, la clé de session `md5(local_key[:6] + srand)` où `srand` est un aléa envoyé par le frigo. Sans le `local_key`, on ne déchiffre rien, on ne signe rien, le device nous ignore. Et ce `local_key`, il n'est ni dérivable de ce qu'on a, ni brute-forçable : 16 caractères aléatoires générés par le cloud.

Donc la vraie question devient : où est stocké ce `local_key`, et comment le récupérer sans être le cloud Tuya ?

## 2.1. L'app qui détient la clé

Le frigo est lié dans une app tierce, un reskin payant construit sur le SDK mobile de Tuya (rebaptisé « thingclips » dans les classes). Cette app connaît le `local_key` : elle l'a téléchargé du cloud au moment de l'appairage, et elle s'authentifie auprès du frigo avec.

Première idée, la mauvaise : patcher l'app pour virer le paywall et lire la clé. Deux problèmes. Un, contourner un paiement, ce n'est pas le sujet et je ne le fais pas. Deux, c'est inutile : le paywall verrouille l'UI de contrôle, pas la synchro de la clé. La clé descend du cloud à la connexion, gratuit compris. Le paywall n'est pas le mur. Le mur, c'est d'arriver à lire cette clé quelque part.

# 3. Les impasses (parce qu'il y en a eu)

Un reverse, ce n'est jamais une ligne droite. Voici les pistes que j'ai suivies avant de trouver la bonne. Elles expliquent pourquoi j'ai fini par prendre ce chemin-là.

## 3.1. La signature cloud

Pour parler à son cloud, le SDK Tuya signe chaque requête. La clé de signature est composée de plusieurs morceaux propres à l'app, dont un token stocké de façon obfusquée dans les assets. Le sujet est déjà documenté publiquement par [nalajcie](https://github.com/nalajcie/tuya-sign-hacking), sur une version plus ancienne du SDK.

Sur mon app, l'obfuscation a changé. Mais le passage que je préfère, c'est qu'on n'a pas besoin de la reverser : la lib native du SDK sait déjà lire ses propres secrets. On la fait tourner, on lui demande, elle répond. J'assemble la clé de signature, je reconstruis une requête côté Python, et je l'envoie.

Le serveur renvoie `SING_VALIDATE_FALED_4` : signature refusée. Le calcul exact ne colle pas.

## 3.2. La signature n'est pas un simple HMAC

J'ai fait un oracle : j'ai fait tourner l'app dans un process que je contrôle, et je lui ai fait signer mes requêtes avec sa propre fonction native. Refusé pareil. Conclusion : la signature de l'app v7 n'est pas le HMAC-SHA256 documenté, le natif fait autre chose (le code d'erreur `_4` sent la version d'algo). Reverser ça, plus le handshake RSA du login par-dessus, c'était des heures de reverse natif avec, au bout, le risque de verrouiller mon compte à chaque essai de login raté.

Il fallait une autre approche. Une qui ne reconstruit rien à la main.

# 4. Le pivot : faire bosser le SDK à ma place

L'idée qui marche est bête une fois qu'on l'a : je ne réimplémente pas le SDK, je le **fais tourner** et je lui demande le résultat.

Sur un émulateur Android rooté, avec [Frida](https://frida.re), je lance l'app payante et j'attends que son SDK s'initialise. À ce moment-là, tout est correct dans le process : la bonne signature, la bonne session cloud, tout. Il me suffit d'appeler l'API publique du SDK et de lire ce qui revient.

![Le chemin d'extraction du local_key](/blog-img/reverse-frigo-de-voiture-tuya-ble/extraction.png)

Concrètement : login avec mes identifiants, récupération de la liste des maisons, puis le détail de chaque maison qui contient les appareils. Et chaque appareil, c'est un `DeviceBean` avec une méthode `getLocalKey()` :

```javascript
Java.perform(() => {
  const ThingHomeSdk = Java.use("com.thingclips.smart.home.sdk.ThingHomeSdk");
  // login email/mot de passe, puis queryHomeList, puis getHomeDetail...
  // et sur chaque DeviceBean :
  const dev = { /* ... */ };
  send({
    name: dev.getName(),        // CAR FRIDGE
    devId: dev.getDevId(),      // iz3otinmz0wk9h85
    uuid: dev.getUuid(),        // yyjqe050z0bs9606  <- le même que l'annonce
    localKey: dev.getLocalKey() // la clé qu'on cherchait
  });
});
```

L'UUID renvoyé par le SDK est exactement celui décodé de l'annonce BLE en section 1. C'est bien mon frigo, et j'ai son `local_key`.

# 5. Parler au frigo

Avec le `local_key`, le `device_id` et l'UUID, je peux enfin ouvrir une session BLE authentifiée depuis mon Mac. Le handshake Tuya BLE se déroule comme ça :

![Le handshake Tuya BLE](/blog-img/reverse-frigo-de-voiture-tuya-ble/handshake.png)

1. On envoie `DEVICE_INFO`, chiffré avec la clé de login `md5(local_key[:6])`.
2. Le frigo répond avec un aléa `srand`. On en dérive la clé de session `md5(local_key[:6] + srand)`.
3. On envoie `PAIR` (UUID + clé + device_id), chiffré avec la clé de session.
4. Le frigo commence à streamer ses **datapoints**, les points de données qui décrivent son état.

Un datapoint, c'est un id, un type et une valeur. Reste à savoir lequel veut dire quoi. Le plus simple pour les mapper, c'est de parler à l'écran du frigo : je change une valeur en BLE, et je regarde ce qui bouge sur le panneau.

```plaintext
DP101  bool   power on/off
DP103  enum   mode froid       0 = max, 1 = eco
DP104  enum   protection batt.  0 = low, 1 = med, 2 = high
DP105  enum   unité             0 = °C, 1 = °F
DP113  value  température du bac (°C)
DP114  value  consigne (°C)     <- réglable
DP122  value  tension x10       124 = 12.4 V
```

Chaque ligne a été vérifiée en direct : j'écris `DP114 = 10`, l'écran affiche 10 ; je passe `DP103` à 1, le frigo passe en mode eco. Un dernier piège au passage : les valeurs sont des entiers signés sur 32 bits, et ma consigne était négative (-10 °C). Lue en non-signé, elle s'affichait `4294967286`. Détail, mais c'est le genre de détail qui fait qu'un chiffre a l'air cassé alors que c'est juste le bit de signe.

# 6. Et pourquoi pas juste Tuya Smart ?

Question légitime : Tuya a une app officielle et gratuite, « Tuya Smart ». Pourquoi ne pas y ajouter le frigo et oublier tout ça ?

Parce que le frigo est link à une **appkey**. Chez Tuya, un appareil appairé via une app appartient au pool de comptes de cette appkey. Le frigo a été activé sous l'appkey du reskin payant (la mauvaise app du tout début), qui est une appkey tierce, différente de celle de Tuya Smart officiel. Un appareil du pool A est invisible pour une app du pool B. Tuya Smart ne le voit même pas. En gros : j'ai installé le frigo avec la mauvaise app, et il est resté bloqué dans cet écosystème.

Pour l'en sortir, il faudrait un reset qui casse cette association. Or ce firmware ignore les commandes d'unbind BLE, et le reset usine physique ne remet que les réglages, pas le lien. Le frigo est collé à cette appkey.

C'est un cul-de-sac, mais un cul-de-sac qui n'a aucune importance pour la suite : mon app ne passe pas par le cloud ni par une appkey. Elle parle au frigo en BLE direct, avec le `local_key`. Le binding, elle s'en fiche.

# Conclusion

Un frigo à 200 balles cache le même SDK Tuya que des milliers d'objets « smart », avec le même point faible : tout le contrôle local tient à une seule clé. Et si l'appareil et le compte sont à toi, cette clé aussi. Le plus simple pour la récupérer, c'est de laisser le SDK faire le boulot au lieu de le refaire à la main.

Avec le `local_key` et les datapoints mappés, j'ai tout ce qu'il faut pour piloter le frigo en BLE direct. Je m'en suis fait une petite app, histoire de ne plus dépendre du cloud ni de l'app payante. Mais l'intéressant était dans le chemin pour en arriver là.

# Références

## Outils utilisés

:::ref-grid
::ref-card{url="https://frida.re" title="Frida"}
Instrumentation dynamique : faire tourner le SDK de l'app et appeler son API. Section 4.
::

::ref-card{url="https://github.com/hbldh/bleak" title="bleak"}
Le scan BLE et la session locale avec le frigo depuis Python. Sections 1 et 5.
::

::ref-card{url="https://github.com/skylot/jadx" title="Jadx"}
Décompilation de l'APK pour retrouver les classes du SDK et le flux de login.
::

::ref-card{url="https://github.com/nalajcie/tuya-sign-hacking" title="tuya-sign-hacking"}
Le point de départ sur la signature Tuya et son token caché dans les assets. Section 3.
::
:::

## Protocole & SDK

:::ref-grid
::ref-card{url="https://github.com/PlusPlus-ua/tuya_ble" title="tuya_ble (implémentation de référence)"}
Le déroulé exact du handshake et l'encodage des datapoints, que j'ai porté en TS. Section 5.
::

::ref-card{url="https://developer.tuya.com/en/docs/iot-device-dev/BLE-communication" title="Tuya : communication BLE"}
La doc officielle du protocole BLE côté device.
::
:::

## Sur ce blog

:::ref-grid
::ref-card{url="/posts/les-qr-codes-de-basic-fit-comment-ca-fonctionne" title="Les QR Codes de Basic Fit : comment ça fonctionne ?"}
Un autre reverse d'app mobile, du scan à la reconstitution du format.
::

::ref-card{url="/posts/steamworks-le-jeu-vous-croit-sur-parole" title="Steamworks : le jeu vous croit sur parole"}
Quand la confiance est mal placée : une vérification faite côté client n'en est pas une.
::
:::
