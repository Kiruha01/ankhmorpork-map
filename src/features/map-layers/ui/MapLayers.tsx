import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import { BASE_MAP_VARIANTS, type BaseMapVariantId, type LayerVisibility } from '../../../shared/config/map'
import { MapBasemapSwitcher } from '../../map-basemap-switcher/ui/MapBasemapSwitcher'

type Props = {
  map: maplibregl.Map | null
  variant: BaseMapVariantId
  onVariantChange: (variant: BaseMapVariantId) => void
  visibility: LayerVisibility
  onVisibilityChange: (id: string, visible: boolean) => void
  showAttributes: boolean
  onShowAttributesChange: (value: boolean) => void
  showZoom: boolean
  onShowZoomChange: (value: boolean) => void
  showNavigation: boolean
  onShowNavigationChange: (value: boolean) => void
}
export function MapLayers(props: Props) {
  const { t } = useTranslation()
  return <>
    <h3>{t('interface.layers.mapType')}</h3>
    <MapBasemapSwitcher map={props.map} selectedVariant={props.variant} onVariantChange={props.onVariantChange} />
    <h3>{t('interface.layers.options')}</h3>
    {BASE_MAP_VARIANTS[props.variant].visibilityOptions.map(option => <label className="map-controls__switch" key={option.id}>
      <span>{t(option.labelKey)}</span>
      <input type="checkbox" checked={props.visibility[option.id] ?? option.defaultVisible}
        onChange={event => props.onVisibilityChange(option.id, event.target.checked)} />
    </label>)}
    <div className="map-controls__divider" />
    <h3>{t('interface.layers.display')}</h3>
    <label className="map-controls__switch"><span>{t('interface.inspector.geoJsonAttributes')}</span>
      <input type="checkbox" checked={props.showAttributes} onChange={event => props.onShowAttributesChange(event.target.checked)} />
    </label>
    <label className="map-controls__switch"><span>{t('interface.layers.showZoom')}</span>
      <input type="checkbox" checked={props.showZoom} onChange={event => props.onShowZoomChange(event.target.checked)} />
    </label>
    <label className="map-controls__switch"><span>{t('interface.layers.showNavigation')}</span>
      <input type="checkbox" checked={props.showNavigation} onChange={event => props.onShowNavigationChange(event.target.checked)} />
    </label>
  </>
}
