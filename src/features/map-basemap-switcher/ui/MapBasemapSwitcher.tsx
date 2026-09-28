import { useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import {
  BASE_MAP_VARIANTS,
  type BaseMapVariantId,
} from '../../../entities/base-map/map/registerBaseMapLayer'
import './MapBasemapSwitcher.css'

type MapBasemapSwitcherProps = {
  map: maplibregl.Map | null
  selectedVariant: BaseMapVariantId
  onVariantChange: (variant: BaseMapVariantId) => void
}

const variantTranslationKeys: Record<BaseMapVariantId, string> = {
  orig: 'interface.basemap.original',
  rus: 'interface.basemap.russian',
  landscape: 'interface.basemap.landscape',
}

export function MapBasemapSwitcher({ map, selectedVariant, onVariantChange }: MapBasemapSwitcherProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const selectVariant = (variant: BaseMapVariantId) => {
    if (!map || variant === selectedVariant) return

    onVariantChange(variant)
    setIsOpen(false)
  }

  return (
    <div className={`map-basemap-switcher${isOpen ? ' map-basemap-switcher--open' : ''}`} aria-label={t('interface.basemap.ariaLabel')}>
      <button
        type="button"
        className="map-basemap-switcher__trigger"
        disabled={!map}
        aria-expanded={isOpen}
        aria-controls="map-basemap-options"
        onClick={() => setIsOpen((current) => !current)}
      >
        {t('interface.basemap.trigger', { label: t(variantTranslationKeys[selectedVariant]) })}
      </button>

      <div id="map-basemap-options" className="map-basemap-switcher__options">
        {(Object.keys(BASE_MAP_VARIANTS) as BaseMapVariantId[]).map((variant) => (
          <button
            key={variant}
            type="button"
            className={variant === selectedVariant ? 'map-basemap-switcher__option map-basemap-switcher__option--active' : 'map-basemap-switcher__option'}
            disabled={!map}
            onClick={() => selectVariant(variant)}
          >
            <img src={BASE_MAP_VARIANTS[variant].previewUrl} alt={t('interface.basemap.previewAlt', { label: t(variantTranslationKeys[variant]) })} />
            <span>{t(variantTranslationKeys[variant])}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
