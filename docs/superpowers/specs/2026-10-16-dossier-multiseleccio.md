# Dossier: reactivar-lo i triar més d'un model

Reactiva el dossier (avui `dossier: false` a `site/js/config.js`) i fa que la pregunta «Modelo o potencia de interés» sigui de **marcatge múltiple**. Substitueix la tria d'un sol model de `2026-10-09-dossier-per-model.md`; la resta (un PDF per model, el general com a alternativa) no canvia.

## Comportament
- Al pas 2 el visitant pot marcar un o més models. «No lo sé aún / Busco asesoramiento» és excloent: marcar-lo desmarca els models i marcar un model el desmarca.
- La confirmació mostra una targeta de descàrrega per cada PDF **diferent**: els models amb dossier propi, i el general (una sola vegada) si algun model triat no en té o no n'hi ha cap de triat.
- Amb 1 PDF, la confirmació és la de sempre. Amb 2 o més, cada targeta descarrega el seu fitxer i apareix un botó «Descargar todos los dossiers» que els descarrega tots seguits.
- `?producto=<id>` continua preseleccionant un sol model (o «asesoramiento»).
- El full de Google continua amb la columna `product`, ara amb els ids separats per comes (`model-a,model-b`). Cal tornar a desplegar l'script (nova versió) perquè l'accepti; amb l'script antic el producte quedaria buit, però el lead no es perd.
- WhatsApp i correu llisten els noms triats separats per comes.

## Fora d'abast
ZIP únic (no hi ha pas de compilació ni llibreria), canvis de literals del titular, enviament del dossier per correu.

## Risc conegut
Chrome i Safari poden demanar permís per a «descàrregues múltiples» la primera vegada; per això les targetes individuals es mantenen sempre com a alternativa.
