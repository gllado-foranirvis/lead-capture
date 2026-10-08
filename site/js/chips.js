// Un radio ja marcat no dispara onChange: per fer una elecció opcional cal gestionar-ho a l'envoltori.
export function deselectProps(current, clear) {
  const isSelected = (e) => current !== '' && e.target.tagName === 'INPUT' && e.target.value === current;
  return {
    onClick: (e) => { if (isSelected(e)) clear(); },
    onKeyDown: (e) => {
      if (e.key === ' ' && isSelected(e)) { e.preventDefault(); clear(); }
    },
  };
}
