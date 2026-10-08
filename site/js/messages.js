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

export function whatsappText(dict, profile) {
  return `${dict.greeting}\n\n${messageFor(dict, profile).text}`;
}

export function emailBody(dict, profile) {
  return `${dict.greeting}\n\n${messageFor(dict, profile).text}\n\n${dict.closing}`;
}

export function contactLinks(config, dict, profile) {
  return {
    whatsapp: whatsappUrl(normalizeNumber(config.whatsappNumber), whatsappText(dict, profile)),
    email: mailtoUrl(config.email, messageFor(dict, profile).subject, emailBody(dict, profile)),
  };
}
