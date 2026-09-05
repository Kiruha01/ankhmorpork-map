import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AVAILABLE_LANGUAGES, changeLanguage } from '../../../shared/config/i18n'
import './MapLanguageSwitcher.css'

export function MapLanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const selectedLanguage = AVAILABLE_LANGUAGES.find(({ code }) => code === i18n.resolvedLanguage) ?? AVAILABLE_LANGUAGES[0]

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  if (!selectedLanguage) return null

  return (
    <div ref={switcherRef} className="map-language-switcher">
      <button
        type="button"
        className="map-language-switcher__trigger"
        aria-expanded={isOpen}
        aria-controls="map-language-options"
        aria-label={t('interface.language.menuLabel')}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div id="map-language-options" className="map-language-switcher__options" role="menu" aria-label={t('interface.language.menuLabel')}>
          {AVAILABLE_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className="map-language-switcher__option"
              role="menuitemradio"
              aria-checked={language.code === selectedLanguage.code}
              onClick={() => {
                void changeLanguage(language.code)
                setIsOpen(false)
              }}
            >
              <span aria-hidden="true">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
