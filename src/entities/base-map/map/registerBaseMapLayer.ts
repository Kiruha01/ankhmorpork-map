import type maplibregl from 'maplibre-gl'
import { BASE_MAP_VARIANTS, type BaseMapVariantId } from '../../../shared/config/map'

const SOURCE_ID = 'base-raster-source'

export { BASE_MAP_VARIANTS, type BaseMapVariantId }

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
