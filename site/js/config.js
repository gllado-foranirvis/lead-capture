// Configuració de la pàgina. Totes les claus, el que fan i qui les dona:
//   brand            (obligatòria) nom de marca; es veu a la capçalera i al títol de la pestanya.
//   whatsappNumber   (obligatòria) número internacional de WhatsApp Business. Bruno. PROVA fins que el doni.
//   email            (obligatòria) adreça de contacte; es veu a l'entrada i és el destinatari del correu.
//   siteUrl          (obligatòria) URL pública, https i acabada en «/»; l'usen el QR i els enllaços. Definitiva.
//   extra1           (obligatòria) true = flux de captació en 2 passos i dossier; false = només l'MVP (WhatsApp i correu).
//   dossier          (opcional, per defecte true) false = versió de contingència sense PDF: no es pregunta el producte d'interès ni es parla de cap descàrrega. Es veu també amb ?dossier=0.
//   dossierUrl       (obligatòria) ruta relativa dins de site/ del PDF general; és l'alternativa de tots els models.
//   dossierFileName  (obligatòria) nom amb què es desa la descàrrega del dossier general («nom.pdf», sense carpetes).
//   emailDelivery    (obligatòria) false fins que existeixi l'enviament del correu amb el dossier; només canvia el subtítol de la confirmació.
//   leadEndpoint     (opcional) URL /exec de l'script de Google (docs/google-sheet.md). Buit = no s'envia res; només els esdeveniments tsf:lead*.
//   leadToken        (opcional) mateix valor que la propietat TOKEN de l'script; sense leadEndpoint no té sentit. Visible al web: no és un secret.
//   products[]       (obligatòria, mínim 2) models o potències que tria el visitant:
//                      id (únic, [a-z0-9-]), name (text visible),
//                      dossierUrl (opcional: PDF propi dins de site/; si falta s'ofereix el general),
//                      dossierFileName (obligatori si hi ha dossierUrl propi: nom de la descàrrega).
//   legalName        (obligatòria) nom legal que es veu al text de privacitat. Bruno. Definitiu.
//   defaultLang      (obligatòria) idioma per defecte; ha de ser un de languages.
//   languages        (obligatòria) idiomes disponibles, en l'ordre del selector.
export const CONFIG = {
  brand: 'The Silent Fleet',
  whatsappNumber: '+34 682 375 728',
  email: 'info@thesilentfleet.com',
  siteUrl: 'https://gllado-foranirvis.github.io/lead-capture/', // definitiva (decidit)
  extra1: true, // L'Extra 1 és actiu (decidit el 9/10/2026 per a la fira); amb false torna a l'MVP sol i es previsualitza amb ?extra1=1
  dossier: true, // false = versió de contingència sense PDF (sense pregunta de producte ni descàrrega); amb ?dossier=0 es previsualitza
  dossierUrl: 'dossier-prova.pdf', // PROVA: substituir pel document real de Bruno (a site/)
  dossierFileName: 'the-silent-fleet-dossier.pdf', // nom amb què es desa la descàrrega del dossier general (PROVA: el posa Bruno amb el document real)
  emailDelivery: false, // posar-ho a true quan l'enviament del correu amb la ficha existeixi: només canvia el text de la confirmació
  leadEndpoint: 'https://script.google.com/macros/s/AKfycby90bv7WWfBgr4AG6ZLmyh5WiIjwolPe4oycfVKc_OfvoRoWxITRVznHFIGp8oFHUoLtw/exec', // URL /exec de l'script de Google (docs/google-sheet.md). Buit = no s'envia res; només els esdeveniments tsf:lead*
  leadToken: '27aa6d8a3f1ef0a01b395c3448cd8338380b40a78b4a1141', // opcional: el mateix valor que la propietat TOKEN de l'script. És visible al codi del web: talla el correu brossa casual, no és un secret
  products: [ // PROVA: substituir per la llista real de Bruno; dossierUrl opcional per model (si no, s'obre el general)
    { id: 'model-a', name: 'Modelo A', dossierUrl: 'dossiers/model-a.pdf', dossierFileName: 'the-silent-fleet-modelo-a.pdf' },
    { id: 'model-b', name: 'Modelo B', dossierUrl: 'dossiers/model-b.pdf', dossierFileName: 'the-silent-fleet-modelo-b.pdf' },
    { id: 'model-c', name: 'Modelo C' },
  ],
  legalName: 'The Silent Fleet', // nom legal definitiu (decidit); es veu al text de privacitat
  defaultLang: 'es',
  languages: ['es', 'ca', 'pt', 'en'],
};
