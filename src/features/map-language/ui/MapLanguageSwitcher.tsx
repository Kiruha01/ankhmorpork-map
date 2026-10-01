import { useTranslation } from 'react-i18next'
import { AVAILABLE_LANGUAGES, changeLanguage } from '../../../shared/config/i18n'
import './MapLanguageSwitcher.css'

export function MapLanguageSwitcher({ onSelect }: { onSelect: () => void }) {
  const { i18n, t } = useTranslation()
  return <div className="map-language-switcher__options" role="group" aria-label={t('interface.language.menuLabel')}>
    {AVAILABLE_LANGUAGES.map(language => <button key={language.code} type="button"
      className="map-language-switcher__option" aria-pressed={language.code === i18n.resolvedLanguage}
      onClick={() => { void changeLanguage(language.code); onSelect() }}>
      <span aria-hidden="true">{language.flag}</span><span className="map-language-switcher__name">{language.name}</span>
      <span className="map-language-switcher__code">{language.code.toUpperCase()}</span>
      <span aria-hidden="true">{language.code === i18n.resolvedLanguage ? '✓' : ''}</span>
    </button>)}
  </div>
}
