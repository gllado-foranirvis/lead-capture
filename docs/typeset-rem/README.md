# Tipografia del sistema de disseny: de px a rem (preparat, no aplicat)

**Estat:** preparat el 08/10/2026. No s'ha aplicat ni al sistema de disseny (artefacte `DJ1Bu4s2BL94YhJb2AwZ58`) ni a `the-silent-fleet-ds/` ni a `site/`.
**Quan aplicar-ho:** després de la fira (18/10/2026). La congelació és el 13/10 i el canvi toca tots els components per un benefici petit per a la fira.

## Què canvia

Només els 16 estils de `type.groups[].styles[]` de `tokens.json`:

| Camp | Abans | Després |
|---|---|---|
| `fontSize` | `28px` | `1.75rem` (px ÷ 16) |
| `lineHeight` | `34px` | `1.21428571` (proporció sense unitat; creix amb el text) |

Espaiat, radis, zones tàctils (44/48px), `layout` i colors es queden tal com estan. A 16px d'arrel cada estil fa exactament el mateix que ara.

## Fitxers

- `tokens.rem.json`: el `tokens.json` del sistema amb la tipografia convertida. Es peça sencera.
- `tokens.rem.css`: com quedaria el `tokens.css` generat; només per provar en local (el `tokens.css` real el genera la pàgina del sistema a partir de `tokens.json`).
- `../../scripts/rem-migration.mjs`: genera els dos fitxers anteriors des de `the-silent-fleet-ds/`. Si el sistema canvia, torna'l a executar: `node scripts/rem-migration.mjs`.
- `../../tests/rem-migration.test.mjs`: comprova que els fitxers preparats són frescos, que a 16px la mida i l'interlineat són idèntics i que no canvia res més. Si el sistema canvia i no regeneres, `npm test` falla.

## Què he mesurat (en viu, a `site/`, a 360px, aplicant la mateixa conversió)

- **A 16px d'arrel:** idèntic al valor actual (amb 8 decimals a la proporció; amb 5 hi havia 0,0001px de diferència).
- **A 24px d'arrel (150%):** cap scroll horitzontal en PT, CA i EN. El títol passa de 28px a 42px.
- **A 32px d'arrel (200%):** **la fila de xips de perfil desborda** (CA: 389px dins 312px; EN: 375px dins 312px) i la pàgina fa scroll horitzontal. Els titulars i els botons s'adapten bé.
- Mesurat amb el navegador del panell i el viewport emulat; no s'ha provat en un mòbil real ni amb la configuració de mida de lletra del sistema.

## Abans d'aplicar-ho: correcció prèvia de CSS al sistema

La fila de xips no pot trencar línia. A `components/bundle.css`, canvia:

```css
.tsf-chips__row { display: flex; gap: var(--space-3); }
```

per:

```css
.tsf-chips__row { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.tsf-chip { flex: 1 1 auto; }
```

Així, amb text gran, els xips passen a una segona fila en lloc de sortir de la pantalla.

També es recomana afegir `overflow-wrap: anywhere` als titulars (`h1`, `h2`, `.display`) del sistema; ara només el té `page__title` a `site/`. A 200% una paraula llarga de `display-lg` (4rem = 64px) no cap en 360px.

## Com aplicar-ho

1. Aplica la correcció de CSS de dalt a `components/bundle.css` del sistema.
2. Substitueix `project/tokens.json` per `docs/typeset-rem/tokens.rem.json` (sencer; el format del sistema accepta `rem` i interlineat sense unitat). Demana-m'ho i ho faig: llegeixo primer el `tokens.json` actual del sistema per no trepitjar canvis fets entremig, i afegeixo `lastChange` a l'índex.
3. Torna a descarregar el sistema a `the-silent-fleet-ds/` i executa `npm run sync`. Això copia el nou `tokens.css` a `site/ds/`.
4. `npm test`, i prova a `site/` amb l'arrel a 16px, 24px i 32px (DevTools: `document.documentElement.style.fontSize = '24px'`) en ES, CA, PT i EN. No hi ha d'haver scroll horitzontal.
5. Actualitza el `DESIGN.md`: a Typography, les mides passen a `rem` i l'interlineat a proporcions (els valors ja són al `tokens.rem.json`), i regenera `.impeccable/design.json`.
