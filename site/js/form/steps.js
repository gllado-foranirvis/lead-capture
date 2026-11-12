export const stepLabel = (template, n, total) => template.replace('{n}', String(n)).replace('{total}', String(total));

// «Passo 2 de 4 · Dados»: el número i el nom del pas.
export const stepText = (template, names, n, total) => `${stepLabel(template, n, total)} · ${names[n - 1]}`;
