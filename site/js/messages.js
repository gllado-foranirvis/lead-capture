export function normalizeNumber(raw) {
  return String(raw).replace(/\D/g, '').replace(/^00/, '');
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Un perfil desconegut o absent cau al missatge genèric.
const messageFor = (dict, profile) => (Object.hasOwn(dict.messages, profile) ? dict.messages[profile] : dict.messages.none);
const fill = (template, value) => template.replace('{value}', () => value);

// Línies amb el que el visitant ja ha donat a la sessió; les buides no hi surten.
function contextLines(dict, { name, product, activity, hasBoat, hasElectric, enthusiasm, concerns, intent, factors, demo, comments } = {}) {
  const c = dict.messageContext;
  return [
    name && fill(c.name, name),
    product && fill(c.product, product),
    activity && fill(c.activity, activity),
    hasBoat && fill(c.boat, hasBoat),
    hasElectric && fill(c.electric, hasElectric),
    enthusiasm && fill(c.enthusiasm, enthusiasm),
    concerns && fill(c.concerns, concerns),
    intent && fill(c.intent, intent),
    factors && fill(c.factors, factors),
    demo && fill(c.demo, demo),
    comments && fill(c.comments, comments),
  ].filter(Boolean);
}

const block = (lines) => (lines.length ? [lines.join('\n')] : []);

export function whatsappText(dict, session = {}) {
  return [dict.greeting, messageFor(dict, session.profile).text, ...block(contextLines(dict, session))].join('\n\n');
}

export function emailBody(dict, session = {}) {
  return [dict.greeting, messageFor(dict, session.profile).text, ...block(contextLines(dict, session)), dict.closing].join('\n\n');
}

export function contactLinks(config, dict, session = {}) {
  return {
    whatsapp: whatsappUrl(normalizeNumber(config.whatsappNumber), whatsappText(dict, session)),
    email: mailtoUrl(config.email, messageFor(dict, session.profile).subject, emailBody(dict, session)),
  };
}
