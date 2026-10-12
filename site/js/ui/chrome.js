export function createChrome({ h, T, brand, languages }) {
  // Un clic normal torna a l'inici sense recarregar; amb Cmd/Ctrl/Maj/Alt o el botó del mig, el navegador obre l'enllaç.
  const goHome = (onHome) => (e) => {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onHome?.();
  };
  return function Header({ t, lang, onLang, onHome, homeHref = '.' }) {
    return h('header', { className: 'page__top' },
      h('a', { className: 'wordmark', href: homeHref, onClick: goHome(onHome) }, brand),
      h(T.LangSwitch, {
        languages: languages.map((code) => ({ code: code.toUpperCase() })),
        value: lang.toUpperCase(), label: t.langLabel,
        onChange: (e) => onLang(e.target.value.toLowerCase()),
      }));
  };
}
