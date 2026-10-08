export const CONFIG = {
  brand: 'The Silent Fleet',
  whatsappNumber: '+34 600 00 00 00', // PROVA: substituir pel número real de WhatsApp Business
  email: 'info@thesilentfleet.com',
  siteUrl: 'https://gllado-foranirvis.github.io/lead-capture/', // PROVISIONAL: compte de prova; canviar-la si el repo passa al compte de The Silent Fleet
  extra1: false, // L'Extra 1 és ocult als visitants fins que s'activi; es previsualitza amb ?extra1=1
  dossierUrl: 'dossier-prova.pdf', // PROVA: substituir pel document real de Bruno (a site/)
  emailDelivery: false, // posar-ho a true quan l'enviament del correu amb la ficha existeixi: només canvia el text de la confirmació
  products: [ // PROVA: substituir per la llista real de Bruno
    { id: 'model-a', name: 'Modelo A' },
    { id: 'model-b', name: 'Modelo B' },
    { id: 'model-c', name: 'Modelo C' },
  ],
  legalName: 'PENDIENTE: nombre legal de The Silent Fleet', // PROVA: el dona Bruno
  defaultLang: 'es',
  languages: ['es', 'ca', 'pt', 'en'],
};
