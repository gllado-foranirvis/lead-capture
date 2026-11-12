# CRO d'Enertech 2026: claredat, perfilació recuperada i mesura al full (abans del 19/11/2026)

Encàrrec d'Olga (12/11/2026) a partir d'una auditoria CRO externa, filtrada amb les seves decisions. Va sobre la branca `feat/feria-portugal` (encara sense fusionar). Si es contradiu amb `2026-11-12-feria-portugal.md`, guanya aquest document.

## Per què
El visitant escaneja el QR a l'estand, dempeus, amb una mà i poc temps. Segons Olga, on es perd més gent és en **entendre què veu i què ha de fer**. L'objectiu és que en 3 segons quedi clar «descarrego el dossier del producte que m'interessa» i que hi hagi una sortida ràpida (WhatsApp / e-mail) per a qui no vol perdre temps.

## Meta, no-meta, anti-meta
- **Meta.** Més visitants que acaben la descàrrega; claredat del primer ecrà; no perdre dades de perfilació; mesurar-ho tot al full de Google.
- **No-meta.** Cap analítica de tercers (GA4); cap canvi de marca ni de PDF; res d'optimitzar el pes dels PDF.
- **Anti-meta.** Afegir cookies o avís de consentiment; que el lead es perdi si algú abandona al pas 2; tornar a posar passos redundants.

