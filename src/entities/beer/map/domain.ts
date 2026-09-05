import { applyBeerSearchResults, applyBeerTheme } from './layers'
import { BEERS_CIRCLE_LAYER_ID } from './layers'
import { registerBeerLayer } from './registerBeerLayer'
import { BEERS_GEOJSON_URL, BEERS_SOURCE_ID } from './source'
import type { MapObjectDomain } from '../../map-object/map/types'

export const beerMapDomain = {
  sourceId: BEERS_SOURCE_ID,
  geoJsonUrl: BEERS_GEOJSON_URL,
  register: registerBeerLayer,
  applyTheme: applyBeerTheme,
  applySearchResults: applyBeerSearchResults,
  interactiveLayerIds: [BEERS_CIRCLE_LAYER_ID],
} satisfies MapObjectDomain
