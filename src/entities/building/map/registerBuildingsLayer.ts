import maplibregl from 'maplibre-gl'
import type { Geometry } from 'geojson'

export const BUILDINGS_SOURCE_ID = 'buildings-geojson'

const source = {
  type: 'geojson' as const,
  data: 'http://192.168.0.197:8000/build2.geojson',
}

const fillLayer: maplibregl.FillLayerSpecification = {
  id: 'buildings-fill',
  type: 'fill',
  source: BUILDINGS_SOURCE_ID,
  filter: ['==', '$type', 'Polygon'],
  paint: {
    'fill-color': ['case', ['get', 'is_landmark'], '#c1ed30', '#9b9b9b'],
    'fill-opacity': 0.35,
  },
}

function extendBoundsFromCoordinates(bounds: maplibregl.LngLatBounds, coordinates: unknown): boolean {
  if (!Array.isArray(coordinates)) return false

  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    bounds.extend([coordinates[0], coordinates[1]])
    return true
  }

  return coordinates.reduce(
    (hasCoordinates, coordinate) => extendBoundsFromCoordinates(bounds, coordinate) || hasCoordinates,
    false,
  )
}

function extendBoundsFromGeometry(bounds: maplibregl.LngLatBounds, geometry: Geometry): boolean {
  if ('coordinates' in geometry) return extendBoundsFromCoordinates(bounds, geometry.coordinates)

  return geometry.geometries.reduce(
    (hasCoordinates, nestedGeometry) => extendBoundsFromGeometry(bounds, nestedGeometry) || hasCoordinates,
    false,
  )
}

function fitMapToBuildings(map: maplibregl.Map): void {
  const bounds = new maplibregl.LngLatBounds()
  const hasCoordinates = map
    .querySourceFeatures(BUILDINGS_SOURCE_ID)
    .reduce((hasFeatures, feature) => extendBoundsFromGeometry(bounds, feature.geometry) || hasFeatures, false)

  if (hasCoordinates) map.fitBounds(bounds, { padding: 48, maxZoom: 18 })
}

export function registerBuildingsLayer(map: maplibregl.Map): void {
  map.addSource(BUILDINGS_SOURCE_ID, source)
  map.addLayer(fillLayer)

  let buildingsFitted = false
  map.on('sourcedata', (event) => {
    if (buildingsFitted || event.sourceId !== BUILDINGS_SOURCE_ID || !event.isSourceLoaded) return

    fitMapToBuildings(map)
    buildingsFitted = true
  })
}
