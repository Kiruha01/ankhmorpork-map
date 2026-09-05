import type maplibregl from 'maplibre-gl'

export type BaseMapVariantId = 'orig' | 'rus'

export const BASE_MAP_VARIANT_STORAGE_KEY = 'map-basemap-variant'

export type OverlayTheme = {
  buildingFill: string
  buildingLandmarkFill: string
  buildingOutline: string
  roadYard: string
  roadStreet: string
  roadMain: string
  labelText: string
  labelHalo: string
  beerMarker: string
  beerMarkerStroke: string
}

export const BASE_MAP_VARIANTS: Record<BaseMapVariantId, { tilesUrl: string; overlayTheme: OverlayTheme }> = {
  orig: {
    tilesUrl: 'https://tiles.klisov.ru/orig/{z}/{x}/{y}.jpg',
    overlayTheme: {
      buildingFill: '#56360038',
      buildingLandmarkFill: '#b39b0038',
      buildingOutline: '#666633',
      roadYard: '#f3e8b0',
      roadStreet: '#f3e3b0',
      roadMain: '#d0a57a',
      labelText: '#201914',
      labelHalo: '#feffe4',
      beerMarker: '#c77622',
      beerMarkerStroke: '#fff6d3',
    },
  },
  rus: {
    tilesUrl: 'https://tiles.klisov.ru/rus/{z}/{x}/{y}.jpg',
    overlayTheme: {
      buildingFill: '#56360038',
      buildingLandmarkFill: '#b39b0038',
      buildingOutline: '#666633',
      roadYard: '#f3e8b0',
      roadStreet: '#f3e3b0',
      roadMain: '#d0a57a',
      labelText: '#201914',
      labelHalo: '#feffe4',
      beerMarker: '#c77622',
      beerMarkerStroke: '#fff6d3',
    },
  },
}

export function getInitialBaseMapVariant(): BaseMapVariantId {
  const storedVariant = typeof window === 'undefined' ? null : window.localStorage.getItem(BASE_MAP_VARIANT_STORAGE_KEY)

  return storedVariant !== null && storedVariant in BASE_MAP_VARIANTS
    ? storedVariant as BaseMapVariantId
    : 'orig'
}

export const MAP_OPTIONS: Omit<maplibregl.MapOptions, 'container'> = {
  style: {
    version: 8,
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    sources: {},
    layers: [],
  },
  center: [0.02, -0.01],
  zoom: 15,
  renderWorldCopies: false,
  minZoom: 13,
  maxZoom: 21,
}
