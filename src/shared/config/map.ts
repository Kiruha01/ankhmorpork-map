import type maplibregl from 'maplibre-gl'

export const MAP_OPTIONS: Omit<maplibregl.MapOptions, 'container'> = {
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  center: [0.02, -0.01],
  zoom: 15,
  renderWorldCopies: false,
  minZoom: 13,
  maxZoom: 21,
}
