Pregunta amb una llista vertical d'opcions excloents (radio). La pregunta és la llegenda (`label`) i cada fila és clicable sencera, amb el cercle de 24px en `action`.

**Qui consumeix proporciona:** `legend` (la pregunta), `options` (`value`, `label`), `name`, `required`, `value` + `onChange` o `defaultValue` i `error`.

- Usa'l per a 2–6 opcions de text de cos; si són 2–3 paraules soltes, `ChoiceChips`; amb més de 6, `Select`.
- Obligatori: `required` afegeix `*` a la pregunta; l'error és una frase («Elige una opción»).
- En fluxos compactes (`tsf-compact`) cada fila fa 40px d'alt.
