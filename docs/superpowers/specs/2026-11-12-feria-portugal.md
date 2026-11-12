# Feria de Portugal (Enertech 2026): canvis del formulari (abans del 19/11/2026)

Encàrrec d'Olga (12/11/2026), revisat el mateix dia amb les seves respostes. Substitueix el recorregut de 3 pantalles amb perfilació del Salón Náutico. Si es contradiu amb specs anteriors, guanya aquesta.

## Comportament
- **Pàgina 0 (inici).** Hi surt el nom de la fira, **Enertech 2026**. Desapareix la pregunta «particular o empresa». Hi ha dues preguntes que ja existien i es **mouen** aquí: el producte d'interès (el camp actual `products`: caselles de **marcatge múltiple**, 7 productes + «No lo sé aún / Busco asesoramiento» excloent) i la ciutat (el camp actual `demo`, que passa a dir-se `city`). WhatsApp i correu es mantenen.
- **Idiomes.** El selector els mostra en l'ordre **PT, EN, ES, CA**; l'idioma per defecte és `pt`.
- **Quin botó s'usa.** Cada clic al botó de WhatsApp o al de correu (a l'inici i a la confirmació) es desa al full de Google, a la pestanya `Clics`, amb dia i hora (zona horària del full) i tota la informació **anònima** que el navegador dona: botó i lloc, idioma del formulari i del navegador, origen (mòbil/tauleta), productes marcats, ciutat escrita, tipus de dispositiu i sistema, mida de pantalla, zona horària, segons des que es va obrir la pàgina, domini de procedència i un identificador de visita aleatori que només viu a la memòria de la pàgina (permet comptar visites diferents, no persones). Cap nom, correu ni telèfon.
- **Pàgina 1 (nom, correu, telèfon).** Hi surt també el producte (el mateix `products`, multi-tria): si ja s'ha triat a la pàgina 0, apareix marcat i es pot canviar. La ciutat no es torna a demanar.
- **Pàgina 2 (descàrrega).** Un PDF per producte triat. Els 7 PDF són a `site/dossiers/<id>.en.pdf` (només anglès). Es descarrega el de l'idioma del formulari i, si no existeix, l'anglès. **No hi ha PDF general de la marca** (avui): si cap producte triat té PDF (p. ex. «asesoramiento» o cap producte), la confirmació no ofereix descàrregues i usa el text de «gràcies, ja tenim les teves dades». Si un dia hi ha el general, s'afegeix a `config.js` (`brandPdf`) i ja s'ofereix amb la regla de sempre.
- **Enviament del lead.** Un sol cop, en acabar la pàgina 1 (`stage: complete`).
- **Textos de la fira.** Els missatges de WhatsApp i correu citen **Enertech 2026**, no Barcelona.
- **Mobile first, sense scroll.** Cada pantalla ha de cabre sencera (sense desplaçament) en un mòbil de 360×740 en el cas normal; on no sigui possible (p. ex. la confirmació amb molts PDF) el que s'ha de veure primer queda dalt.

## Decisions preses (Olga ho pot revertir)
1. Les preguntes de perfilació del pas 2 actual (perfil, activitat, embarcació, opinions, comentaris) **surten del formulari**. Les columnes del full es conserven; `demo` passa a dir-se `city` amb les mateixes dades.
2. Sense perfil, els missatges usen el text genèric (`messages.none`).
3. «Persones» = visites diferents (identificador aleatori en memòria), no persones identificades; una mateixa persona que recarregui la pàgina compta dues vegades.
4. La ciutat (text lliure) també va a `Clics`; el text de cookies ho diu.
5. El text de privacitat i el de cookies s'actualitzen a les dades que es desen de veritat; han de passar per revisió legal de Bruno.

## Fora d'abast
Traduir els PDF, enviar el PDF per correu, optimitzar el pes dels PDF (el més gran fa 17 MB).

## Dades que arriben
7 PDF en anglès, ja a `site/dossiers/`: Boatee (`boatee`), EZ Raft (`ez-raft`), Jetwave (`jetwave`), Momentum (`momentum`), SeaNXT (`seanxt`), Sifly (`sifly`) i TKO (`tko`). Es tracten només com a fitxers.
