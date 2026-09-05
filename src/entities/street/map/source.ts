import type maplibregl from 'maplibre-gl'

export const STREETS_SOURCE_ID = 'streets-geojson'
export const STREETS_GEOJSON_URL = '/geojsons/street.geojson'

export const EMPTY_STREETS_SOURCE: maplibregl.GeoJSONSourceSpecification = {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
}
