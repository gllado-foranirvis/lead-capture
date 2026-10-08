// Indicador de pas: el text és la informació; la barra de segments l'acompanya i és un progressbar accessible.
export function createStepIndicator({ h }) {
  return function StepIndicator({ step, total, label }) {
    const segments = Array.from({ length: total }, (_, i) =>
      h('span', { key: i, className: i < step ? 'steps__seg steps__seg--on' : 'steps__seg' }));
    return h('div', { className: 'steps' },
      h('p', { className: 'caption steps__label' }, label),
      h('div', {
        className: 'steps__track', role: 'progressbar',
        'aria-valuemin': 1, 'aria-valuemax': total, 'aria-valuenow': step, 'aria-valuetext': label, 'aria-label': label,
      }, ...segments));
  };
}
