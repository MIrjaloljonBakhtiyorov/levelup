import { createContext, useContext } from "react";

export type HomeLanguage = "uz" | "ru" | "en";
export type TranslationValues = Record<string, string | number>;

export type HomeI18nContextValue = {
  language: HomeLanguage;
  setLanguage: (language: HomeLanguage) => void;
  t: (text: string, values?: TranslationValues) => string;
};

export const HomeI18nContext = createContext<HomeI18nContextValue | null>(null);

export function useHomeI18n() {
  const context = useContext(HomeI18nContext);
  if (!context) {
    throw new Error("useHomeI18n must be used inside HomeI18nProvider");
  }
  return context;
}
