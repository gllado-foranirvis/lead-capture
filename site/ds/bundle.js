/* @ds-bundle: {"format":4,"namespace":"TSF","components":[{"name":"Button"},{"name":"SiteHeader"},{"name":"Hero"},{"name":"SectionHeading"},{"name":"ImageCard"},{"name":"ProductCard"},{"name":"BrandRow"},{"name":"FeatureItem"},{"name":"Field"},{"name":"SiteFooter"},{"name":"Select"},{"name":"Checkbox"},{"name":"Notice"},{"name":"PdfCard"},{"name":"ChoiceChips"},{"name":"LangSwitch"},{"name":"SectionLabel"},{"name":"LegalLinks"},{"name":"RadioGroup"},{"name":"CheckboxGroup"},{"name":"Figure"}]} */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;

  function cx() {
    var o = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]);
    return o.join(' ');
  }

  // Desktop layout from bp-md (768px). `layout` forces a state for docs and tests.
  var MQ = '(min-width: 768px)';
  function useLg(layout) {
    var st = React.useState(function () {
      return !!(window.matchMedia && window.matchMedia(MQ).matches);
    });
    React.useEffect(function () {
      if (!window.matchMedia) return;
      var m = window.matchMedia(MQ);
      var on = function () { st[1](m.matches); };
      on();
      if (m.addEventListener) m.addEventListener('change', on); else m.addListener(on);
      return function () {
        if (m.removeEventListener) m.removeEventListener('change', on); else m.removeListener(on);
      };
    }, []);
    if (layout === 'mobile') return false;
    if (layout === 'desktop') return true;
    return st[0];
  }

  var caret = h('svg', { width: 10, height: 6, viewBox: '0 0 10 6', 'aria-hidden': 'true', focusable: 'false' },
    h('polygon', { points: '0,0 10,0 5,6', fill: 'currentColor' }));
  var burger = h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M3 6h18M3 12h18M3 18h18', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', fill: 'none' }));
  var closeIcon = h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M5 5l14 14M19 5L5 19', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', fill: 'none' }));

  function Media(p) {
    if (p.src) return h('img', { className: p.className, src: p.src, alt: p.alt || '', loading: 'lazy' });
    return h('div', { className: cx(p.className, 'tsf-placeholder', 'caption'), role: 'img', 'aria-label': p.alt || '' }, p.label || '');
  }

  function Button(p) {
    var cls = cx('tsf-btn', 'button', 'tsf-btn--' + (p.variant || 'solid'),
      p.size === 'sm' && 'tsf-btn--sm', p.full && 'tsf-btn--full', p.className);
    if (p.href && !p.disabled) {
      return h('a', { className: cls, href: p.href, onClick: p.onClick }, p.children);
    }
    return h('button', { className: cls, type: p.type || 'button', disabled: p.disabled, onClick: p.onClick }, p.children);
  }

  function SiteHeader(p) {
    var lg = useLg(p.layout);
    var os = React.useState(!!p.defaultOpen);
    var open = os[0];
    var links = p.links || [];
    function item(l, i) {
      return h('a', {
        key: i, href: l.href || '#',
        className: cx('tsf-header__link', 'nav', l.active && 'is-active'),
        'aria-current': l.active ? 'page' : undefined
      }, l.label, l.menu ? h('span', { className: 'tsf-header__caret' }, caret) : null);
    }
    var all = links.map(item);
    if (p.lang) all.push(item({ label: p.lang, menu: true }, 'lang'));
    var menuLabel = p.menuLabel || 'Menú';
    return h('header', { className: cx('tsf-header', lg && 'tsf-lg', p.className) },
      h('div', { className: 'tsf-header__bar' },
        h('a', { className: 'tsf-header__brand wordmark', href: p.homeHref || '#' }, p.brand || 'The Silent Fleet'),
        lg
          ? h('nav', { className: 'tsf-header__nav', 'aria-label': menuLabel }, all)
          : h('button', {
              className: 'tsf-header__toggle', type: 'button',
              'aria-expanded': open, 'aria-label': menuLabel,
              onClick: function () { os[1](!open); }
            }, open ? closeIcon : burger)),
      !lg && open ? h('nav', { className: 'tsf-header__panel', 'aria-label': menuLabel }, all) : null);
  }

  function Hero(p) {
    var lg = useLg(p.layout);
    var style = p.image ? { backgroundImage: 'url("' + p.image + '")' } : undefined;
    return h('section', { className: cx('tsf-hero', 'tsf-on-dark', lg && 'tsf-lg', p.align === 'start' && 'tsf-hero--start', p.className), style: style },
      h('h1', { className: lg ? 'display-lg' : 'display' }, p.title),
      p.subtitle ? h('p', { className: 'tsf-hero__sub eyebrow' }, p.subtitle) : null,
      p.cta ? h(Button, { variant: 'outline-light', href: p.cta.href }, p.cta.label) : null);
  }

  function SectionHeading(p) {
    var lg = useLg(p.layout);
    var Tag = 'h' + (p.level || 2);
    return h('div', { className: cx('tsf-sh', p.align === 'start' && 'tsf-sh--start', p.className) },
      h(Tag, { className: lg ? 'h2-lg' : 'h2' }, p.title),
      p.subtitle ? h('p', { className: 'body-sm tsf-sh__sub' }, p.subtitle) : null);
  }

  function ImageCard(p) {
    return h('article', { className: cx('tsf-card', p.className) },
      h(Media, { className: 'tsf-card__media', src: p.image, alt: p.alt, label: p.placeholder }),
      h('h3', { className: 'h3 tsf-card__title' }, p.title),
      p.description ? h('p', { className: 'body-sm tsf-card__desc' }, p.description) : null);
  }

  function ProductCard(p) {
    return h('article', { className: cx('tsf-product', 'tsf-on-dark', p.className) },
      h('div', { className: 'tsf-product__media' },
        h(Media, { className: 'tsf-product__img', src: p.image, alt: p.alt || p.title, label: p.placeholder })),
      h('div', { className: 'tsf-product__panel' },
        h('h3', { className: 'h3' }, p.title),
        p.description ? h('p', { className: 'body-sm tsf-product__desc' }, p.description) : null,
        p.cta ? h(Button, { variant: 'outline-light', href: p.cta.href }, p.cta.label) : null));
  }

  function BrandRow(p) {
    var lg = useLg(p.layout);
    var logo = typeof p.logo === 'string'
      ? h('img', { className: 'tsf-brandrow__img', src: p.logo, alt: p.logoAlt || '' })
      : p.logo;
    var body = [].concat(p.children || []);
    return h('section', { className: cx('tsf-brandrow', lg && 'tsf-lg', p.reverse && 'tsf-brandrow--reverse', p.className) },
      h('div', { className: 'tsf-brandrow__logo' }, logo),
      h('div', { className: 'tsf-brandrow__text' },
        h('h3', { className: 'h3' }, p.title),
        body.map(function (t, i) { return h('p', { key: i, className: 'body-sm' }, t); })));
  }

  function FeatureItem(p) {
    return h('div', { className: cx('tsf-feature', p.className) },
      p.icon ? h('span', { className: 'tsf-feature__icon', 'aria-hidden': 'true' }, p.icon) : null,
      h('h3', { className: 'label tsf-feature__title' }, p.title),
      p.description ? h('p', { className: 'body-sm tsf-feature__desc' }, p.description) : null);
  }

  function Field(p) {
    var auto = React.useId();
    var id = p.id || auto;
    var errId = id + '-err';
    var common = {
      id: id, name: p.name || id, placeholder: p.placeholder,
      required: p.required, disabled: p.disabled,
      className: cx('tsf-field__control', 'body', p.error && 'is-invalid'),
      'aria-invalid': p.error ? 'true' : undefined,
      'aria-describedby': p.error ? errId : undefined,
      defaultValue: p.defaultValue, value: p.value, onChange: p.onChange
    };
    var ctl = p.multiline
      ? h('textarea', Object.assign({ rows: p.rows || 4 }, common))
      : h('input', Object.assign({ type: p.type || 'text' }, common));
    return h('div', { className: cx('tsf-field', p.className) },
      h('label', { className: 'label tsf-field__label', htmlFor: id }, p.label, p.required ? '*' : null),
      ctl,
      p.error ? h('p', { id: errId, className: 'caption tsf-field__error', role: 'alert' }, h('span', { 'aria-hidden': 'true' }, '! '), p.error) : null);
  }

  function SiteFooter(p) {
    var lg = useLg(p.layout);
    var auto = React.useId();
    var nl = p.newsletter;
    var contacts = p.contacts || [];
    return h('footer', { className: cx('tsf-footer', 'tsf-on-dark', lg && 'tsf-lg', p.className) },
      h('div', { className: 'tsf-footer__inner' },
        p.social ? h('div', { className: 'tsf-footer__social' }, p.social) : null,
        h('div', { className: 'tsf-footer__cols' },
          contacts.length ? h('div', { className: 'tsf-footer__col' },
            h('h2', { className: 'eyebrow tsf-footer__head' }, p.contactHeading || 'CONTACTE'),
            h('ul', { className: 'tsf-footer__list' },
              contacts.map(function (c, i) {
                return h('li', { key: i }, h('a', { className: 'body-sm tsf-footer__link', href: c.href }, c.label));
              }))) : null,
          nl ? h('form', { className: 'tsf-footer__col tsf-footer__form', onSubmit: nl.onSubmit },
            h('h2', { className: 'eyebrow tsf-footer__head' }, nl.heading || 'SUBSCREVER'),
            h('label', { className: 'body-sm', htmlFor: auto }, nl.label || 'email'),
            h('input', { id: auto, className: 'tsf-footer__input body-sm', type: 'email', name: 'email', placeholder: nl.placeholder || 'Enter email', required: true }),
            h(Button, { variant: 'brand', type: 'submit' }, nl.button || 'Junte-se agora')) : null),
        h('p', { className: 'caption tsf-footer__copy' }, p.copyright || '© 2026. All rights reserved.')));
  }

  function FieldError(id, error) {
    return error ? h('p', { id: id, className: 'caption tsf-field__error', role: 'alert' }, h('span', { 'aria-hidden': 'true' }, '! '), error) : null;
  }

  function Select(p) {
    var auto = React.useId();
    var id = p.id || auto;
    var errId = id + '-err';
    var opts = (p.options || []).map(function (o, i) {
      return h('option', { key: i, value: o.value, disabled: o.disabled }, o.label);
    });
    return h('div', { className: cx('tsf-field', p.className) },
      h('label', { className: 'label tsf-field__label', htmlFor: id }, p.label, p.required ? '*' : null),
      h('div', { className: 'tsf-select' },
        h('select', {
          id: id, name: p.name || id, required: p.required, disabled: p.disabled,
          className: cx('tsf-field__control', 'tsf-select__control', 'body', p.error && 'is-invalid'),
          'aria-invalid': p.error ? 'true' : undefined,
          'aria-describedby': p.error ? errId : undefined,
          value: p.value,
          defaultValue: p.value === undefined ? (p.defaultValue === undefined ? '' : p.defaultValue) : undefined,
          onChange: p.onChange
        },
          p.placeholder ? h('option', { value: '', disabled: true }, p.placeholder) : null,
          opts)),
      FieldError(errId, p.error));
  }

  function Checkbox(p) {
    var auto = React.useId();
    var id = p.id || auto;
    var errId = id + '-err';
    return h('div', { className: cx('tsf-check', p.className) },
      h('input', {
        id: id, type: 'checkbox', name: p.name || id, className: 'tsf-check__box',
        required: p.required, disabled: p.disabled,
        checked: p.checked, defaultChecked: p.defaultChecked, onChange: p.onChange,
        'aria-invalid': p.error ? 'true' : undefined,
        'aria-describedby': p.error ? errId : undefined
      }),
      h('label', { className: 'body tsf-check__label', htmlFor: id }, p.children, p.required ? ' *' : null),
      p.error ? h('div', { className: 'tsf-check__error' }, FieldError(errId, p.error)) : null);
  }

  function noticeIcon(v) {
    var s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
    var inner;
    if (v === 'success') inner = [h('circle', { key: 0, cx: 12, cy: 12, r: 9 }), h('path', { key: 1, d: 'M8 12.5l3 3 5-6' })];
    else if (v === 'warning') inner = [h('path', { key: 0, d: 'M12 4l9.5 16h-19z' }), h('path', { key: 1, d: 'M12 10v4M12 17h.01' })];
    else if (v === 'error') inner = [h('circle', { key: 0, cx: 12, cy: 12, r: 9 }), h('path', { key: 1, d: 'M9 9l6 6M15 9l-6 6' })];
    else inner = [h('circle', { key: 0, cx: 12, cy: 12, r: 9 }), h('path', { key: 1, d: 'M12 11v5M12 8h.01' })];
    return h('svg', Object.assign({ width: '100%', height: '100%', viewBox: '0 0 24 24', focusable: 'false', 'aria-hidden': 'true' }, s), inner);
  }

  function Notice(p) {
    var v = p.variant || 'info';
    return h('div', {
      className: cx('tsf-notice', 'tsf-notice--' + v, p.size === 'lg' && 'tsf-notice--lg', p.className),
      role: (v === 'error' || v === 'warning') ? 'alert' : 'status'
    },
      h('span', { className: 'tsf-notice__icon' }, noticeIcon(v)),
      h('div', { className: 'tsf-notice__body' },
        p.title ? h('p', { className: cx(p.size === 'lg' ? 'h3' : 'label', 'tsf-notice__title') }, p.title) : null,
        p.children ? h('div', { className: 'body-sm tsf-notice__text' }, p.children) : null));
  }

  function PdfCard(p) {
    var linked = !!p.href;
    var props = { className: cx('tsf-pdf', linked && 'tsf-pdf--link', p.className) };
    if (linked) { props.href = p.href; props.download = ''; }
    return h(linked ? 'a' : 'div', props,
      h('span', { className: 'tsf-pdf__icon caption', 'aria-hidden': 'true' }, 'PDF'),
      h('span', { className: 'tsf-pdf__text' },
        h('span', { className: 'label tsf-pdf__title' }, p.title),
        p.meta ? h('span', { className: 'body-sm tsf-pdf__meta' }, p.meta) : null));
  }

  function ChoiceChips(p) {
    var auto = React.useId();
    var name = p.name || auto;
    return h('fieldset', { className: cx('tsf-chips', p.className) },
      p.legend ? h('legend', { className: 'eyebrow tsf-sectionlabel tsf-chips__legend' }, p.legend) : null,
      h('div', { className: 'tsf-chips__row' },
        (p.options || []).map(function (o, i) {
          return h('label', { key: i, className: 'tsf-chip' },
            h('input', {
              type: 'radio', className: 'tsf-chip__input', name: name, value: o.value,
              checked: p.value === undefined ? undefined : p.value === o.value,
              defaultChecked: p.value === undefined ? p.defaultValue === o.value : undefined,
              onChange: p.onChange
            }),
            h('span', { className: 'tsf-chip__label button' }, o.label));
        })));
  }

  function LangSwitch(p) {
    var langs = p.languages || [];
    return h('div', { className: cx('tsf-lang', p.className) },
      h('select', {
        className: 'tsf-lang__select nav', 'aria-label': p.label || 'Idioma',
        value: p.value,
        defaultValue: p.value === undefined ? (p.defaultValue || (langs[0] && langs[0].code)) : undefined,
        onChange: p.onChange
      }, langs.map(function (l) { return h('option', { key: l.code, value: l.code }, l.code); })));
  }

  function SectionLabel(p) {
    return h(p.as || 'p', { className: cx('eyebrow', 'tsf-sectionlabel', p.className) }, p.children);
  }

  function LegalLinks(p) {
    var links = p.links || [];
    return h('nav', { className: cx('tsf-legal', p.className), 'aria-label': p.label || 'Legal' },
      h('ul', { className: 'tsf-legal__list' }, links.map(function (l, i) {
        return h('li', { key: i, className: 'tsf-legal__item' }, h('a', { className: 'caption tsf-legal__link', href: l.href || '#' }, l.label));
      })));
  }

  function OptionGroup(p, type) {
    var auto = React.useId();
    var name = p.name || auto;
    var errId = name + '-err';
    var vals = p.values;
    return h('fieldset', {
      className: cx('tsf-group', p.className),
      'aria-invalid': p.error ? 'true' : undefined,
      'aria-describedby': p.error ? errId : undefined
    },
      p.legend ? h('legend', { className: 'label tsf-group__legend' }, p.legend, p.required ? '*' : null) : null,
      h('div', { className: 'tsf-group__list' },
        (p.options || []).map(function (o, i) {
          var props = {
            type: type, className: 'tsf-option__input', name: name, value: o.value,
            disabled: p.disabled || o.disabled, onChange: p.onChange
          };
          if (type === 'radio') {
            props.required = p.required;
            if (p.value !== undefined) props.checked = p.value === o.value;
            else props.defaultChecked = p.defaultValue === o.value;
          } else {
            if (vals !== undefined) props.checked = vals.indexOf(o.value) > -1;
            else props.defaultChecked = (p.defaultValues || []).indexOf(o.value) > -1;
          }
          return h('label', { key: i, className: 'tsf-option' },
            h('input', props),
            h('span', { className: 'body-sm tsf-option__label' }, o.label));
        })),
      FieldError(errId, p.error));
  }
  function RadioGroup(p) { return OptionGroup(p, 'radio'); }
  function CheckboxGroup(p) { return OptionGroup(p, 'checkbox'); }

  function Figure(p) {
    var cls = cx('tsf-figure', p.className);
    var style = { aspectRatio: p.ratio || '16 / 9' };
    return h('figure', { className: cls },
      p.src
        ? h('img', { className: 'tsf-figure__img', src: p.src, alt: p.alt || '', loading: 'lazy', style: style })
        : h('div', { className: 'tsf-figure__img tsf-placeholder caption', role: 'img', 'aria-label': p.alt || '', style: style }, p.placeholder || ''),
      p.caption ? h('figcaption', { className: 'caption tsf-figure__cap' }, p.caption) : null);
  }

  window.TSF = {
    Button: Button, SiteHeader: SiteHeader, Hero: Hero, SectionHeading: SectionHeading,
    ImageCard: ImageCard, ProductCard: ProductCard, BrandRow: BrandRow,
    FeatureItem: FeatureItem, Field: Field, SiteFooter: SiteFooter,
    Select: Select, Checkbox: Checkbox, Notice: Notice, PdfCard: PdfCard,
    ChoiceChips: ChoiceChips, LangSwitch: LangSwitch, SectionLabel: SectionLabel, LegalLinks: LegalLinks,
    RadioGroup: RadioGroup, CheckboxGroup: CheckboxGroup, Figure: Figure
  };
})();
