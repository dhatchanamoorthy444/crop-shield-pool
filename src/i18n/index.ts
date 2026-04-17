import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import hi from "./locales/hi";
import ta from "./locales/ta";
import kn from "./locales/kn";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      kn: { translation: kn },
    },
    lng: typeof window !== "undefined" ? localStorage.getItem("cs_lang") || "en" : "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export default i18n;
