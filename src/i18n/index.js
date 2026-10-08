import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getSavedLanguage } from '../slices/languageSlice';
import ru from '../locales/ru/translation.json';
import en from '../locales/en/translation.json';
import es from '../locales/esp/translation.json';

export const i18nReady = i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en }, es: { translation: es } },
  lng: getSavedLanguage(),
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en', 'es'],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const updateDocumentLanguage = language => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.title = i18n.t('pageTitle');
  }
};
i18n.on('languageChanged', updateDocumentLanguage);
i18nReady.then(() => updateDocumentLanguage(i18n.language));
export default i18n;
