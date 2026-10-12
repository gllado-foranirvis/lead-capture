import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { icon } from '../site/js/icons.js';
import { createChrome } from '../site/js/ui/chrome.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';

const noop = () => {};
const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });

const entry = (extra = {}) => EntryScreen({
  t: DICT.es, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, profile: '', profileLegend: DICT.es.profileLegend,
  profileOptions: [{ value: 'profesional', label: DICT.es.profileDistribuidor }, { value: 'particular', label: DICT.es.profileParticular }],
  onProfile: noop, onClearProfile: noop, legalQuery: '?lang=es', ...extra,
});
const buttons = (tree) => byType(tree, 'T.Button');

test('capçalera: marca i selector d\'idioma amb codis en majúscules', () => {
  const tree = Header({ t: DICT.ca, lang: 'ca', onLang: noop });
  assert.equal(textOf(tree).includes(CONFIG.brand), true);
  assert.equal(tree.type, 'header', 'la capçalera és un <header> (landmark de banner)');
  const [lang] = byType(tree, 'T.LangSwitch');
  assert.equal(lang.props.value, 'CA');
  assert.deepEqual(lang.props.languages.map((l) => l.code), ['ES', 'CA', 'PT', 'EN']);
});

test('capçalera: la marca és un enllaç a l\'inici; el clic normal va a l\'inici sense recarregar i el clic amb modificador obre l\'enllaç', () => {
  let home = 0;
  const tree = Header({ t: DICT.es, lang: 'es', onLang: noop, onHome: () => home++, homeHref: '?o=tauleta&lang=es' });
  const [brand] = findAll(tree, (n) => n.type === 'a' && n.props.className === 'wordmark');
  assert.deepEqual([textOf(brand), brand.props.href], [CONFIG.brand, '?o=tauleta&lang=es']);
  const click = (extra = {}) => { const e = { button: 0, prevented: false, preventDefault() { this.prevented = true; }, ...extra }; brand.props.onClick(e); return e.prevented; };
  assert.equal(click(), true);
  assert.equal(home, 1);
  for (const modifier of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) assert.equal(click(modifier), false, JSON.stringify(modifier));
  assert.equal(home, 1, 'amb modificador no s\'executa l\'acció: el navegador obre l\'enllaç');
});
test('entrada sense Extra 1: com l\'MVP (WhatsApp principal, cap botó nou)', () => {
  const [wa, mail] = buttons(entry());
  assert.equal(wa.props.variant, undefined);
  assert.equal(mail.props.variant, 'outline');
  assert.equal(buttons(entry()).length, 2);
  assert.equal(findAll(entry(), (n) => n.type === 'h1').length, 1);
});
test('entrada: línia explicativa, adreça visible i enllaços legals amb la query', () => {
  const tree = entry({ legalQuery: '?lang=es&extra1=1' });
  assert.ok(textOf(tree).includes(DICT.es.contactHint));
  assert.ok(textOf(tree).includes(`${DICT.es.contactFallback} ${CONFIG.email}`));
  const [legal] = byType(tree, 'T.LegalLinks');
  assert.equal(legal.props.links[0].href, 'privacy.html?lang=es&extra1=1');
});
test('entrada: el perfil és desmarcable', () => {
  const wrapper = findAll(entry({ profile: 'particular' }), (n) => n.type === 'div' && typeof n.props.onClick === 'function' && typeof n.props.onKeyDown === 'function');
  assert.equal(wrapper.length, 1);
});

