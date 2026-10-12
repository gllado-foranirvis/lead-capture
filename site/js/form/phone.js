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
