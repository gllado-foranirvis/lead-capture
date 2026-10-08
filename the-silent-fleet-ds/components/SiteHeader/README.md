Capçalera enganxada a dalt amb el nom «The Silent Fleet» en `wordmark` i la navegació principal. Per sota de 768px mostra un botó de menú que desplega un panell; des de 768px, els enllaços en línia.

**Qui consumeix proporciona:** `links` (`label`, `href`, `active`, `menu` si és un desplegable), `lang` (p. ex. `"ES"`) i `homeHref`. El selector d'idioma i els desplegables són enllaços amb fletxa: l'obertura de submenús és responsabilitat de qui l'integra.

- Marca l'enllaç de la pàgina actual amb `active`; es dibuixa una línia d'1px `ink` i `aria-current="page"`.
- Els enllaços del menú mòbil fan 48px d'alt (`tap-min`).
- Màxim 6 enllaços; si en tens més, agrupa'ls en un desplegable `e-Motors`.
- No hi posis logotip dibuixat ni CTA: el CTA va a la portada.
