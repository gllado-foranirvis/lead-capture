// Descarrega tots els fitxers seguits amb enllaços temporals. El primer clic és síncron, dins del gest del visitant;
// els altres s'espaien perquè el navegador no els fusioni (pot demanar permís per a «descàrregues múltiples»).
export function downloadAll(docs, { doc = document, delayMs = 400, schedule = setTimeout } = {}) {
  const click = ({ href }) => {
    const link = doc.createElement('a');
    link.href = href;
    link.download = '';
    doc.body.appendChild(link);
    link.click();
    link.remove();
  };
  docs.forEach((item, i) => (i === 0 ? click(item) : schedule(() => click(item), delayMs * i)));
}
