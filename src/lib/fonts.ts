/**
 * On-demand webfont loading for the non-Latin scripts.
 *
 * BhoomiX speaks the 22 Eighth Schedule languages plus English, across eleven
 * scripts. Before this existed, every Indic language fell out of the design
 * system entirely: the loaded faces were Latin-only, so Tamil, Bengali, Odia
 * and the rest rendered in whatever the operating system happened to pick.
 * The app looked designed in English and improvised in everything else.
 *
 * Loading all eleven families up front is the obvious fix and the wrong one —
 * it bills every farmer for ten scripts they will never read. Devanagari ships
 * eagerly in index.html because Hindi is the second language on nearly every
 * screen; the rest arrive the moment a language that needs them is chosen.
 *
 * Google returns one stylesheet per family and the browser still only fetches
 * the glyph files it paints, so a repeat visitor pays nothing beyond cache
 * revalidation.
 */

/** Script family per language code. Codes sharing a script share a font. */
const SCRIPT_BY_LANG: Record<string, string> = {
  // Devanagari — already loaded in index.html, listed for completeness.
  hi: 'Noto Sans Devanagari',
  brx: 'Noto Sans Devanagari',
  doi: 'Noto Sans Devanagari',
  kok: 'Noto Sans Devanagari',
  mai: 'Noto Sans Devanagari',
  mr: 'Noto Sans Devanagari',
  ne: 'Noto Sans Devanagari',
  sa: 'Noto Sans Devanagari',

  as: 'Noto Sans Bengali',
  bn: 'Noto Sans Bengali',
  gu: 'Noto Sans Gujarati',
  kn: 'Noto Sans Kannada',
  ml: 'Noto Sans Malayalam',
  mni: 'Noto Sans Meetei Mayek',
  or: 'Noto Sans Oriya',
  pa: 'Noto Sans Gurmukhi',
  sat: 'Noto Sans Ol Chiki',
  ta: 'Noto Sans Tamil',
  te: 'Noto Sans Telugu',

  // Perso-Arabic. Nastaliq is the correct style for Urdu and reads far better
  // to its speakers than the naskh Noto Sans Arabic would give them.
  ur: 'Noto Nastaliq Urdu',
  ks: 'Noto Nastaliq Urdu',
  sd: 'Noto Naskh Arabic',
};

/** Families already requested this session, so a language switch is idempotent. */
const loaded = new Set<string>(['Noto Sans Devanagari']);

function injectFamily(family: string) {
  if (loaded.has(family)) return;
  loaded.add(family);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Nastaliq has no 500/600; asking for weights a family lacks makes Google
  // synthesise them, which looks worse than letting the browser pick.
  const weights = family.includes('Nastaliq') ? '400;700' : '400;500;600;700';
  link.href =
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}` +
    `:wght@${weights}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Ensure the script for `lang` is available. Safe to call on every language
 * change; repeat calls for an already-loaded family do nothing.
 */
export function ensureScriptFor(lang: string) {
  const family = SCRIPT_BY_LANG[lang];
  if (family) injectFamily(family);
}

/**
 * Load every script at once. The language picker shows all 23 endonyms
 * together, so it is the one place that genuinely needs all of them.
 */
export function ensureAllScripts() {
  for (const family of new Set(Object.values(SCRIPT_BY_LANG))) injectFamily(family);
}

/**
 * The font stack for a language, for use as a CSS value. The Latin faces lead
 * so English inside a Hindi sentence — product names, units, numerals — still
 * sets in the brand face rather than the fallback.
 */
export function fontStackFor(lang: string): string {
  const family = SCRIPT_BY_LANG[lang];
  return family ? `Inter, "${family}", system-ui, sans-serif` : 'Inter, system-ui, sans-serif';
}
