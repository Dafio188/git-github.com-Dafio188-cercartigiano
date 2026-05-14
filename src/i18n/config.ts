import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationIT from './locales/it.json';
import translationEN from './locales/en.json';
import translationFR from './locales/fr.json';
import translationES from './locales/es.json';
import translationDE from './locales/de.json';

const resources = {
  it: { translation: translationIT },
  en: { translation: translationEN },
  fr: { translation: translationFR },
  es: { translation: translationES },
  de: { translation: translationDE }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    supportedLngs: ['it', 'en', 'fr', 'es', 'de'],
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
