import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import { BASE_MAP_VARIANTS, type BaseMapVariantId } from '../../../shared/config/map'
import './MapBasemapSwitcher.css'

type Props = {
  map: maplibregl.Map | null
  selectedVariant: BaseMapVariantId
  onVariantChange: (variant: BaseMapVariantId) => void
}
const variantTranslationKeys: Record<BaseMapVariantId, string> = {
  orig: 'interface.basemap.original', rus: 'interface.basemap.russian', landscape: 'interface.basemap.landscape',
}
export function MapBasemapSwitcher({ map, selectedVariant, onVariantChange }: Props) {
  const { t } = useTranslation()
  return <div className="map-basemap-switcher__options" aria-label={t('interface.basemap.ariaLabel')}>
    {(Object.keys(BASE_MAP_VARIANTS) as BaseMapVariantId[]).map(variant => <button key={variant} type="button"
      className={`map-basemap-switcher__option${variant === selectedVariant ? ' map-basemap-switcher__option--active' : ''}`}
      disabled={!map} aria-pressed={variant === selectedVariant} onClick={() => onVariantChange(variant)}>
      <img src={BASE_MAP_VARIANTS[variant].previewUrl} alt="" />
      <span>{t(variantTranslationKeys[variant])}</span>
    </button>)}
  </div>
}
