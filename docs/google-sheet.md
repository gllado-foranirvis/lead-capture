# Enviament dels leads a un Google Sheet

El web emet tres esdeveniments: `tsf:lead-partial` (en acabar el pas 1), `tsf:lead` (en enviar o saltar el pas 2) i `tsf:contact-click` (cada clic a WhatsApp, a correu o a la descàrrega d'un PDF). Si `CONFIG.leadEndpoint` té una URL, els envia a un Google Apps Script que desa els leads a la pestanya `Leads` (una fila per lead) i els clics a la pestanya `Clics` (una fila per clic). Sense URL no s'envia res.

## Posada en marxa

1. **Propietari.** Bruno decideix quin compte de Google serà el propietari del full. Conté dades personals: compartir-lo només amb l'equip.
2. **Full.** Crea un Google Sheet buit (el nom és igual). L'script crea les pestanyes `Leads` i `Clics` i les seves capçaleres sol. **Zona horària:** a *File → Settings → Time zone* posa Lisboa (`Europe/Lisbon`): el dia i l'hora de `Clics` són els d'aquesta zona.
3. **Script.** Al full: *Extensions → Apps Script*. Esborra el que hi ha, enganxa-hi sencer el contingut d'`apps-script/Code.gs` i desa.
4. **Token (opcional).** *Project Settings → Script properties → Add*: `TOKEN` = un valor llarg i aleatori.
5. **Desplegar.** *Deploy → New deployment → Web app*; *Execute as: Me*; *Who has access: Anyone*. Autoritza els permisos (accés al full) i copia la URL que acaba en `/exec`.
6. **Configurar el web.** A `site/js/config.js`, dins d'`ENDPOINTS`: `production` (la URL i el token del full de producció) i `test` (els del full de test). A `localhost` el web escriu al full de test; a la resta de dominis, al de producció. El token és visible al codi del web: frena el correu brossa casual, no és un secret.
7. **Prova de fum.** `node scripts/smoke-sheet.mjs <url> [token]` (amb el mateix token que hi ha a `config.js`: si no coincideix, l'script respon `token` i el web ho reintenta sense desar res). A `Leads` ha d'haver-hi una fila amb `stage` `complete`, sense correu, amb la perfilació i el nom i els comentaris com a text (`=HYPERLINK…` i `=1+1` visibles), una segona fila amb perfil buit (saltat) i cap fila per al lead sense contacte; a `Clics`, una fila de clic i una de descàrrega, amb dia i hora.
8. **Prova real.** `npm run serve`, fes el flux, prem WhatsApp i correu, i comprova la fila de `Leads` i les de `Clics`. Talla la xarxa (DevTools → Offline) abans d'enviar el formulari i comprova que arriba en tornar-la.
9. **Actualitzar l'script.** *Deploy → Manage deployments → editar → Version: New version*. La URL no canvia.
10. **Operació.** Si un visitant ho demana, esborra la seva fila a mà. El full no caduca sol (la retenció és a decidir amb Bruno).

## Com funciona
- Una fila per `id`. Un reintent no la duplica. Els leads antics de l'etapa `step1` encara s'accepten i el final els completa; un parcial tardà no degrada una fila completa.
- El servidor no desa mai un lead sense `privacy: true`.
- Columnes de `Leads`: `product` porta els ids dels productes triats separats per comes (`sifly,tko`; fins a 10) i `city` la ciutat (és l'antiga `demo`: l'script reescriu la capçalera i les dades antigues hi queden). Les columnes de perfilació (`profile`, `activity`… `comments`) s'omplen al pas 2; queden buides si el visitant el salta. Cal **almenys un** de `phone` o `email` (l'altre pot ser buit).
- **`Clics`** (18 columnes, sense nom, correu ni telèfon; el `visit` les relaciona amb el lead, vegeu més avall): `id`, `day`, `time` (zona del full), `at` (UTC), `button` (`whatsapp`/`email`/`download`; una fila per PDF descarregat, amb el seu producte a `products`), `from` (`entry`/`done`), `lang`, `origin`, `visit` (identificador aleatori de la visita, només en memòria al navegador; el lead el desa a `Leads.visit`), `products`, `city`, `device`, `os`, `browserLang`, `tz`, `screen`, `seconds` (des que es va obrir la pàgina) i `referrer` (només el domini). Una fila per clic; un reintent no la duplica.
- **`Leads.visit`** (columna 27, la darrera): la mateixa visita que porta cada fila de `Clics`. Permet saber què ha fet un lead, inclosos els clics anteriors al pas 1 mentre el visitant no recarregui la pàgina. Els textos de privacitat i cookies ho diuen.
- **Què ha clicat cada lead** (a `Leads`, tres columnes a la dreta de `visit`; l'script no les toca). Escriu als encapçalaments `AB1`, `AC1` i `AD1` `clicsWhatsapp`, `clicsCorreu` i `descarregues`, i enganxa una sola vegada una fórmula a cada una de `AB2`, `AC2` i `AD2` (s'omple sola cap avall):
  - `AB2`: `=ARRAYFORMULA(IF($AA2:$AA="";"";COUNTIFS(Clics!$I:$I;$AA2:$AA;Clics!$E:$E;"whatsapp")))`
  - `AC2`: `=ARRAYFORMULA(IF($AA2:$AA="";"";COUNTIFS(Clics!$I:$I;$AA2:$AA;Clics!$E:$E;"email")))`
  - `AD2`: `=ARRAYFORMULA(IF($AA2:$AA="";"";COUNTIFS(Clics!$I:$I;$AA2:$AA;Clics!$E:$E;"download")))`
  Els leads antics (sense `visit`) queden en blanc.
- Recomptes (a una altra pestanya): clics a WhatsApp `=COUNTIF(Clics!E:E;"whatsapp")`, a correu `=COUNTIF(Clics!E:E;"email")`, visites diferents `=COUNTUNIQUE(Clics!I:I)`.
- Les columnes tenen format de text pla, perquè un valor que comenci per `=`, `+` o `@` no s'executi com a fórmula.
- La cua d'enviament del client és només en memòria (cap dada personal al navegador): reintenta amb espera creixent, torna a provar en recuperar la xarxa i fa un darrer intent amb `sendBeacon` en tancar la pàgina o en passar a segon pla (p. ex. en obrir WhatsApp).
- L'enviament no bloqueja el visitant: la pantalla de gràcies amb el dossier surt igualment.
- **Després de cada canvi de `Code.gs`:** *Deploy → Manage deployments → editar → Version: New version* (la URL no canvia) i anota aquí la data: __/__/____.
