Pregunta amb una llista vertical d'opcions múltiples (caselles). Mateix patró que `RadioGroup`: la pregunta com a llegenda i files clicables de 24px.

**Qui consumeix proporciona:** `legend`, `options`, `name`, `required`, `values` + `onChange` o `defaultValues`, `error`. Per a l'opció «Outro», afegeix una opció `other` i mostra a sota un `Field` «Outro (especifique)» només quan estigui marcada.

- Indica a la pregunta si en pots triar vàries; «O que o entusiasma?» ja ho implica.
- Una pregunta, una llegenda: no agrupis dues preguntes en un mateix grup.
- Fins a 9 opcions; si en tens més, `Select` o divideix la pregunta.
