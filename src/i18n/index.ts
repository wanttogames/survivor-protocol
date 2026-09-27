import { en } from "./en";
import { ko } from "./ko";
export type Locale = "ko" | "en";
export const DEFAULT_LOCALE: Locale = "ko";
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
export function getLocale() {
  return locale;
}
export function t(key: TranslationKey, params: TranslationParams = {}): string {
  const lookup = (lang: Locale) =>
    key
      .split(".")
      .reduce<unknown>(
        (value, part) =>
          value && typeof value === "object"
            ? (value as Record<string, unknown>)[part]
            : undefined,
        dictionaries[lang],
      );
  const message = lookup(locale) ?? lookup("en");
  return (typeof message === "string" ? message : key).replace(
    /\{(\w+)\}/g,
    (token, name: string) =>
      params[name] === undefined ? token : String(params[name]),
  );
}
export function onLocaleChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function setLocale(next: Locale) {
  if (!(next in dictionaries)) throw new Error(`Unsupported locale: ${next}`);
  locale = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.title = t("meta.title");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("meta.description"));
  }
  for (const listener of listeners) listener();
}
