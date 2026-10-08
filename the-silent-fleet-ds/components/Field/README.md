Camp de formulari: etiqueta damunt (`label`), control amb farciment `surface-200`, vora inferior de 2px `border-strong` i quadrat (`radius-none`). Admet `multiline` per a un `textarea`.

**Qui consumeix proporciona:** `label`, `name`, `type`, `required` (afegeix `*` a l'etiqueta) i el control de l'estat (`value` + `onChange`, o `defaultValue`). Els errors van en `error` com a frase: «Introduce un correo válido».

- Un camp per línia a tots els amples; ample màxim de 560px.
- El `placeholder` és `text-muted`: serveix d'exemple, no substitueix l'etiqueta.
- L'error es mostra amb text i signe «!», no només amb el color `error`.
- Alçada mínima de 48px.
