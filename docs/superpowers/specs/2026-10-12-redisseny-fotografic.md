# Redisseny fotogràfic i ajustos de l'inici

Redisseny de totes les pantalles amb la fotografia de The Silent Fleet, **mantenint el sistema de disseny** (decisió d'Olga: tokens i components es conserven; s'hi afegeix fotografia a tall viu amb el vel pla `overlay-hero`). Referència de composició: la web de Boatee de thesilentfleet.com (foto a tot sang amb titular blanc). PR #2/#4 (rediseny) i #5 (ajustos de l'inici). Detall visual a [DESIGN.md](../../../DESIGN.md) («Escena fotogràfica»).

## Què canvia
- **Inici:** escena a tot sang (`.stage`) amb títol (`h1` de 28px) i subtítol sobre el vel; capçalera superposada. Sota, el contingut de contacte.
- **Pas 1, pas 2, gràcies i privacitat:** franja fotogràfica a la capçalera (`.site__top`); les zones de formulari continuen blanques i netes. A la gràcies, la marca d'èxit s'hi recolza.
- **Fotos:** `site/img/hero-m.webp` (retall 4:3 per al mòbil, vaixell a dalt a la dreta, 66 KB) i `hero-d.webp` (1600 px, 149 KB), derivades de la foto subministrada. Precarregades a `index.html`.
- **Vel:** dues capes planes d'`overlay-hero` (≈58%); sense degradats, com demana el DESIGN.md.
- **L'app ja no usa `.page` per a l'estructura:** `.site` (`site--entry`, `site--step1`…) amb `.site__top` (banner) i `.page__main`; `.page` només queda a `privacy.html`.

## Ajustos de l'inici (PR #5), tots verificats a 360×740
1. La línia «¿No se abre? Escríbenos a …» va **després del CTA**; la nota «Se abre con un mensaje ya escrito…» es queda amb els botons.
2. **Escena compacta:** títol de 28px i sense alçada mínima; tot el contingut cap a la primera pantalla (acaba a ~696 px; 710 en anglès).
3. **La marca «The Silent Fleet» és un enllaç a l'inici** des de qualsevol pantalla (sense recarregar; clic amb modificador obre l'enllaç; 44px). A la tauleta es descarten les dades del visitant; al mòbil es conserva la sessió.
4. **Vaixell en un espai sense text:** nou retall de `hero-m` i 5,75rem de `padding-top` a l'escena.
5. **Escena més baixa:** capçalera de 3,5rem i 40px de la marca al títol (escena de ~220px).
6. **Marges proporcionals** (base de 8px): 8 dins d'un grup, 16 entre grups, 24 a les vores i al voltant de la vora de la foto, 24 entre els contactes i el CTA. L'etiqueta i els botons de contacte són un grup (`.page__group`).
7. **Estats tàctils:** sense `:hover` enganxat en un tàctil, feedback `:active` i `text-size-adjust` (PR #1).

## Límits
- A mòbils amb la barra visible (~640 px útils) l'inici necessita scroll; el marge fins als 740 px és de ~30 px en anglès.
- El vaixell queda a un parell de píxels del títol a 360 px i pot rosar-lo a altres amples; només s'ha mirat a 360 i 430 px en castellà.
- El fallback de `#root` (sense JavaScript) no porta fotografia.
