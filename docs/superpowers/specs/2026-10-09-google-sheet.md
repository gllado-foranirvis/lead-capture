# Extra 1 · enviament dels leads a un Google Sheet

Fa que les respostes del flux de 2 passos arribin a un full de càlcul de Google, sense servidor propi i amb cost 0 €. Complementa `2026-10-09-extra1-reordenat.md`: aquell deixava el flux emetent dos esdeveniments `window` (`tsf:lead-partial` i `tsf:lead`) i aquest els envia.

## Decisions de disseny
1. **Google Apps Script com a «backend».** Un script de Google lligat al full de càlcul exposa una URL pública (`/exec`) que accepta un `POST`. Cap servidor ni cost. El full és de Bruno (compte de Google; el text de privacitat ja diu que Google actua com a encarregat del tractament).
2. **Una fila per lead, identificada per `id`.** El pas 1 crea la fila (`stage = step1`); l'enviament final la completa (`stage = complete`) amb la mateixa `id`. Així un reintent mai duplica una fila i un lead abandonat al pas 2 queda amb el seu contacte.
3. **Mai no es degrada.** Si un parcial arriba tard (reintent) després del final, s'ignora.
4. **Mai no es desa un lead sense consentiment.** El servidor rebutja qualsevol lead amb `privacy` diferent de `true`.
5. **Dades com a text pla.** Les columnes tenen format de text (`@`) perquè un valor que comenci per `=`, `+` o `@` no s'executi com a fórmula del full.
6. **Cobertura dolenta a la fira:** el client reintenta amb espera creixent, torna a provar en recuperar la xarxa i, en tancar la pàgina, fa un darrer intent amb `sendBeacon`. La cua és **només en memòria**: no es desa res de personal al navegador (tauleta compartida).
7. **L'enviament no bloqueja el visitant.** El dossier s'obre i es mostra la confirmació encara que l'enviament encara no hagi acabat.
8. **Interruptor:** `CONFIG.leadEndpoint` buit (per defecte) = no s'envia res; només els esdeveniments `window`.
9. **Token compartit opcional** (`leadToken` al client i la propietat `TOKEN` a l'script) per tallar el correu brossa casual. És visible al codi del web: no és un secret.

## Columnes del full (`Leads`)
`id, stage, createdAt, updatedAt, name, email, phone, profile, lang, origin, privacy, newsletter, product, activity, activityOther, hasBoat, hasElectric, enthusiasm, enthusiasmOther, concerns, concernsOther, intent, factors, factorsOther, demo, comments`. Les llistes d'opinió es desen com a opcions separades per comes.

## Fora d'abast
- El correu automàtic amb el dossier (`emailDelivery`), que és un altre pla.
- Un tauler d'estadístiques sobre el full.
- Retirada del consentiment i esborrat a petició (es fa a mà al full).

## Pendent de Bruno
- Quin compte de Google és el propietari del full i qui hi té accés (dades personals).
- Retenció de les dades i procediment per a una sol·licitud d'esborrat.
- Validar el text de privacitat (ara diu «Google (Hojas de cálculo)»).
