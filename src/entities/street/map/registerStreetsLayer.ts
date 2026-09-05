import type maplibregl from 'maplibre-gl'

export const STREETS_SOURCE_ID = 'streets-geojson'

const source = {
  type: 'geojson' as const,
  data: 'http://192.168.0.197:8000/street.geojson',
}

function addRoadLayer(
  map: maplibregl.Map,
  id: string,
  roadClass: string,
  color: string,
  zoomMultiplier: number,
): void {
  map.addLayer({
    id,
    type: 'line',
    source: STREETS_SOURCE_ID,
    filter: ['==', ['get', 'type'], roadClass],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': color,
      'line-width': [
        'interpolate',
        ['exponential', 1.5],
        ['zoom'],
        12, 0.6 * zoomMultiplier,
        14, 0.9 * zoomMultiplier,
        16, 4 * zoomMultiplier,
        18, 18 * zoomMultiplier,
        20, 50 * zoomMultiplier,
      ],
    },
  })
}

export function registerStreetsLayer(map: maplibregl.Map): void {
  map.addSource(STREETS_SOURCE_ID, source)
  addRoadLayer(map, 'streets-yards', 'yard', '#FFFFFF', 1)
  addRoadLayer(map, 'streets-streets', 'street', '#FFF6D3', 1)
  addRoadLayer(map, 'streets-mains', 'main', '#FFC44D', 1.8)
}
