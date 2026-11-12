export const PROFILES = ['particular', 'profesional'];
export const ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
// Preguntes d'opinió de marcatge múltiple; l'última opció, «other», obre un camp per especificar.
export const ENTHUSIASM = ['sustainability', 'noise', 'maintenance', 'costs', 'regulation', 'other'];
export const CONCERNS = ['range', 'charging', 'price', 'infrastructure', 'depreciation', 'other'];
export const FACTORS = ['price', 'range', 'maker', 'design', 'warranty', 'support', 'other'];
export const OPINION_GROUPS = { enthusiasm: ENTHUSIASM, concerns: CONCERNS, factors: FACTORS };
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30, city: 80, activityOther: 120, other: 120, comments: 500 };
export const DEFAULT_PREFIX = '+351';

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ products = [] } = {}) => ({
  products, city: '', name: '', email: '', phonePrefix: DEFAULT_PREFIX, phone: '', privacy: false, newsletter: false,
  profile: '', activity: '', activityOther: '', hasBoat: '', hasElectric: '', intent: '',
  enthusiasm: [], enthusiasmOther: '', concerns: [], concernsOther: '', factors: [], factorsOther: '', comments: '',
});

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

// Telèfon complet per al lead: «+» i les xifres del prefix, un espai i el número.
export const fullPhone = (values) => {
  const number = clip(values.phone, MAX.phone);
  return number ? clip(`+${String(values.phonePrefix ?? '').replace(/\D/g, '')} ${number}`, MAX.phone) : '';
};

// Marcar o desmarcar un valor. A la tria de productes, «asesoramiento» és excloent: no pot conviure amb cap producte.
function toggled(field, list, value) {
  if (list.includes(value)) return list.filter((v) => v !== value);
  if (field !== 'products') return [...list, value];
  return value === ADVICE ? [ADVICE] : [...list.filter((v) => v !== ADVICE), value];
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? withDependencies({ ...state, [action.field]: action.value }) : state;
    case 'toggle':
      return Array.isArray(state[action.field]) ? withDependencies({ ...state, [action.field]: toggled(action.field, state[action.field], action.value) }) : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
