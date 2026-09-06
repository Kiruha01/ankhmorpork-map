import type maplibregl from 'maplibre-gl'

export const PARKS_SOURCE_ID = 'parks-geojson'
export const PARKS_GEOJSON_URL = `${import.meta.env.BASE_URL}geojsons/parks.geojson`

export const EMPTY_PARKS_SOURCE: maplibregl.GeoJSONSourceSpecification = {
  type: 'geojson',
  data: { type: 'FeatureCollection', features: [] },
}
