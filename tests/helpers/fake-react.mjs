// Renderitzador mínim: h construeix un arbre i T retorna noms de component, així els components d'UI es proven a Node.
export const h = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) });
export const T = new Proxy({}, { get: (_, name) => `T.${String(name)}` });
export const findAll = (node, predicate, out = []) => {
  if (node && typeof node === 'object') {
    if (predicate(node)) out.push(node);
    node.children?.forEach((child) => findAll(child, predicate, out));
  }
  return out;
};
export const byType = (tree, type) => findAll(tree, (n) => n.type === type);
export const byName = (tree, name) => findAll(tree, (n) => n.props?.name === name);
export const textOf = (node) => (node && typeof node === 'object' ? (node.children ?? []).map(textOf).join('') : String(node ?? ''));
