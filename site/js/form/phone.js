// El número s'agrupa mentre s'escriu com el marcador de posició de cada país: +34 → «600 00 00 00», +351 → «912 345 678».
// Altres prefixos es deixen tal com s'escriuen (els grups varien massa).
const GROUPS = { 34: [3, 2, 2, 2], 351: [3, 3, 3] };
const JUST_DIGITS_AND_SPACES = /^[\d\s]*$/;
const countDigits = (s) => s.replace(/\D/g, '').length;

export function formatPhone(prefix, raw) {
  const groups = GROUPS[String(prefix ?? '').replace(/\D/g, '')];
  // Amb altres caràcters (lletres, «+», parèntesis…) no es toca res: la validació ha de poder avisar.
  if (!groups || !JUST_DIGITS_AND_SPACES.test(raw)) return raw;
  let digits = raw.replace(/\D/g, '');
  const parts = [];
  for (const size of groups) {
    if (!digits) break;
    parts.push(digits.slice(0, size));
    digits = digits.slice(size);
  }
  if (digits) parts[parts.length - 1] += digits; // xifres de més: la validació ja les acota
  return parts.join(' ');
}

// Posició del cursor darrere de la n-èsima xifra del text ja agrupat (sense quedar-se darrere d'un espai).
export function caretFor(formatted, digitsBefore) {
  if (digitsBefore <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === digitsBefore) return i + 1;
  }
  return formatted.length;
}

// En escriure al mig del número, tornar a posar el valor reagrupat fa saltar el cursor al final: es recoloca darrere de la mateixa xifra.
export function keepCaret(input, formatted) {
  const pos = input.selectionStart;
  if (pos == null || pos >= input.value.length || typeof input.setSelectionRange !== 'function') return;
  const target = caretFor(formatted, countDigits(input.value.slice(0, pos)));
  queueMicrotask(() => { if (input.ownerDocument?.activeElement === input) input.setSelectionRange(target, target); });
}

// Marcador de posició segons el prefix: l'exemple té el mateix agrupament que formatPhone. Sense patró conegut, el de l'idioma.
const EXAMPLES = { 34: '600 00 00 00', 351: '912 345 678' };
export const phoneExample = (prefix, fallback) => EXAMPLES[String(prefix ?? '').replace(/\D/g, '')] ?? fallback;

// Codis de país (ITU): d'1 xifra (1, 7), de 2 (llista) i la resta de 3. Cap codi és prefix d'un altre, així que n'hi ha prou amb saber la longitud.
const TWO_DIGIT = new Set(['20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
  '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98']);
const INTERNATIONAL = /^(?:\+|00)([\d\s().-]+)$/;
const codeLength = (digits) => (digits[0] === '1' || digits[0] === '7' ? 1 : TWO_DIGIT.has(digits.slice(0, 2)) ? 2 : 3);

// Un número escrit o enganxat amb «+» o «00» (p. ex. «+351 912 345 678») al camp del número: en separa el prefix.
// Retorna null mentre no hi ha prefix complet i alguna xifra del número, i amb qualsevol altre caràcter (la validació avisa).
export function splitInternational(raw) {
  const match = INTERNATIONAL.exec(String(raw ?? '').trim());
  if (!match) return null;
  const digits = match[1].replace(/\D/g, '');
  if (!digits || digits[0] === '0') return null;
  const length = codeLength(digits);
  return digits.length > length ? { prefix: `+${digits.slice(0, length)}`, number: digits.slice(length) } : null;
}

// Prefixos freqüents a la feria, amb el nom del país en l'idioma de la pàgina (Intl.DisplayNames; sense ell, el codi de regió).
const SUGGESTED = [['ES', '+34'], ['PT', '+351'], ['FR', '+33'], ['GB', '+44'], ['DE', '+49'], ['IT', '+39'], ['NL', '+31'], ['BE', '+32'],
  ['CH', '+41'], ['IE', '+353'], ['SE', '+46'], ['NO', '+47'], ['DK', '+45'], ['US', '+1'], ['BR', '+55'], ['AD', '+376']];
export function prefixSuggestions(lang) {
  let names = null;
  try { names = new Intl.DisplayNames([lang], { type: 'region' }); } catch { /* sense Intl.DisplayNames: es veu el codi */ }
  return SUGGESTED.map(([region, value]) => ({ value, label: `${names?.of(region) ?? region} (${value})` }));
}