## Decisions d'Olga
1. **Pàgina d'inici (opció B de la maqueta, revisada per la crítica).** Fira «Enertech 2026». **Títol emocional però genèric**, que val per a qualsevol producte o PDF que pugui oferir The Silent Fleet (no «barco elétrico»); proposta de partida en portuguès: «Descobre o mar em silêncio», amb la frase «Escolhe o teu produto e descarrega já o dossier» (textos finals en PT/EN/ES/CA, del builder). Productes (checkboxes múltiples + «asesoramiento» excloent) i ciutat, com ara. Botó principal «Descarregar dossier →» (substitueix «Quero saber mais sobre a The Silent Fleet»), amb un «PDF em inglês» discret al costat quan l'idioma no és l'anglès. **Sota el botó, la dreçera** WhatsApp / e-mail amb una frase tipus «Prefiro falar já». **La tira de 4 passos (Produto → Dados → Interesse → PDF) NO surt a l'inici**: apareix a partir del pas 1, amb el pas actual marcat. La pantalla d'inici ha de tenir el botó principal dins la primera pantalla a 360×740 amb marge (avui toca el límit, a y=740): imatge reduïda a una franja, enllaços legals sota el plec. La confirmació no repeteix la tira.
2. **Recorregut.** `entry → step1 (dades) → step2 (perfilació) → done`. Els productes triats a l'inici es veuen **marcats i es poden canviar** a step1 (com ara; no es transforma en resum).
3. **Dades (step1).** Nom **obligatori**. **Almenys un dels dos, e-mail o telèfon**, és obligatori; l'altre és opcional. Prefix per defecte **+351**. La validació diu «Deixa-hi l'e-mail o el telèfon» als dos camps si no n'hi ha cap. El text de privacitat **no s'adapta** segons el que s'ompli.
4. **Perfilació (step2), tal com era abans.** Es recuperen les preguntes de l'antic pas 2, que vaig treure per error de la versió de la fira: Quem és (particular/profissional, **l'únic obligatori**), embarcació actual, embarcació elèctrica, entusiasme, preocupacions, intenció de compra, factors decisius, comentaris. **La pregunta de localitat per a la demostració surt** (la ciutat ja es demana a l'inici). El codi original és a l'historial de git abans del commit `0debb6a` (`step-profile.js`, `chips.js`, `FIELD_ORDER`, `emptyForm`, `session.js`, `lead.js`, `payload.js`, `flow.js`).
4b. **Es pot saltar la perfilació (decisió d'Olga).** Un cop deixades les dades de contacte (step1), el pas 2 ofereix «Saltar i descarregar» al costat d'«Enviar». Saltar porta directe a la confirmació amb els PDF. «Quem és» només és obligatori si el visitant envia el formulari de perfilació, no si el salta. *(Decisió del redactor: en saltar es desa `stage: 'complete'` amb el perfil buit, perquè el full distingeixi «va saltar» de «no va arribar»; ho distingeix també la columna de perfil buida.)*
5. **Lead.** Es **desa en acabar step1** (`stage: 'step1'`, el servidor ja l'accepta) i es **completa en acabar step2** (`stage: 'complete'`, upsert per `id`). Així un abandonament al perfil no perd el contacte.
6. **Mesura al full, no GA4.** La pestanya `Clics` registra, a més dels clics de WhatsApp/e-mail, dos esdeveniments nous: **lead enviat** (en acabar step1) i **descàrrega del PDF** (clic al botó de la confirmació). Cada fila amb producte, ciutat, dispositiu, `visit`, origen del botó (inici o confirmació), etc., com ara. Cap cookie nova.
7. **Ja fet (no es repeteix).** `autocomplete`, `inputmode` i `type` correctes als camps (`site/js/form/hints.js`); la imatge d'inici ja és `.webp` (66 KB mòbil, 149 KB escriptori); els enllaços de WhatsApp i e-mail ja porten producte i ciutat.

## Millores de la crítica d'Impeccable (22/32; Olga: tot integrat a aquest spec)
- **Pas 2 (perfilació).** «Saltar i descarregar» és **igual de visible que «Enviar»** (no un enllaç petit). «Quem és» primer; la resta de preguntes, visiblement **opcionals** i en grups plegables; botons sempre a l'abast. Una frase al pas 1 avisa que només queden unes preguntes opcionals abans del PDF.
- **Pas 1 (dades).** Una línia sobre els camps: «Basta o e-mail ou o telemóvel». Etiquetes «um dos dois» en lloc d'asterisc; un **sol** error si falten tots dos; el prefix +351 només es mostra en enfocar el telèfon. Nom obligatori.
- **Camí de fallada (mala cobertura).** Cap escriptura (lead, descàrrega, clic) **bloqueja** mai el PDF ni la navegació. Reintent silenciós amb cua (ja existeix al sender) i un indicador discret «dados guardados» quan el lead s'ha desat. El PDF funciona encara que la mesura falli.
- **Accessibilitat.** La tira conserva el `role="progressbar"` i l'`aria-valuetext` de `step-indicator.js`.
- **Mètrica de descàrregues.** Una fila per fitxer baixat (veure més avall); l'enllaç entre lead i descàrregues és el `visit`.
- **Fora d'abast per decisió d'Olga:** cap.

## Decisions preses pel redactor (Olga les pot revertir)
- **Esdeveniments a `Clics`.** Es mantenen les columnes existents (les files velles no es mouen). El camp `button` accepta també `lead` i `download`; `from` accepta `step1` per al lead. Un lead és **anònim**: no porta l'`id` del lead. Una descàrrega = **una fila per cada PDF descarregat** (un clic a «descarregar tots» en genera tantes com PDF).
- **Només «asesoramiento» o cap producte.** La tira, el títol i el botó es queden igual; la confirmació continua amb el text «gràcies, ja tenim les teves dades» i sense PDF (regla de l'spec de la fira).
- **Servidor.** `sanitizeLead` passa d'exigir tots dos a exigir **almenys un** de telèfon/e-mail, amb comprovació de format del que hi sigui; el `complete` accepta el mateix. El servidor s'ha de redesplegar **abans** de publicar el frontend.

## Restriccions
- Mobile first; cada pantalla ha de cabre sense scroll a 360×740 allà on sigui possible. Step2 és llarg: el que ha de veure primer queda dalt i el botó sempre accessible.
- KISS / DRY / TDD; commits petits en català sense `Co-Authored-By`; branca de feina i PR; el servidor de Google s'ha de redesplegar a mà abans de fusionar.
- Idiomes PT, EN, ES, CA (defecte `pt`).

## Què queda al builder
Textos exactes de la tira de passos, del títol i de la dreçera en 4 idiomes; com es veu la tira a step2 i a la confirmació; si l'èxit del step1 canvia l'indicador; com es documenten els dos esdeveniments nous als textos de privacitat/cookies (només en llistar dades reals ja existents, sense reformulacions legals).

## Riscos que cal vigilar
- Retornar el pas 2 amb 9 preguntes baixa la conversió: és una decisió d'Olga, però s'ha de mesurar amb la nova mesura (lead enviat vs lead complet vs descàrrega).
- El comptatge de visites per `visit` en memòria no distingeix persones.
