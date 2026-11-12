# Enviament dels leads a un Google Sheet

El web emet dos esdeveniments: `tsf:lead` (en enviar el formulari) i `tsf:contact-click` (cada clic al botó de WhatsApp o de correu). Si `CONFIG.leadEndpoint` té una URL, els envia a un Google Apps Script que desa els leads a la pestanya `Leads` (una fila per lead) i els clics a la pestanya `Clics` (una fila per clic). Sense URL no s'envia res.

## Posada en marxa

1. **Propietari.** Bruno decideix quin compte de Google serà el propietari del full. Conté dades personals: compartir-lo només amb l'equip.
2. **Full.** Crea un Google Sheet buit (el nom és igual). L'script crea les pestanyes `Leads` i `Clics` i les seves capçaleres sol. **Zona horària:** a *File → Settings → Time zone* posa Lisboa (`Europe/Lisbon`): el dia i l'hora de `Clics` són els d'aquesta zona.
3. **Script.** Al full: *Extensions → Apps Script*. Esborra el que hi ha, enganxa-hi sencer el contingut d'`apps-script/Code.gs` i desa.
4. **Token (opcional).** *Project Settings → Script properties → Add*: `TOKEN` = un valor llarg i aleatori.
5. **Desplegar.** *Deploy → New deployment → Web app*; *Execute as: Me*; *Who has access: Anyone*. Autoritza els permisos (accés al full) i copia la URL que acaba en `/exec`.
6. **Configurar el web.** A `site/js/config.js`: `leadEndpoint` = la URL i `leadToken` = el token (si n'has posat). El token és visible al codi del web: frena el correu brossa casual, no és un secret.
7. **Prova de fum.** `node scripts/smoke-sheet.mjs <url> [token]` (amb el mateix token que hi ha a `config.js`: si no coincideix, l'script respon `token` i el web ho reintenta sense desar res). A `Leads` ha d'haver-hi una sola fila, amb `stage` `complete`, i el nom i la ciutat com a text (`=HYPERLINK…` i `=1+1` visibles), no com a fórmula; a `Clics`, una sola fila amb dia i hora.
8. **Prova real.** `npm run serve`, fes el flux, prem WhatsApp i correu, i comprova la fila de `Leads` i les de `Clics`. Talla la xarxa (DevTools → Offline) abans d'enviar el formulari i comprova que arriba en tornar-la.
9. **Actualitzar l'script.** *Deploy → Manage deployments → editar → Version: New version*. La URL no canvia.
10. **Operació.** Si un visitant ho demana, esborra la seva fila a mà. El full no caduca sol (la retenció és a decidir amb Bruno).

## Com funciona
- Una fila per `id`. Un reintent no la duplica. Els leads antics de l'etapa `step1` encara s'accepten i el final els completa; un parcial tardà no degrada una fila completa.
- El servidor no desa mai un lead sense `privacy: true`.
- Columnes de `Leads`: `product` porta els ids dels productes triats separats per comes (`sifly,tko`; fins a 10) i `city` la ciutat (és l'antiga `demo`: l'script reescriu la capçalera i les dades antigues hi queden). Les columnes de la perfilació antiga (`profile`, `activity`… `comments`) es conserven buides perquè les files existents no es desplacin.
- **`Clics`** (18 columnes, tot anònim, cap nom, correu ni telèfon): `id`, `day`, `time` (zona del full), `at` (UTC), `button` (`whatsapp`/`email`), `from` (`entry`/`done`), `lang`, `origin`, `visit` (identificador aleatori de la visita, només en memòria; no identifica persones), `products`, `city`, `device`, `os`, `browserLang`, `tz`, `screen`, `seconds` (des que es va obrir la pàgina) i `referrer` (només el domini). Una fila per clic; un reintent no la duplica.
- Recomptes (a una altra pestanya): clics a WhatsApp `=COUNTIF(Clics!E:E;"whatsapp")`, a correu `=COUNTIF(Clics!E:E;"email")`, visites diferents `=COUNTUNIQUE(Clics!I:I)`.
- Les columnes tenen format de text pla, perquè un valor que comenci per `=`, `+` o `@` no s'executi com a fórmula.
- La cua d'enviament del client és només en memòria (cap dada personal al navegador): reintenta amb espera creixent, torna a provar en recuperar la xarxa i fa un darrer intent amb `sendBeacon` en tancar la pàgina o en passar a segon pla (p. ex. en obrir WhatsApp).
- L'enviament no bloqueja el visitant: la pantalla de gràcies amb el dossier surt igualment.
- **Després de cada canvi de `Code.gs`:** *Deploy → Manage deployments → editar → Version: New version* (la URL no canvia) i anota aquí la data: __/__/____.
