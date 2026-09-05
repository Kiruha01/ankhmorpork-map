import type maplibregl from 'maplibre-gl'
import type { OverlayTheme } from '../../../shared/config/map'

/** Public map contract implemented by every searchable GeoJSON domain. */
export type MapObjectDomain = {
  sourceId: string
  geoJsonUrl: string
  register: (map: maplibregl.Map, theme: OverlayTheme) => void
  applyTheme: (map: maplibregl.Map, theme: OverlayTheme) => void
  applySearchResults: (map: maplibregl.Map, featureIds: readonly (string | number)[]) => void
  /** Visual geometry layers that may be selected by a primary map click. */
  interactiveLayerIds: readonly string[]
}
