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
}

export function MapBasemapSwitcher({ map, selectedVariant, onVariantChange }: MapBasemapSwitcherProps) {
  const { t } = useTranslation()
  const selectVariant = (variant: BaseMapVariantId) => {
    if (!map || variant === selectedVariant) return

    onVariantChange(variant)
  }

  return (
    <div className="map-basemap-switcher" aria-label={t('interface.basemap.ariaLabel')}>
      <button type="button" className="map-basemap-switcher__trigger" disabled={!map}>
        {t('interface.basemap.trigger', { label: t(variantTranslationKeys[selectedVariant]) })}
      </button>

      <div className="map-basemap-switcher__options">
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
