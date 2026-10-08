export const PROFILES = ['particular', 'profesional'];
export const ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30, activityOther: 120 };

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ product = '' } = {}) => ({
  product, email: '', name: '', profile: '', phone: '',
  activity: '', activityOther: '', hasBoat: '', intent: '',
  privacy: false, newsletter: false,
});

export const showsActivity = (values) => values.profile === 'profesional';
export const showsActivityOther = (values) => showsActivity(values) && values.activity === 'otra';

// Camps que depenen d'altres: s'esborren quan deixen d'aplicar, perquè no arribin al lead.
function withDependencies(values) {
  const next = { ...values };
  if (!showsActivity(next)) next.activity = '';
  if (next.activity !== 'otra') next.activityOther = '';
  return next;
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? withDependencies({ ...state, [action.field]: action.value }) : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
