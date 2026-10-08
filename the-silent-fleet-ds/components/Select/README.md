Desplegable de formulari: mateixa etiqueta, farciment `surface-200` i vora inferior `border-strong` que `Field`, amb una fletxa `ink`. És un `<select>` natiu, de manera que el menú d'opcions és el del sistema i funciona bé en mòbil.

**Qui consumeix proporciona:** `label`, `options` (`value`, `label`), `placeholder` (opció inicial buida, p. ex. «Elige un producto»), `required`, `error`.

- Usa'l a partir de 4 opcions; amb 2–3 opcions curtes, `ChoiceChips`.
- El `placeholder` no és una opció triable: obliga a escollir.
- Alçada mínima de 48px (`tap-min`); `error` en frase i amb signe «!».
