import type maplibregl from 'maplibre-gl'

export const BEERS_SOURCE_ID = 'beers-geojson'
export const BEERS_GEOJSON_URL = '/geojsons/beers.geojson'

export const EMPTY_BEERS_SOURCE: maplibregl.GeoJSONSourceSpecification = {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
}
