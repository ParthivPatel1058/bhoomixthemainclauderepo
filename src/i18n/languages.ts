/**
 * The 22 languages of the Eighth Schedule of the Indian Constitution, plus
 * English. Codes are ISO 639-1 where one exists, ISO 639-3 otherwise (Bodo,
 * Konkani, Maithili, Manipuri, Santali), which is also what Gemini expects.
 */

export interface LanguageMeta {
  code: string;
  /** Endonym — shown in the picker so speakers recognise their own language. */
  native: string;
  english: string;
  /** Right-to-left scripts need dir="rtl" on <html>. */
  rtl?: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'brx', native: 'बड़ो', english: 'Bodo' },
  { code: 'doi', native: 'डोगरी', english: 'Dogri' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ks', native: 'کٲشُر', english: 'Kashmiri', rtl: true },
  { code: 'kok', native: 'कोंकणी', english: 'Konkani' },
  { code: 'mai', native: 'मैथिली', english: 'Maithili' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'mni', native: 'ꯃꯤꯇꯩꯂꯣꯟ', english: 'Manipuri' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'ne', native: 'नेपाली', english: 'Nepali' },
  { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'sa', native: 'संस्कृतम्', english: 'Sanskrit' },
  { code: 'sat', native: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali' },
  { code: 'sd', native: 'سنڌي', english: 'Sindhi', rtl: true },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'ur', native: 'اردو', english: 'Urdu', rtl: true },
];

export type LanguageCode = string;

export const LANGUAGE_MAP: Record<string, LanguageMeta> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
);

/** Languages with hand-authored strings; everything else is machine-translated. */
export const AUTHORED: ReadonlySet<string> = new Set(['en', 'hi']);

export const isRTL = (code: string) => LANGUAGE_MAP[code]?.rtl === true;

export const languageName = (code: string) => LANGUAGE_MAP[code]?.native ?? code;

/**
 * The 22 Eighth Schedule languages — everything in LANGUAGES except English.
 *
 * Derived rather than hand-counted: UI copy that claims a number must read it
 * from here, or the claim drifts the moment a language is added or removed.
 * English is excluded because it is not an Indian language for this purpose,
 * which is exactly the distinction the older "23 Indian languages" copy lost.
 */
export const INDIAN_LANGUAGES: readonly LanguageMeta[] = LANGUAGES.filter(
  (l) => l.code !== 'en',
);

/** How many Indian languages the app offers. Currently 22. */
export const INDIAN_LANGUAGE_COUNT = INDIAN_LANGUAGES.length;

/** Total pickable languages, including English. Currently 23. */
export const TOTAL_LANGUAGE_COUNT = LANGUAGES.length;
