export function normalizeNumber(raw) {
  return String(raw).replace(/\D/g, '').replace(/^00/, '');
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const fill = (template, value) => template.replace('{value}', () => value);
const withFair = (template, fair) => template.replaceAll('{fair}', () => fair);

// Línies amb el que el visitant ja ha donat a la sessió; les buides no hi surten.
function contextLines(dict, { name, product, city } = {}) {
  const c = dict.messageContext;
  return [name && fill(c.name, name), product && fill(c.product, product), city && fill(c.city, city)].filter(Boolean);
}

const block = (lines) => (lines.length ? [lines.join('\n')] : []);

export function whatsappText(dict, session = {}, fair = '') {
  return [dict.greeting, withFair(dict.message.text, fair), ...block(contextLines(dict, session))].join('\n\n');
}

export function emailBody(dict, session = {}, fair = '') {
  return [dict.greeting, withFair(dict.message.text, fair), ...block(contextLines(dict, session)), dict.closing].join('\n\n');
}

export function contactLinks(config, dict, session = {}) {
  return {
    whatsapp: whatsappUrl(normalizeNumber(config.whatsappNumber), whatsappText(dict, session, config.fair)),
    email: mailtoUrl(config.email, withFair(dict.message.subject, config.fair), emailBody(dict, session, config.fair)),
  };
}
