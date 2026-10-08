Selector d'idioma compacte («ES ▾») per a pàgines sense capçalera completa, p. ex. el flux de formulari. És un `<select>` natiu amb vora `border-strong` i `radius-sm`.

**Qui consumeix proporciona:** `languages` (`code`, en majúscules: ES, PT, EN, CA), `value` + `onChange` o `defaultValue`, i `label` amb el nom accessible («Idioma»). Canviar d'idioma recarrega la pàgina a l'idioma triat.

- Va sempre a l'extrem dret de la fila superior, enfront del logotip.
- Amb `SiteHeader` no el posis: el selector hi és a `lang`.
