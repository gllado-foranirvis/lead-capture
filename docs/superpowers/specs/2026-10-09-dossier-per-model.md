# Extra 1 · un dossier per model

Substitueix la decisió 4 de `2026-10-09-extra1-reordenat.md` («un document general; el model d'interès ja no condiciona el document»): ara el dossier que s'obre al final del flux **depèn del model o potència triat**, i el document general queda com a alternativa.

## Comportament
- Cada producte de `CONFIG.products` pot tenir el seu `dossierUrl` (un PDF de `site/`). Si no en té, s'obre el document general `CONFIG.dossierUrl`.
- El document es tria amb el producte escollit al pas 2 (o preseleccionat amb `?producto=`).
- S'obre el general quan: no s'ha triat cap model, s'ha triat «No lo sé aún / Busco asesoramiento», el producte no existeix o el producte no té dossier propi.
- El botó «Abrir el dossier» de la confirmació obre el mateix dossier que s'ha obert en acabar.
- L'obertura continua sent síncrona dins del gest del clic (perquè el navegador no la bloquegi).
- Els literals no canvien (continua dient «dossier»): el titular de la confirmació no diu el nom del model. Si Bruno vol «dossier del Modelo X», és un canvi de text posterior.
- El full de Google ja desa el producte; no cal cap canvi a l'script ni als esdeveniments.

## Dades
Els models i els PDF reals són de Bruno. Mentrestant, el repositori porta PDF de prova generats per `scripts/make-test-pdf.mjs`: un de general i un per cada model que tingui `dossierUrl` (el Modelo C no en té, per provar l'alternativa).

## Pendent de Bruno
- Un PDF per model (o potència) i el general, amb els noms de fitxer.
- Quins models tenen dossier propi i quins usen el general.
