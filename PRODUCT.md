# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Lloc estàtic a `site/`: HTML/CSS/JS pla amb mòduls ES, React 18.3 UMD local i els components `window.TSF` del sistema de disseny `the-silent-fleet-ds/`. Sense bundler. Node només per a tests i scripts. Destí previst: GitHub Pages (no hi ha cap repo remot encara).

## Users

- **Visitant del Salón Náutico de Barcelona (14–18/10/2026).** Arriba pel QR impres o una pegatina NFC a l'estand, des del seu mòbil, dret i amb cobertura possiblement dolenta. Vol contactar amb The Silent Fleet. Es qualifica opcionalment com a distribuïdor/gran volum o particular interessat.
- **Bruno i l'equip de l'estand de The Silent Fleet.** Reben els contactes per WhatsApp i correu i parlen amb els visitants a l'estand.

## Product Purpose

Una pàgina única i en 4 idiomes (CA/ES/PT/EN) perquè els visitants de la fira puguin contactar amb TSF per WhatsApp o correu en pocs segons, amb un missatge ja escrit segons idioma i perfil. Èxit: cada visitant que vulgui parlar té un camí directe que funciona, també amb mala cobertura, i la pàgina és a punt abans de la congelació del 13/10/2026.

## Positioning

Propulsió elèctrica silenciosa per a embarcacions: TSF presenta el canvi cap a la propulsió elèctrica nàutica en conversa directa, no com a catàleg.

## Operating Context

- Ús en una fira, de peu, amb una mà, al mòbil; el QR i l'NFC porten a la pàgina.
- Calendari fix: construcció 10–12/10, congelació 13/10, fira 14–18/10/2026.
- Els contactes arriben a WhatsApp Business i a info@thesilentfleet.com; l'MVP no desa cap dada. Amb l'Extra 1 actiu, els leads es desen a un Google Sheet (vegeu `docs/google-sheet.md`).
- Hi ha un pla de contingència: dos QR d'emergència (WhatsApp directe i una targeta de contacte).

## Capabilities and Constraints

- MVP: selecció d'idioma, perfil opcional, WhatsApp i correu sempre actius amb missatge predefinit (12 combinacions idioma × perfil), privacitat i cookies.
- Extra 1 (flux de captació en 2 passos amb perfilació i dossier segons el model triat, o el general): **actiu a la fira** (decidit el 9/10/2026) amb l'interruptor `extra1` de `config.js`; amb `false` torna l'MVP sol. Emet esdeveniments `window` i, si `leadEndpoint` té una URL, els envia a un Google Apps Script que desa una fila per lead (desplegat i provat; guia a `docs/google-sheet.md`). Detall al README.
- Fora de l'abast actual: enviament del correu amb el dossier, correu de seguiment (Extra 1b), Linktree, NFC, analítica i banner de cookies. L'estructura ha de permetre afegir-los sense reescriure.
- Cost recurrent 0 €. L'MVP no desa dades ni usa cookies, `localStorage` ni analítica; l'Extra 1, quan s'activi, recollirà dades de contacte i perfilació amb el consentiment del visitant (text de privacitat pendent de Bruno).
- Cap petició externa per a estil o scripts (cobertura dolenta): React i Montserrat són locals.
- Terminologia: «The Silent Fleet», «Salón Náutico». Els perfils: a l'MVP «Distribuïdor o professional» / «Particular»; a l'Extra 1 «Particular» / «Profesional» (el missatge de «Profesional» continua dient «distribuidor», pendent de Bruno). El document final es diu «dossier» fins que Bruno decideixi.

## Brand Commitments

- El sistema de disseny `the-silent-fleet-ds/` és vinculant com a font de veritat visual i de contingut (to, components, tokens).
- El nom de marca és text en `wordmark`; no hi ha logotip dibuixat i no se n'ha d'inventar cap. Si Bruno en té, l'ha de subministrar.

## Evidence on Hand

- Proposta v2, spec i wireframes de l'Extra 1: són confidencials (porten preus) i viuen només en local, a `docs-privats/`, que no és al repositori.
- Sistema de disseny local `the-silent-fleet-ds/` amb tokens, 21 components i pantalles d'exemple.
- **Dades de prova, no reals:** número de WhatsApp, URL de GitHub Pages, textos de la pàgina (títol, subtítol, missatges, privacitat) i noms dels perfils. No hi ha fotografies ni logotip, i els productes (Modelo A/B/C) i el dossier (`dossier-prova.pdf`) són de prova. No s'han de presentar com a confirmats.

## Product Principles

1. El camí de contacte directe (WhatsApp i correu) sempre funciona, també sense JavaScript o amb mala xarxa.
2. Un sol gest principal per pantalla i res que obligui el visitant a parar-se a pensar.
3. L'MVP no recull dades que no necessita: res desat, cap cookie.
4. Els idiomes són iguals: cap literal sense traduir i canviar d'idioma no fa perdre l'estat.
5. Tot el que encara és de prova es marca com a tal i es substitueix abans de la fira.

## Accessibility & Inclusion

WCAG AA: contrast de text ≥ 4,5:1, zones tàctils ≥ 44px, focus visible, errors amb text i no només color, ús d'una sola mà a 360px.
