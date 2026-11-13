// Configuració de la pàgina. Totes les claus, el que fan i qui les dona:
//   brand            (obligatòria) nom de marca; es veu a la capçalera i al títol de la pestanya.
//   whatsappNumber   (obligatòria) número internacional de WhatsApp Business. Bruno. PROVA fins que el doni.
//   email            (obligatòria) adreça de contacte; es veu a l'entrada i és el destinatari del correu.
//   siteUrl          (obligatòria) URL pública, https i acabada en «/»; l'usen el QR i els enllaços. Definitiva.
//   extra1           (obligatòria) true = flux de captació en 2 passos i dossier; false = només l'MVP (WhatsApp i correu).
//   dossier          (opcional, per defecte true) false = versió de contingència sense PDF: no es pregunta el producte d'interès ni es parla de cap descàrrega. Es veu també amb ?dossier=0; amb false, ?dossier=1 el previsualitza.
//   brandPdf         (opcional) PDF general de la marca, com a mapa idioma → ruta dins de site/ (p. ex. { en: 'dossiers/brand.en.pdf' }; ha de tenir l'anglès). S'ofereix quan un producte triat no té PDF propi. Avui no n'hi ha.
//   emailDelivery    (obligatòria) false fins que existeixi l'enviament del correu amb el dossier; només canvia el subtítol de la confirmació.
//   leadEndpoint     (calculada) URL /exec de l'script de Google (docs/google-sheet.md). Buit = no s'envia res; només els esdeveniments tsf:lead*. Es tria sola segons l'entorn (vegeu ENDPOINTS).
//   leadToken        (calculada) mateix valor que la propietat TOKEN de l'script; sense leadEndpoint no té sentit. Visible al web: no és un secret.
//   products[]       (obligatòria, mínim 2) productes que tria el visitant:
//                      id (únic, [a-z0-9-]), name (text visible),
//                      pdf (opcional: mapa idioma → ruta dins de site/, p. ex. { en: 'dossiers/sifly.en.pdf' }; ha de tenir l'anglès.
//                      Per afegir un idioma, n'hi ha prou amb afegir la clau: es descarrega el de l'idioma del formulari i, si no n'hi ha, l'anglès).
//   fair             (obligatòria) nom de la fira; es veu a l'inici i als missatges de WhatsApp i correu.
//   legalName        (obligatòria) nom legal que es veu al text de privacitat. Bruno. Definitiu.
//   defaultLang      (obligatòria) idioma per defecte; ha de ser un de languages.
//   languages        (obligatòria) idiomes disponibles, en l'ordre del selector.
// Un full per entorn: a localhost el web escriu al full de test; a qualsevol altre domini (GitHub Pages), al de producció.
// La URL /exec és la de cada desplegament de l'script (docs/google-sheet.md); el token és la propietat TOKEN de cada script (visible al web: talla el correu brossa casual, no és un secret).
export const ENDPOINTS = {
  production: {
    url: 'https://script.google.com/macros/s/AKfycby90bv7WWfBgr4AG6ZLmyh5WiIjwolPe4oycfVKc_OfvoRoWxITRVznHFIGp8oFHUoLtw/exec',
    token: '27aa6d8a3f1ef0a01b395c3448cd8338380b40a78b4a1141',
  },
  test: {
    url: 'https://script.google.com/macros/s/AKfycbwSLQ51NWhYfmgyC8fK19rZ0E6i8jn2mzcWL2ew9-PbKO6nZR8GTIwcT770cBgU0w5Vtw/exec',
    token: '27aa6d8a3f1ef0a01b395c3448cd8338380b40a78b4a1141',
  },
};
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
// Sota Node o sense domini, producció (l'opció segura: mai un clic real al full de test).
export const leadTarget = (hostname) => (LOCAL_HOSTS.includes(hostname) ? ENDPOINTS.test : ENDPOINTS.production);
const target = leadTarget(globalThis.location?.hostname);

export const CONFIG = {
  brand: 'The Silent Fleet',
  fair: 'Enertech 2026',
  whatsappNumber: '+34 682 375 728',
  email: 'info@thesilentfleet.com',
  siteUrl: 'https://gllado-foranirvis.github.io/lead-capture/', // definitiva (decidit)
  extra1: true, // L'Extra 1 és actiu (decidit el 9/10/2026 per a la fira); amb false torna a l'MVP sol i es previsualitza amb ?extra1=1
  dossier: true, // false = versió de contingència sense PDF (sense pregunta de producte ni descàrrega); amb ?dossier=0 es previsualitza i, amb false, ?dossier=1 previsualitza el dossier
  emailDelivery: false, // posar-ho a true quan l'enviament del correu amb la ficha existeixi: només canvia el text de la confirmació
  leadEndpoint: target.url, // veure ENDPOINTS: test a localhost, producció a la resta
  leadToken: target.token,
  products: [
    { id: 'boatee', name: 'Boatee', pdf: { en: 'dossiers/boatee.en.pdf' } },
    { id: 'ez-raft', name: 'EZ Raft', pdf: { en: 'dossiers/ez-raft.en.pdf' } },
    { id: 'jetwave', name: 'Jetwave', pdf: { en: 'dossiers/jetwave.en.pdf' } },
    { id: 'momentum', name: 'Momentum', pdf: { en: 'dossiers/momentum.en.pdf' } },
    { id: 'seanxt', name: 'SeaNXT', pdf: { en: 'dossiers/seanxt.en.pdf' } },
    { id: 'sifly', name: 'Sifly', pdf: { en: 'dossiers/sifly.en.pdf' } },
    { id: 'tko', name: 'TKO', pdf: { en: 'dossiers/tko.en.pdf' } },
  ],
  legalName: 'The Silent Fleet', // nom legal definitiu (decidit); es veu al text de privacitat
  defaultLang: 'pt',
  languages: ['pt', 'en', 'es', 'ca'],
};
