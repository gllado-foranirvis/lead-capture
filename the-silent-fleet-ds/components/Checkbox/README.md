Casella de verificació de 24px amb etiqueta clicable en `body`. L'etiqueta pot contenir un enllaç (`accent`, subratllat) a la política de privacitat.

**Qui consumeix proporciona:** `children` (text de l'etiqueta), `name`, `required`, `checked` + `onChange` o `defaultChecked`, `error`.

- Acceptació legal: `required`, sempre sense marcar per defecte; text «Acepto la política de privacidad».
- Consentiment opcional (novetats): sense `required`, i el text acaba amb «(opcional)».
- Una casella per línia; la zona tàctil de cada fila fa 48px com a mínim.
- No usis una casella per a una elecció exclusiva (usa `ChoiceChips`).
