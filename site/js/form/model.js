export const PROFILES = ['particular', 'profesional'];
export const ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
// Preguntes d'opinió de marcatge múltiple; l'última opció, «other», obre un camp per especificar.
export const ENTHUSIASM = ['sustainability', 'noise', 'maintenance', 'costs', 'regulation', 'other'];
export const CONCERNS = ['range', 'charging', 'price', 'infrastructure', 'depreciation', 'other'];
export const FACTORS = ['price', 'range', 'maker', 'design', 'warranty', 'support', 'other'];
export const OPINION_GROUPS = { enthusiasm: ENTHUSIASM, concerns: CONCERNS, factors: FACTORS };
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30, activityOther: 120, demo: 80, other: 120, comments: 500 };
export const DEFAULT_PREFIX = '+34';

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ product = '' } = {}) => ({
  product, email: '', name: '', profile: '', phonePrefix: DEFAULT_PREFIX, phone: '',
  activity: '', activityOther: '', hasBoat: '', hasElectric: '', intent: '', demo: '',
  enthusiasm: [], enthusiasmOther: '', concerns: [], concernsOther: '', factors: [], factorsOther: '', comments: '',
  privacy: false, newsletter: false,
});

// Telèfon complet per al lead: «+» i les xifres del prefix, un espai i el número.
export const fullPhone = (values) =>
  clip(`+${String(values.phonePrefix ?? '').replace(/\D/g, '')} ${clip(values.phone, MAX.phone)}`, MAX.phone);

export const showsActivity = (values) => values.profile === 'profesional';
export const showsActivityOther = (values) => showsActivity(values) && values.activity === 'otra';

// Camps que depenen d'altres: s'esborren quan deixen d'aplicar, perquè no arribin al lead.
function withDependencies(values) {
  const next = { ...values };
  if (!showsActivity(next)) next.activity = '';
  if (next.activity !== 'otra') next.activityOther = '';
  for (const group of Object.keys(OPINION_GROUPS)) if (!next[group].includes('other')) next[`${group}Other`] = '';
  return next;
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? withDependencies({ ...state, [action.field]: action.value }) : state;
    case 'toggle': {
      const list = state[action.field];
      if (!Array.isArray(list)) return state;
      const next = list.includes(action.value) ? list.filter((v) => v !== action.value) : [...list, action.value];
      return withDependencies({ ...state, [action.field]: next });
    }
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
