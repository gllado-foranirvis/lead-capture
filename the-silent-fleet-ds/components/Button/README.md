Botó en forma de píndola (`radius-pill`) amb el text en estil `button`. Primera frase: tria la variant segons el fons on cau.

**Qui consumeix proporciona:** `children` (text curt, verb o acció), `href` (si navega; sense `href` renderitza un `<button>`), `onClick` o `type="submit"`.

- `solid`: el CTA principal sobre fons clar (`action` / `on-action`). Un per pantalla, p. ex. «Enviar».
- `outline`: acció secundària sobre `surface-100`.
- `outline-light`: sobre foto amb `overlay-hero` o sobre `surface-card` («Especificaciones», CTA de portada).
- `brand`: CTA sobre `surface-footer` («Junte-se agora»).
- `link`: acció terciària sense contorn, p. ex. «← Volver» sota un CTA principal.
- Alçada mínima de 48px (`tap-min`); `size="sm"` baixa a 44px només per a zones denses.
- No posis dos botons `solid` junts. No facis servir `brand` sobre fons clar.
