# Pantalla de gràcies amb descàrrega del dossier

Substitueix l'obertura automàtica del dossier de `2026-10-09-dossier-per-model.md`. Wireframe «3 · Gracias + PDF»: logo i idioma a dalt; marca d'èxit; títol i subtítol; targeta del PDF; botó «Descargar el dossier»; i, a baix, els mateixos CTA que l'MVP (WhatsApp i Correu electrònic).

## Comportament
- En enviar el formulari **no s'obre cap pestanya**: s'envia el lead, es neteja el formulari i es mostra la pantalla de gràcies.
- El dossier que ofereix la pantalla és el mateix de sempre (`dossierFor`: el del model triat o, si no n'hi ha, el general).
- «Descargar el dossier» és un enllaç `<a href download>` amb el nom de fitxer de `CONFIG.dossierFileName` (general) o `products[].dossierFileName` (descàrrega real; iOS Safari el pot obrir en visor, però només per gest explícit del visitant).
- La targeta (classes `tsf-pdf` del sistema, amb la icona Lucide `file-text` en lloc de la insígnia «PDF» de `T.PdfCard`), el títol «Dossier The Silent Fleet» i, com a segona línia, el nom del model si té dossier propi o «Información general» si s'ofereix el general.
- Sota el botó, al peu de la pantalla: WhatsApp i Correo electrónico (els mateixos enllaços amb el missatge de la sessió que a l'entrada), i un enllaç discret «Volver al inicio» (decisió d'Olga, no és al wireframe).
- S'elimina el paràgraf d'ajuda `doneHelp` (no és al wireframe).
- Els literals continuen dient «dossier»; la paraula «PDF» ja no es veu enlloc.
- Si no hi ha cap dossier configurat, la pantalla amaga la targeta i el botó.

## Fora d'abast
Enviament del correu amb el dossier (`emailDelivery` continua només canviant el subtítol); mida del fitxer a la targeta; canvis a l'Apps Script o al full de Google.
