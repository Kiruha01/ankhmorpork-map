import type maplibregl from 'maplibre-gl'

const SOURCE_ID = 'base-raster-source'

export type BaseMapVariantId = 'orig' | 'rus'

export const BASE_MAP_VARIANTS: Record<BaseMapVariantId, { tilesUrl: string }> = {
  orig: {
    tilesUrl: 'https://tiles.klisov.ru/orig/{z}/{x}/{y}.jpg',
  },
  rus: {
    tilesUrl: 'https://tiles.klisov.ru/rus/{z}/{x}/{y}.jpg',
  },
}

const source = {
  type: 'raster' as const,
  tiles: [BASE_MAP_VARIANTS.orig.tilesUrl],
  tileSize: 512,
  minzoom: 13,
  maxzoom: 20,
}

export function registerBaseMapLayer(map: maplibregl.Map): void {
  map.addSource(SOURCE_ID, source)
  map.addLayer({
    id: 'base-raster-layer',
    type: 'raster',
    source: SOURCE_ID,
    paint: { 'raster-fade-duration': 0 },
  })
}

export function switchBaseMapVariant(map: maplibregl.Map, variant: BaseMapVariantId): void {
  const source = map.getSource(SOURCE_ID) as maplibregl.RasterTileSource | undefined
  source?.setTiles([BASE_MAP_VARIANTS[variant].tilesUrl])
}
