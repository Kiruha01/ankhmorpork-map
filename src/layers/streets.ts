import type maplibregl from 'maplibre-gl'

const SOURCE_ID = 'streets-geojson'

const source = {
  type: 'geojson' as const,
  data: 'http://192.168.0.197:8000/street.geojson',
}

function addRoadLayer(
  map: maplibregl.Map,
  id: string,
  roadClass: string,
  color: string,
  zoomPers,
) {
  map.addLayer({
    id,
    type: "line",
    source: SOURCE_ID,

    filter: [
      "==",
      ["get", "type"],
      roadClass
    ],

    layout: {
      "line-cap": "round",
      "line-join": "round"
    },

    paint: {
      "line-color": color,

      'line-width': [
        "interpolate",
        ["exponential", 1.5],
        ["zoom"],
    
        12, 0.6*zoomPers,
        14, 0.9*zoomPers,
        16, 4*zoomPers,
        18, 18*zoomPers,
        20, 50*zoomPers
      ],
    }
  });
}

export function addStreetsLayer(map: maplibregl.Map): void {
  map.addSource(SOURCE_ID, source)
  // addRoadLayer(map, "streets-yards-2", "yard", '#d8d8d8', 1.2)
  addRoadLayer(map, "streets-yards", "yard", '#FFFFFF', 1)
  // addRoadLayer(map, "streets-streets-2", "street", '#cdc5a8', 1.2)
  addRoadLayer(map, "streets-streets", "street", '#FFF6D3', 1)
  // addRoadLayer(map, "streets-mains-2", "main", '#E9E9E9', 2.5)
  addRoadLayer(map, "streets-mains", "main", '#FFC44D', 1.8)
}
