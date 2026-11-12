import { ADVICE, MAX, clip } from './model.js';

// Noms dels productes triats (o el de l'assessorament) separats per comes; els ids desconeguts s'ignoren.
function productLabel(values, { products, dict }) {
  return (values.products ?? [])
    .map((id) => (id === ADVICE ? dict.form.productAdvice : products.find((p) => p.id === id)?.name))
    .filter(Boolean)
    .join(', ');
}

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  return {
    product: productLabel(values, { products, dict }),
    city: clip(values.city, MAX.city),
    name: clip(values.name, MAX.name),
  };
}
