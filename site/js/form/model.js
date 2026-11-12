export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30, city: 80 };
export const DEFAULT_PREFIX = '+351';

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ products = [] } = {}) => ({
  products, city: '', name: '', email: '', phonePrefix: DEFAULT_PREFIX, phone: '', privacy: false, newsletter: false,
});

// Telèfon complet per al lead: «+» i les xifres del prefix, un espai i el número.
export const fullPhone = (values) => {
  const number = clip(values.phone, MAX.phone);
  return number ? clip(`+${String(values.phonePrefix ?? '').replace(/\D/g, '')} ${number}`, MAX.phone) : '';
};

// Marcar o desmarcar un valor. A la tria de productes, «asesoramiento» és excloent: no pot conviure amb cap producte.
function toggled(list, value) {
  if (list.includes(value)) return list.filter((v) => v !== value);
  return value === ADVICE ? [ADVICE] : [...list.filter((v) => v !== ADVICE), value];
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? { ...state, [action.field]: action.value } : state;
    case 'toggle':
      return Array.isArray(state[action.field]) ? { ...state, [action.field]: toggled(state[action.field], action.value) } : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
