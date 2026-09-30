import { en } from "./en";
import { ko } from "./ko";
export const SUPPORTED_LOCALES = ["ko", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "survivor-protocol.locale";
export const FONT_FAMILY =
  '"Pretendard", "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif';
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];
export type TranslationKey = Paths<typeof en>;
export type TranslationParams = Record<string, string | number>;
const dictionaries = { ko, en };
let locale: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();
const warned = new Set<string>();
const supported = (value: unknown): value is Locale => value === "ko" || value === "en";
export function getLocale() { return locale; }
/** Pure decision, separate from storage and browser access for iframe/SSR safety. */
export function resolveLocale(saved: unknown, browserLanguage: unknown): Locale {
  if (supported(saved)) return saved;
  return typeof browserLanguage === "string" && /^ko(?:-|$)/i.test(browserLanguage) ? "ko" : DEFAULT_LOCALE;
}
export function detectLocale(): Locale {
  let saved: unknown, language: unknown;
  try { saved = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY); } catch { }
  try { language = globalThis.navigator?.language; } catch { }
  return resolveLocale(saved, language);
}
export function initLocale() { setLocale(detectLocale(), false); }
export function t(key: TranslationKey, params: TranslationParams = {}): string {
  const lookup = (lang: Locale) => key.split(".").reduce<unknown>((value, part) =>
    value && typeof value === "object" && Object.hasOwn(value, part)
      ? (value as Record<string, unknown>)[part] : undefined, dictionaries[lang]);
  const current = lookup(locale), fallback = lookup("en");
  if (typeof current !== "string" && import.meta.env?.DEV && !warned.has(`${locale}:${key}`)) {
    warned.add(`${locale}:${key}`);
    console.warn(`[i18n] Missing translation: ${locale}:${key}`);
  }
  const message = typeof current === "string" ? current : typeof fallback === "string" ? fallback : key;
  return message.replace(/\{(\w+)\}/g, (token, name: string) => params[name] === undefined ? token : String(params[name]));
}
export function onLocaleChange(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
/** Only deliberate selection persists; automatic detection never creates a preference. */
export function setLocale(next: Locale, persist = true) {
  if (!supported(next)) throw new Error(`Unsupported locale: ${next}`);
  locale = next;
  if (persist) try { globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, next); } catch { }
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  }
  for (const listener of listeners) listener();
}
