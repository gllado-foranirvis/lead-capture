# Enviament dels leads a un Google Sheet

L'Extra 1 emet dos esdeveniments (`tsf:lead-partial` i `tsf:lead`). Si `CONFIG.leadEndpoint` té una URL, el web els envia a un Google Apps Script que els desa al full, una fila per lead. Sense URL no s'envia res.

## Posada en marxa

1. **Propietari.** Bruno decideix quin compte de Google serà el propietari del full. Conté dades personals: compartir-lo només amb l'equip.
2. **Full.** Crea un Google Sheet buit (el nom és igual). L'script crea la pestanya `Leads` i la capçalera sol.
3. **Script.** Al full: *Extensions → Apps Script*. Esborra el que hi ha, enganxa-hi sencer el contingut d'`apps-script/Code.gs` i desa.
4. **Token (opcional).** *Project Settings → Script properties → Add*: `TOKEN` = un valor llarg i aleatori.
5. **Desplegar.** *Deploy → New deployment → Web app*; *Execute as: Me*; *Who has access: Anyone*. Autoritza els permisos (accés al full) i copia la URL que acaba en `/exec`.
6. **Configurar el web.** A `site/js/config.js`: `leadEndpoint` = la URL i `leadToken` = el token (si n'has posat). El token és visible al codi del web: frena el correu brossa casual, no és un secret.
7. **Prova de fum.** `node scripts/smoke-sheet.mjs <url> [token]`. Al full ha d'haver-hi una sola fila, amb `stage` `complete`, i el nom com a text (`=HYPERLINK…` visible), no com a fórmula.
8. **Prova real.** `npm run serve`, fes el flux a `?extra1=1` i comprova la fila. Talla la xarxa (DevTools → Offline) abans d'enviar el pas 1 i comprova que arriba en tornar-la.
9. **Actualitzar l'script.** *Deploy → Manage deployments → editar → Version: New version*. La URL no canvia.
10. **Operació.** Si un visitant ho demana, esborra la seva fila a mà. El full no caduca sol (la retenció és a decidir amb Bruno).

## Com funciona
- Una fila per `id`: el pas 1 crea la fila (`stage = step1`) i l'enviament final la completa (`stage = complete`). Un reintent no la duplica i un parcial tardà no degrada una fila completa.
- El servidor no desa mai un lead sense `privacy: true`.
- Les columnes tenen format de text pla, perquè un valor que comenci per `=`, `+` o `@` no s'executi com a fórmula.
- La cua d'enviament del client és només en memòria (cap dada personal al navegador): reintenta amb espera creixent, torna a provar en recuperar la xarxa i fa un darrer intent amb `sendBeacon` en tancar la pàgina.
- L'enviament no bloqueja el visitant: el dossier s'obre i la confirmació surt igualment.
