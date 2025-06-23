import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// ✅ Ajoute le type explicitement pour corriger l'erreur
import fr from './fr.json';
import en from './en.json';
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    resources: {
        fr: { translation: fr },
        en: { translation: en },
    },
    fallbackLng: 'fr',
    interpolation: {
        escapeValue: false,
    },
});
export default i18n;
