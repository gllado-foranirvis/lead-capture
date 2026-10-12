# Auditoria · pantalla de gràcies amb descàrrega del dossier

`/impeccable audit` (12/10/2026) sobre `site/js/ui/done-screen.js`, `site/css/page.css` (bloc `page__done-*` / `page__doc*`), el cablejat de `site/js/app.js` i `site/js/icons.js`. Només documenta; no s'ha corregit res perquè no hi ha P0 ni P1.

## Com s'ha comprovat
- Detector `impeccable detect` sobre els 4 fitxers: **cap troballa** (sortida buida, exit 0).
- `npm test`: 246/246.
- Navegador integrat, dades inventades, peticions al full de Google interceptades (cap lead real enviat), `window.open` a 0:
  - 360×740, ES, Modelo A, clar → mesures de caixes, contrast (colors calculats), ordre de tabulador, desbordament.
  - Mateix cas amb `data-theme="dark"` (contrast) i amb text al 200 % (`font-size: 200%` a `<html>`).
  - 360×740, PT, Modelo C (dossier general).
  - 360×568 (mòbil curt) i 768×1024 (tauleta).
- **No comprovat:** gestos tàctils reals / dispositiu físic, lector de pantalla, `prefers-reduced-motion` emulat (només lectura de codi: l'animació és el `screen-in` existent dins `no-preference`), comportament de `download` a iOS Safari.

## Puntuació

| # | Dimensió | Nota | Troballa clau |
|---|---|---|---|
| 1 | Accessibilitat | 3 | Dos enllaços al mateix fitxer amb noms diferents per a lector de pantalla (P2) |
| 2 | Rendiment | 4 | Una pantalla estàtica, cap imatge, cap animació nova |
| 3 | Tematització | 4 | Només tokens; contrast correcte en clar i fosc |
| 4 | Responsiu | 4 | Sense desbordament a 360, 568 d'alçada, 768 ni amb text al 200 % |
| 5 | Integritat d'implementació | 3 | La targeta replica el marcatge `tsf-pdf` del sistema (P3) |
| | **Total** | **18/20** | **Excel·lent (només polit)** |

## Veredicte d'integritat
**Passa.** Cap color fix, cap valor màgic (`3.5rem` + `aspect-ratio`, no píxels), literals en 4 idiomes, cap «PDF» visible, la descàrrega i el nom venen de `CONFIG`, i no es toca `site/ds/`. El detector no troba res.

## Resum
- Incidències: **0 P0, 0 P1, 1 P2, 5 P3.**
- Mesures reals (360 px, ES): marca 56×56 amb contrast 5,71 (clar) / 8,67 (fosc); text secundari de la targeta 5,95 / 8,99; títol 18,5 / 16,8; botó de descàrrega, WhatsApp, correu i «Volver al inicio» de 44 px d'alçada i 312 d'amplada; targeta de 72 px; cap element retallat. L'ordre de tabulador és idioma → Descargar → WhatsApp → Correo → Volver; el focus aterra al títol en entrar. PT i el zoom del 200 % no desborden. El Modelo C ofereix el dossier general (`the-silent-fleet-dossier.pdf`).

## Incidències

**[P2] La targeta i el botó són dos enllaços al mateix fitxer per a lector de pantalla**
- Ubicació: `site/js/ui/done-screen.js` (`a.page__doc` amb `tabIndex: -1` + `a.tsf-btn`).
- Categoria: Accessibilitat. Impacte: amb `tabIndex: -1` el teclat només passa pel botó, però el lector de pantalla en mode lectura troba dos enllaços («Dossier The Silent Fleet Modelo A» i «Descargar el dossier») cap al mateix PDF. WCAG 2.4.4 (propòsit de l'enllaç): compleix, però és redundant.
- Recomanació: deixar-ho (decisió d'Olga: targeta clicable) o amagar la targeta a les tecnologies d'assistència (`role="presentation"` a l'enllaç no és fiable; l'alternativa neta és que la targeta no sigui enllaç i el clic el reculli un `onClick` que dispari la descàrrega del botó). Suggerit: `/impeccable harden`.

**[P3] El marcatge de la targeta replica `tsf-pdf` del sistema de disseny**
- `done-screen.js`: es fa servir `tsf-pdf`, `tsf-pdf__text`, `tsf-pdf__title`, `tsf-pdf__meta` perquè `T.PdfCard` porta la insígnia «PDF» fixa. Si el sistema canvia, cal revisar-ho. Recomanació: demanar al sistema una variant amb icona (`icon` a `PdfCard`) i tornar al component. `/impeccable extract`.

**[P3] Mòbil curt (360×568): 20 px de scroll**
- `.page--form` (`min-height: 100dvh`) més el `padding-bottom` de `.page` (`--space-5`) deixa el document a 588 px. El contingut hi cap sense solapar-se; només es pot arrossegar 20 px. Recomanació: res o reduir el padding inferior d'aquesta pantalla. `/impeccable layout`.

**[P3] Tauleta (768): buit d'uns 420 px entre el botó i els CTA**
- És el comportament del wireframe (CTA ancorats al peu). A una pantalla alta queda molt espai buit. Recomanació: limitar l'alçada mínima o centrar el bloc a partir de `768px`. `/impeccable layout`.

**[P3] «Dossier The Silent Fleet» és un literal repetit als 4 idiomes**
- `site/js/i18n-form.js` (`doneCardTitle`): duplica `CONFIG.brand`. Si la marca canvia, cal tocar-ne quatre. `/impeccable clarify`.

**[P3] El tema fosc no s'activa mai (preexistent, fora de l'abast)**
- `site/index.html` fixa `data-theme="light"` i no hi ha cap commutador. Els tokens fosos de la pantalla s'han verificat commutant l'atribut a mà. No és un defecte d'aquesta funcionalitat.

## Positius
- Cap obertura automàtica: el visitant decideix, i el focus va al títol.
- Colors només amb tokens, contrast AA ampli en clar i fosc, `aspect-ratio` en lloc d'alçades en px.
- La descàrrega i el seu nom són configurables per model, amb fallback al general.
- Cap desbordament amb PT, text al 200 %, mòbil curt ni tauleta.
- Cap lead enviat durant les proves (peticions interceptades).

## Accions recomanades
1. **[P2] `/impeccable harden`**: decidir si la targeta clicable es manté o passa a `onClick`, i per a lector de pantalla.
2. **[P3] `/impeccable layout`**: padding inferior al mòbil curt i alçada del buit a la tauleta.
3. **[P3] `/impeccable extract`** i **`/impeccable clarify`**: variant del sistema amb icona i literal de marca únic.

Cap correcció pendent és bloquejant. No cal `/impeccable polish` (no s'ha tocat codi després de l'auditoria).
