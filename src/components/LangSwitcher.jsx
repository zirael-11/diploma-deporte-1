import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../slices/languageSlice';

export default function LangSwitcher() {
  const dispatch = useDispatch();
  const language = useSelector(state => state.language.currentLanguage);
  const { t } = useTranslation();
  return <div className="lang-switcher" role="group" aria-label={t('Язык')}>
    {[['ru', 'RU', 'Русский'], ['en', 'EN', 'English'], ['es', 'ES', 'Español']].map(([code, label, name]) =>
      <button key={code} type="button" lang={code} aria-label={name} aria-pressed={language === code}
        onClick={() => dispatch(setLanguage(code))}>{label}</button>)}
  </div>;
}
