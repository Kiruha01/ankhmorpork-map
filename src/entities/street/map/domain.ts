import { applyStreetSearchResults, applyStreetTheme } from './layers'
import { STREET_LAYER_IDS } from './layers'
import { registerStreetsLayer } from './registerStreetsLayer'
import { STREETS_GEOJSON_URL, STREETS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const streetMapDomain = {
  sourceId: STREETS_SOURCE_ID,
  geoJsonUrl: STREETS_GEOJSON_URL,
  register: registerStreetsLayer,
  applyTheme: applyStreetTheme,
  applySearchResults: applyStreetSearchResults,
  interactiveLayerIds: [STREET_LAYER_IDS.yard, STREET_LAYER_IDS.street, STREET_LAYER_IDS.main],
} satisfies MapObjectDomain
