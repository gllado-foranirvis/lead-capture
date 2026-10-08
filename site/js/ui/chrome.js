export function createChrome({ h, T, brand, languages }) {
  return function Header({ t, lang, onLang }) {
    return h('header', { className: 'page__top' },
      h('span', { className: 'wordmark' }, brand),
      h(T.LangSwitch, {
        languages: languages.map((code) => ({ code: code.toUpperCase() })),
        value: lang.toUpperCase(), label: t.langLabel,
        onChange: (e) => onLang(e.target.value.toLowerCase()),
      }));
  };
}
