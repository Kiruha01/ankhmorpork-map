import type maplibregl from 'maplibre-gl'
import { BASE_MAP_VARIANTS, type BaseMapVariantId } from '../../../shared/config/map'

const SOURCE_ID = 'base-raster-source'
const RASTER_LAYER_ID = 'base-raster-layer'
const LANDSCAPE_PREFIX = 'base-landscape-'
const landscapeLayers = new WeakMap<maplibregl.Map, string[]>()
const landscapeLoading = new WeakMap<maplibregl.Map, Promise<void>>()
const selectedVariants = new WeakMap<maplibregl.Map, BaseMapVariantId>()

export { BASE_MAP_VARIANTS, type BaseMapVariantId }

const originalBaseMap = BASE_MAP_VARIANTS.orig
if (originalBaseMap.type !== 'raster') throw new Error('Original basemap must be raster')

const source = {
  type: 'raster' as const,
  tiles: [originalBaseMap.tilesUrl],
  tileSize: 512,
  minzoom: 13,
  maxzoom: 20,
}

export function registerBaseMapLayer(map: maplibregl.Map): void {
  map.addSource(SOURCE_ID, source)
  map.addLayer({
    id: RASTER_LAYER_ID,
    type: 'raster',
    source: SOURCE_ID,
    paint: { 'raster-fade-duration': 0 },
  })
}

async function registerLandscapeLayers(map: maplibregl.Map): Promise<void> {
  if (landscapeLayers.has(map)) return
  const pending = landscapeLoading.get(map)
  if (pending) return pending

  const load = (async () => {
    const variant = BASE_MAP_VARIANTS.landscape
    if (variant.type !== 'vector') return

    const styleUrl = new URL(variant.styleUrl, window.location.href)
    const response = await fetch(styleUrl)
    if (!response.ok) throw new Error(`Unable to load landscape style: ${response.status}`)
    const style = await response.json() as maplibregl.StyleSpecification

    Object.entries(style.sources).forEach(([id, source]) => {
      if (source.type !== 'geojson' || typeof source.data !== 'string') {
        throw new Error(`Unsupported landscape source: ${id}`)
      }
      map.addSource(`${LANDSCAPE_PREFIX}${id}`, {
        ...source,
        data: new URL(source.data, styleUrl).href,
      })
    })

    const firstOverlayLayer = map.getStyle().layers.find(({ id }) => id !== RASTER_LAYER_ID)?.id
    const layerIds = style.layers.map((layer) => {
      if (!('source' in layer) || typeof layer.source !== 'string') {
        throw new Error(`Unsupported landscape layer: ${layer.id}`)
      }
      const id = `${LANDSCAPE_PREFIX}${layer.id}`
      map.addLayer({
        ...layer,
        id,
        source: `${LANDSCAPE_PREFIX}${layer.source}`,
        layout: { ...layer.layout, visibility: 'none' },
      } as maplibregl.LayerSpecification, firstOverlayLayer)
      return id
    })
    landscapeLayers.set(map, layerIds)
  })()

  landscapeLoading.set(map, load)
  try {
    await load
  } finally {
    landscapeLoading.delete(map)
  }
}

function applyBaseMapVisibility(map: maplibregl.Map, variant: BaseMapVariantId): void {
  map.setLayoutProperty(RASTER_LAYER_ID, 'visibility', variant === 'landscape' ? 'none' : 'visible')
  landscapeLayers.get(map)?.forEach((id) => {
    map.setLayoutProperty(id, 'visibility', variant === 'landscape' ? 'visible' : 'none')
  })
}

export function switchBaseMapVariant(map: maplibregl.Map, variant: BaseMapVariantId): void {
  selectedVariants.set(map, variant)
  const config = BASE_MAP_VARIANTS[variant]
  if (config.type === 'raster') {
    const source = map.getSource(SOURCE_ID) as maplibregl.RasterTileSource | undefined
    source?.setTiles([config.tilesUrl])
    applyBaseMapVisibility(map, variant)
    return
  }

  void registerLandscapeLayers(map)
    .then(() => applyBaseMapVisibility(map, selectedVariants.get(map) ?? variant))
    .catch((error: unknown) => console.error('Unable to load landscape basemap', error))
}
