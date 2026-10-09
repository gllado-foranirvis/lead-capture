export const CONFIG = {
  brand: 'The Silent Fleet',
  whatsappNumber: '+34 600 00 00 00', // PROVA: substituir pel número real de WhatsApp Business
  email: 'info@thesilentfleet.com',
  siteUrl: 'https://gllado-foranirvis.github.io/lead-capture/', // PROVISIONAL: compte de prova; canviar-la si el repo passa al compte de The Silent Fleet
  extra1: false, // L'Extra 1 és ocult als visitants fins que s'activi; es previsualitza amb ?extra1=1
  dossierUrl: 'dossier-prova.pdf', // PROVA: substituir pel document real de Bruno (a site/)
  emailDelivery: false, // posar-ho a true quan l'enviament del correu amb la ficha existeixi: només canvia el text de la confirmació
  leadEndpoint: 'https://script.google.com/macros/s/AKfycby90bv7WWfBgr4AG6ZLmyh5WiIjwolPe4oycfVKc_OfvoRoWxITRVznHFIGp8oFHUoLtw/exec', // URL /exec de l'script de Google (docs/google-sheet.md). Buit = no s'envia res; només els esdeveniments tsf:lead*
  leadToken: '27aa6d8a3f1ef0a01b395c3448cd8338380b40a78b4a1141', // opcional: el mateix valor que la propietat TOKEN de l'script. És visible al codi del web: talla el correu brossa casual, no és un secret
  products: [ // PROVA: substituir per la llista real de Bruno; dossierUrl opcional per model (si no, s'obre el general)
    { id: 'model-a', name: 'Modelo A', dossierUrl: 'dossiers/model-a.pdf' },
    { id: 'model-b', name: 'Modelo B', dossierUrl: 'dossiers/model-b.pdf' },
    { id: 'model-c', name: 'Modelo C' },
  ],
  legalName: 'PENDIENTE: nombre legal de The Silent Fleet', // PROVA: el dona Bruno
  defaultLang: 'es',
  languages: ['es', 'ca', 'pt', 'en'],
};
