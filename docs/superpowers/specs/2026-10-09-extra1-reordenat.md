# Extra 1 · flux reordenat (contacte primer, perfilació després)

Substitueix l'ordre del flux de 2 passos de `2026-10-08-extra1-2-passos.md`. Conserva el mateix sistema de disseny, l'indicador de pas, els 4 idiomes i l'interruptor `extra1`.

## Pantalles

### Inici
- H1 «Hablemos de propulsión eléctrica».
- **Pregunta de perfil sempre visible** (xips Particular | Profesional, opcional i desmarcable), a l'MVP i a l'Extra 1.
- **CTA principal (únic sòlid): «Quiero saber más de The Silent Fleet».**
- WhatsApp i correu, com fins ara. Tots dos porten el perfil escollit.

### Pas 1 de 2 · dades de contacte
Nom*, correu*, telèfon*, casella obligatòria de privacitat, casella opcional de novetats. En continuar es valida i es registra el lead de contacte (amb consentiment).

### Pas 2 de 2 · perfilació
- **Perfil*** (ja marcat des de l'inici; únic camp obligatori).
- **Activitat principal**, només si és Profesional; si tria «Otra» surt «Otra actividad (especifica)».
- **¿Tienes embarcación actualmente?** (Sí | No).
- **¿Tienes intención de comprar propulsión eléctrica?** (Sí | No).
- **Modelo o potencia de interés** (xips, opcionals, inclou «No lo sé aún / Busco asesoramiento»).
- Botó final «Acceder al dossier».

### Confirmació
S'obre el document general de l'empresa; botó per tornar-lo a obrir; bloc de WhatsApp amb les dades de la sessió; «Volver al inicio».

## Decisions (9/10/2026)
1. **Ordre invertit:** contacte al pas 1 i perfilació al pas 2. Així el lead parcial és un contacte real amb consentiment i desapareix el cas `privacy: false`.
2. **Activitat** només per a Profesional.
3. **Obligatori:** només el perfil (pas 2); el pas 1 demana nom, correu, telèfon i privacitat.
4. **Document:** un document general de The Silent Fleet (no una ficha de producte). Es diu «dossier» als literals fins que Bruno confirmi el nom; el model d'interès ja no condiciona el document.
5. **WhatsApp i correu** porten totes les dades de la sessió: nom, perfil, activitat, producte, embarcació i intenció de compra, quan existeixen.
6. Es retira la demostració («Te interesa una demostración»).

## Pendent de Bruno
- El document general (fitxer real) i el nom: «dossier» o un altre.
- Llista real de models o potències.
- Text de privacitat (esborrany) i nom legal.
- Que «Profesional» enviï el missatge «distribuidor».
- Enviament real del correu amb el dossier (pla posterior).
