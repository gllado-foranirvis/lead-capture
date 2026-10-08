Sistema de disseny **mobile first** de The Silent Fleet, el moviment de propulsió elèctrica nàutica amb seus a Porto i Barcelona. Usa'l per construir qualsevol web o pàgina del projecte: parteix sempre del disseny de mòbil (≈390px) i amplia'l des de 768px.

## Fonaments de contingut

- Escriu en l'idioma de la pàgina (ES, PT o EN); mai barregis idiomes en un mateix bloc. Els mots de navegació són curts: «El Movimiento», «Water Toys», «e-Motors», «Marcas», «Contacto».
- To: entusiasta, tècnic però planer, en plural col·lectiu («Juntos, fazemos a diferença», «Juntos en la Transición»). Parla del moviment i de l'aigua, no del producte com a mercaderia.
- Titulars en frase normal (només la primera majúscula, més els noms propis): «Impulsando el futuro. En silencio». No facis servir majúscules sostingudes llevat de l'estil `eyebrow` dels encapçalaments de columna del peu.
- Un CTA és una frase verbal curta i va dins un botó píndola: «Especificaciones», «Junte-se agora», «Enviar». Un sol CTA principal per pantalla.
- Sense emojis ni signes d'exclamació.
- Subtítols sota un titular: una sola línia en `body-sm` i `text-muted`.

## Fonaments visuals

- **Color.** El fons és `surface-100`, el text `ink` i el secundari `text-muted`. La identitat és el blau marí (`navy-900`, `navy-800`, `navy-600`) amb l'aigua turquesa `aqua-500`. `aqua-500` i `sky-500` només s'utilitzen sobre fons navy o com a blocs decoratius, mai com a text ni icona sobre blanc; sobre blanc usa `accent`.
- **Text sobre fosc.** Sobre `surface-card`, `surface-footer` i `navy-*` el text és `on-navy` i el secundari `on-navy-muted`. Sobre `aqua-500` el text és `on-aqua`.
- **Tema fosc.** Tot el sistema té dos temes (`light`, `dark`). Fixa sempre `data-theme` a l'arrel i no cridis cap color per valor.
- **Tipografia.** Montserrat, sempre. Titulars en pes 600 (`display`, `h1`, `h2`, `h3`); el nom de marca en `wordmark` (700). Per sota de 768px usa els estils base; des de 768px usa les variants `-lg` (`display-lg`, `h1-lg`, `h2-lg`). El text de cos va en 400; no baixis a 300.
- **Formes.** Botons sempre en píndola (`radius-pill`). Imatges de targeta amb `radius-md`; imatge destacada amb `radius-lg`. Camps i panells de producte, quadrats (`radius-none`).
- **Fotografia.** A pantalla completa, aigua i embarcacions en moviment, sempre a tall viu (sense marc) i amb `overlay-hero` quan hi ha text a sobre. Els productes van sobre fons blanc, retallats, sense ombra.
- **Ombres i degradats.** No n'hi ha. La profunditat es fa amb el contrast entre `surface-100`, `surface-200` i `surface-card`.
- **Formularis.** Un camp per línia, etiqueta damunt, obligatoris marcats amb `*` i sempre amb el text d'error en una frase. Els avisos (`Notice`) usen `success-bg`, `warning-bg` i `error-bg` amb el text en `ink`; mai comuniquis un estat només amb el color.
- **Densitat compacta.** En fluxos de formulari afegeix la classe `tsf-compact` a l'arrel: baixa `tap-min` a `tap-min-compact` (44px), les files de ràdio i caselles a `option-h-compact` (40px) i redueix els buits entre camps. Les pantalles de contingut i marca no són compactes.
- **Línies.** Una vora d'1px `border` per separar; `border-strong` per a controls. L'enllaç actiu de la capçalera es marca amb una línia d'1px `ink` sota el text.
- **Moviment.** Transicions de color de 150ms als botons i enllaços; res més.
- **Focus.** Anell sòlid de 2px: `focus` sobre fons clar, `focus-on-dark` sobre navy.
- **Text justificat.** Els blocs de text de `BrandRow` es justifiquen només des de 768px; en mòbil, alineats a l'inici.

## Iconografia i logotips

- El nom de marca es composa en text amb `wordmark`; no hi ha logotip dibuixat. No n'inventis cap.
- Els logotips de partners (Sea-NXT, Boatee, Momentum, RKO, SiFly) són de cada marca i s'han de subministrar com a fitxer original; el sistema no els reprodueix. Es mostren sobre fons blanc, sense filtre, amb un màxim de 96px d'alt.
- Icones de funcionalitat: traç fi d'1,5px, un sol color `accent` (o `aqua-500` sobre navy), 32px. Les icones de xarxes socials del peu són blanques (`on-navy`) de 24px i les aporta qui consumeix el sistema.

## Components

`Button`, `SiteHeader`, `Hero`, `SectionHeading`, `ImageCard`, `ProductCard`, `BrandRow`, `FeatureItem`, `SiteFooter` i, per a formularis i fluxos de lead, `Field`, `Select`, `Checkbox`, `RadioGroup`, `CheckboxGroup`, `ChoiceChips`, `Notice`, `PdfCard`, `Figure`, `LangSwitch`, `SectionLabel` i `LegalLinks`, exportats a `window.TSF`. Cada component accepta `layout="mobile" | "desktop" | "auto"` (per defecte `auto`, segons `bp-md`). Llegeix la guia de cada component abans d'usar-lo.

## Com consumir-lo

Carrega `tokens.css`, `components/bundle.css` i `components/bundle.js` (després de React 18) i posa `data-theme="light"` a l'arrel. Per a HTML sense React, usa les classes d'estil tipogràfic (`.h2`, `.body`…) i les variables `--space-*`, `--radius-*` i de color dels tokens.
