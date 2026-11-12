import { FORM, FORM_NO_DOSSIER } from './i18n-form.js';

const PAGE = {
  es: {
    title: 'Hablemos de propulsión eléctrica',
    subtitle: 'Cuéntanos qué buscas y te respondemos',
    contactLabel: 'Escríbenos', whatsapp: 'Escribir por WhatsApp', emailLabel: 'Escribir por correo',
    contactHint: 'Se abre con un mensaje ya escrito. Puedes cambiarlo antes de enviarlo.',
    contactFallback: '¿No se abre? Escríbenos a',
    privacy: 'Privacidad', cookies: 'Cookies', legalNav: 'Enlaces legales', langLabel: 'Idioma', back: 'Volver',
    greeting: 'Hola,', closing: 'Gracias.',
    messageContext: { name: 'Me llamo {value}.', product: 'Producto de interés: {value}', city: 'Ciudad: {value}' },
    message: { subject: 'Información desde {fair}', text: 'He visto vuestro stand en {fair} y quiero más información.' },
    privacyTitle: 'Privacidad',
    privacyText: 'Esta página no guarda datos personales. Si nos escribes por WhatsApp o por correo, usaremos tus datos solo para responderte.',
    cookiesTitle: 'Cookies',
    cookiesText: 'Esta página no usa cookies. Solo cuenta, de forma anónima, cada vez que se pulsa el botón de WhatsApp o el de correo (botón, idioma, tipo de dispositivo y los datos de interés indicados), sin guardar nombre, correo ni teléfono.',
  },
  ca: {
    title: 'Parlem de propulsió elèctrica',
    subtitle: 'Explica\'ns què busques i et responem',
    contactLabel: 'Escriu-nos', whatsapp: 'Escriure per WhatsApp', emailLabel: 'Escriure per correu',
    contactHint: 'S\'obre amb un missatge ja escrit. Pots canviar-lo abans d\'enviar-lo.',
    contactFallback: 'No s\'obre? Escriu-nos a',
    privacy: 'Privacitat', cookies: 'Cookies', legalNav: 'Enllaços legals', langLabel: 'Idioma', back: 'Tornar',
    greeting: 'Hola,', closing: 'Gràcies.',
    messageContext: { name: 'Em dic {value}.', product: 'Producte d\'interès: {value}', city: 'Ciutat: {value}' },
    message: { subject: 'Informació des de {fair}', text: 'He vist el vostre estand a {fair} i vull més informació.' },
    privacyTitle: 'Privacitat',
    privacyText: 'Aquesta pàgina no desa dades personals. Si ens escrius per WhatsApp o per correu, farem servir les teves dades només per respondre\'t.',
    cookiesTitle: 'Cookies',
    cookiesText: 'Aquesta pàgina no fa servir cookies. Només compta, de manera anònima, cada cop que es prem el botó de WhatsApp o el de correu (botó, idioma, tipus de dispositiu i les dades d\'interès indicades), sense desar nom, correu ni telèfon.',
  },
  pt: {
    title: 'Falemos de propulsão elétrica',
    subtitle: 'Diz-nos o que procuras e respondemos',
    contactLabel: 'Escreve-nos', whatsapp: 'Escrever por WhatsApp', emailLabel: 'Escrever por e-mail',
    contactHint: 'Abre com uma mensagem já escrita. Podes alterá-la antes de a enviar.',
    contactFallback: 'Não abre? Escreve-nos para',
    privacy: 'Privacidade', cookies: 'Cookies', legalNav: 'Ligações legais', langLabel: 'Idioma', back: 'Voltar',
    greeting: 'Olá,', closing: 'Obrigado.',
    messageContext: { name: 'Chamo-me {value}.', product: 'Produto de interesse: {value}', city: 'Cidade: {value}' },
    message: { subject: 'Informação da {fair}', text: 'Vi o vosso stand na {fair} e gostaria de mais informação.' },
    privacyTitle: 'Privacidade',
    privacyText: 'Esta página não guarda dados pessoais. Se nos escreveres por WhatsApp ou por e-mail, usaremos os teus dados apenas para te responder.',
    cookiesTitle: 'Cookies',
    cookiesText: 'Esta página não utiliza cookies. Apenas conta, de forma anónima, cada vez que se carrega no botão de WhatsApp ou no de e-mail (botão, idioma, tipo de dispositivo e os dados de interesse indicados), sem guardar nome, e-mail nem telefone.',
  },
  en: {
    title: "Let's talk electric propulsion",
    subtitle: "Tell us what you're looking for and we'll reply",
    contactLabel: 'Get in touch', whatsapp: 'Message on WhatsApp', emailLabel: 'Send an email',
    contactHint: 'It opens with a message already written. You can edit it before sending.',
    contactFallback: "Doesn't open? Write to us at",
    privacy: 'Privacy', cookies: 'Cookies', legalNav: 'Legal links', langLabel: 'Language', back: 'Back',
    greeting: 'Hello,', closing: 'Thank you.',
    messageContext: { name: 'My name is {value}.', product: 'Product of interest: {value}', city: 'City: {value}' },
    message: { subject: 'Information from {fair}', text: 'I saw your stand at {fair} and would like more information.' },
    privacyTitle: 'Privacy',
    privacyText: 'This page does not store personal data. If you write to us by WhatsApp or email, we will use your details only to reply.',
    cookiesTitle: 'Cookies',
    cookiesText: 'This page does not use cookies. It only counts, anonymously, each press of the WhatsApp or email button (button, language, device type and the interest details entered), without storing name, email or phone.',
  },
};

export const DICT = Object.fromEntries(Object.entries(PAGE).map(([lang, page]) => [lang, { ...page, form: FORM[lang] }]));

// Versió sense dossier: els mateixos literals amb els canvis de FORM_NO_DOSSIER (i el text de privacitat sense el producte ni el dossier).
function withoutDossier(lang) {
  const { privacy, ...texts } = FORM_NO_DOSSIER[lang];
  const privacyText = privacy.reduce((text, [from, to]) => {
    if (!text.includes(from)) throw new Error(`i18n-form: «${from}» no és al text de privacitat (${lang})`);
    return text.replace(from, to);
  }, FORM[lang].privacyText);
  return { ...DICT[lang], form: { ...FORM[lang], ...texts, privacyText } };
}
const DICT_NO_DOSSIER = Object.fromEntries(Object.keys(FORM_NO_DOSSIER).map((lang) => [lang, withoutDossier(lang)]));

export const dictFor = (lang, dossier) => (dossier ? DICT : DICT_NO_DOSSIER)[lang];

export function resolveLang(search, config) {
  const wanted = (new URLSearchParams(search).get('lang') || '').toLowerCase();
  return config.languages.includes(wanted) ? wanted : config.defaultLang;
}
