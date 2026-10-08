export const PROFILES = ['particular', 'profesional'];
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30 };

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ product = '' } = {}) => ({
  product, email: '', name: '', profile: '', phone: '', hasBoat: '', privacy: false, newsletter: false,
});

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? { ...state, [action.field]: action.value } : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
