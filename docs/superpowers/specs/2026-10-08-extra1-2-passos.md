# Extra 1 · flux de captació en 2 passos (brief)

Substitueix el formulari d'una sola pantalla per un flux progressiu de 2 passos, orientat a mòbil i a la coherència del missatge. Convé amb tot el definit fins ara (sistema de disseny, 4 idiomes, interruptor `extra1`).

## Pantalles

### 1. Entrada
- H1 «Hablemos de propulsión eléctrica»; subtítol «Explora los modelos disponibles y consulta todas las especificaciones técnicas.» (ajustat: «sus» no passa el test de tracte)
- CTA principal (únic sòlid): «Descubrir la gama eléctrica».
- Secundaris amb icona: «Escribir por WhatsApp», «Escribir por correo».
- Sense selector ni pregunta prèvia (només amb l'Extra 1 activat; l'MVP manté els xips de perfil).

### 2. Pas 1 de 2
- Indicador «Paso 1 de 2» amb barra al 50 %.
- Títol «Descubre la gama eléctrica»; subtítol «Dinos qué buscas para mostrarte las opciones ideales.»
- Camps: **Modelo o potencia de interés*** (xips; inclou «No lo sé aún / Busco asesoramiento») i **Correo electrónico*** (`type="email"`).
- Botó «Ver modelos disponibles →». L'error es mostra **abans de seguir**.

### 3. Pas 2 de 2
- Indicador «Paso 2 de 2» al 100 %.
- Títol «Casi listo para ver la gama completa»; subtítol «Personalizamos la información según tu perfil para enviarte la propuesta adecuada.»
- Camps: **Nombre***, **¿Quién eres?*** (xips Particular | Profesional), **Teléfono*** (`type="tel"`), **¿Tienes embarcación actualmente?** (xips Sí | No, opcional), casella obligatòria de privacitat, casella opcional de novetats.
- Botó final «Acceder a la ficha de la gama».

### 4. Confirmació
- Títol «Aquí tienes la gama eléctrica»; subtítol: la ficha s'ha obert al navegador i (quan l'enviament existeixi) s'ha enviat per correu.
- Botó per obrir la ficha + bloc «¿Tienes dudas sobre qué motor encaja en tu embarcación? Habla directamente con un especialista por WhatsApp.» amb enllaç directe.

## Requisits d'UX
- Mobile first; àrea tàctil mínima de 48 px (els botons i camps del sistema ja fan 48 px).
- Inputs amb tipus adequat (`email`, `tel`); xips en lloc de desplegables per a respostes curtes.
- Transició entre passos sense recarregar la pàgina.
- Lliurament doble: en prémer el botó final s'obre el document i s'envia el lead (el correu automàtic ve en un pla posterior).

## Decisions preses amb l'Olga (8/10/2026)
1. **Perfilació:** es retiren activitat, activitat «altra», inversió i demostració. Només es pregunta si té embarcació.
2. **Consentiment:** al pas 2. El correu del pas 1 **es captura igualment** com a lead parcial amb `privacy: false` (queda registrat que no ha acceptat la política).
3. **Nom del document:** «ficha» fins que Bruno digui què és (el brief deia «dossier»).
4. **Indicador del pas:** dissenyat amb impeccable (extensió d'una superfície existent, sense món visual nou).
5. **Error del pas 1:** es mostra abans de seguir.
6. **Xips obligatoris:** producte i perfil, no desmarcables.
7. **WhatsApp i correu porten totes les variables de la sessió:** nom, producte, tinc embarcació i perfil, quan existeixen.

## Pendent de Bruno
- Nom del document («ficha» o «dossier») i llista real de tipus de producte.
- Si pot desar el correu abans del consentiment (el pas 1 el desa amb `privacy: false`) i el text de privacitat actualitzat (és un esborrany).
- Si «Profesional» ha de correspondre al missatge «distribuidor».
- Enviament real del correu amb la ficha (pla posterior).
