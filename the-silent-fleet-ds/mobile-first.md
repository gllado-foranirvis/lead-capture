# Mobile first

Regles de composició per a qualsevol pàgina del projecte. Es dissenya i es programa primer per a 360–767px; l'escriptori és una ampliació.

## Punts de ruptura

- Base: de 320px a 767px. Una sola columna, `gutter` de 24px, `header-h` de 56px, capçalera amb menú hamburguesa.
- `bp-md` (768px): navegació en línia, `gutter-lg`, `header-h-lg`, titulars `-lg`, seccions de dues columnes, `section-y-lg`.
- `bp-lg` (1024px): 3 columnes de targetes i 4 de característiques. El contingut no passa de `container-max`.
- CSS pla: escriu primer l'estil base i afegeix `@media (min-width: 768px)`; mai `max-width`.

## Regles

- Zona tàctil mínima `tap-min` (48px) a botons, camps i enllaços de menú, amb 8px (`space-2`) entre elements adjacents.
- Un sol eix de lectura en mòbil: cada columna de l'escriptori s'apila en l'ordre en què s'ha de llegir. En `BrandRow` el logotip va primer.
- Les imatges omplen l'amplada del contenidor amb la proporció 3:2 i `radius-md`; la portada ocupa tota l'amplada, sense marges.
- Secció: `section-y` a dalt i a baix en mòbil, `section-y-lg` des de 768px. Entre blocs d'una mateixa secció, `space-7`.
- El títol de cada secció va centrat (`SectionHeading`) quan introdueix una graella de targetes, i alineat a l'inici quan acompanya text corregut.
- El peu de pàgina s'apila: xarxes socials, contacte, formulari de subscripció, copyright. Des de 768px, les dues columnes de contacte i subscripció van alineades a la dreta.
- Els formularis són d'una sola columna a tots els amples, amb l'etiqueta damunt del camp, ample màxim de 560px i el botó d'enviar centrat.

## Receptes de pàgina

- **Inici / Moviment.** `SiteHeader`, `Hero` (títol + CTA), `SectionHeading` «Missão», bloc `body-lg` «Sobre nós», imatge destacada amb `radius-lg`, `SectionHeading` «Juntos na Transição» amb tres `ImageCard`, `SiteFooter`.
- **Marca / producte.** `SiteHeader`, `Hero`, `SectionHeading` «Nuestra Gama», `ProductCard` ×2, grup de `FeatureItem` en 1 columna (2 des de 768px, 4 des de 1024px), `SiteFooter`.
- **Marcas.** `SiteHeader`, `SectionHeading` amb subtítol, un `BrandRow` per partner alternant costat (`reverse`) des de 768px, `SiteFooter`.
- **Contacto.** `SiteHeader`, títol `h1`/`h1-lg` amb dues línies de `body`, `Field` ×4 + `Button` sòlid, bloc de correu, dues ciutats (Porto, Barcelona) amb telèfon i foto, `SiteFooter`.
- **Flux de lead (3 pantalles, compacte).** L'arrel porta `tsf-compact`; sense espais reservats ni alçades mínimes: el contingut mana. Totes comparteixen una fila superior amb el logotip a l'esquerra i `LangSwitch` a la dreta.
  1. *Entrada:* `SectionHeading` (`align="start"`), `ChoiceChips` de perfil opcional, un `Button` `solid` `full` («Pedir información de un producto»), `SectionLabel` «O contacta directamente», dos `Button` `outline` `full` (WhatsApp, Correo electrónico) i `LegalLinks` a la base.
  2. *Formulari:* `Select` de producte, `Field` ×3, `Checkbox` obligatori de privacitat i `Checkbox` opcional de novetats, `Button` `solid` `full` («Enviar y descargar el PDF») i `Button` `link` «← Volver» centrat. El CTA segueix l'últim camp; no es fixa a la base.
  3. *Confirmació:* `Notice` `success` `size="lg"`, `PdfCard`, `Button` `solid` `full` («Descargar el PDF») i els dos botons de contacte `outline` a continuació.
- **Enquesta.** `SiteHeader`, `SectionHeading` `level={1}` amb el títol-pregunta, `Figure` 16/9, una frase en `label` («Queremos saber a sua opinião») i, amb `tsf-compact`, una pregunta darrere l'altra: `RadioGroup` i `CheckboxGroup` amb `required`, un `Field` «Outro (especifique)» només després d'un grup que ho admeti, `Field` de contacte, `Button` `solid` `full` i `SiteFooter`. Col·loca el correu obligatori al final. La mostra és a `SurveyFlow`.
