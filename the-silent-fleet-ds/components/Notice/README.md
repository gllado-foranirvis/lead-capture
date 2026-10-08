Avís en bloc amb una icona, un títol opcional i un text curt en `body-sm`. Quatre variants (`info`, `success`, `warning`, `error`) amb fons suau i icona de color; el text sempre és `ink`, i la variant es llegeix també per la icona i les paraules, no només pel color. `size="lg"` el converteix en una pantalla de confirmació centrada, amb una icona de 72px.

**Qui consumeix proporciona:** `variant`, `title` i `children` (una o dues frases).

- `error` i `warning` s'anuncien als lectors de pantalla (`role="alert"`); `info` i `success`, com a estat.
- Un avís per pantalla; no n'apilis dos.
- `size="lg"` + `success` per a «Tu PDF está listo»; mai per a errors de camp (aquests són `error` del camp).
