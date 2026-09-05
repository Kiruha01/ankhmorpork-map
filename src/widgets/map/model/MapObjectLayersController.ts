import type maplibregl from 'maplibre-gl'
import { switchBaseMapVariant } from '../../../entities/base-map/map/registerBaseMapLayer'
import { MAP_OBJECT_DOMAINS } from '../../../entities/map-object/map/domains'
import type { MapObjectDomain } from '../../../entities/map-object/map/types'
import { BASE_MAP_VARIANTS, type BaseMapVariantId, type OverlayTheme } from '../../../shared/config/map'
import { LocalizedGeoJsonDataset } from '../../../shared/lib/geojson/localizedSource'
import type { MapObjectFeature } from '../../../shared/lib/geojson/types'
import type { SupportedLanguage } from '../../../shared/config/i18n'

type LoadedObjectDomain = MapObjectDomain & {
  dataset: LocalizedGeoJsonDataset
}

export type SearchMapObjectFeature = {
  sourceId: string
  id: string | number
  feature: MapObjectFeature
}

export type MapObjectFeaturesProvider = () => Promise<SearchMapObjectFeature[]>
export type MapObjectFeatureAtPointProvider = (point: maplibregl.PointLike) => Promise<SearchMapObjectFeature | null>

function getFeatureId(feature: MapObjectFeature): string | number | null {
  const fid = feature.properties?.fid
  return typeof fid === 'string' || typeof fid === 'number' ? fid : null
}

/** Coordinates the one MapLibre instance with domain-owned sources and layers. */
export class MapObjectLayersController {
  private readonly abortController = new AbortController()
  private readonly domains: LoadedObjectDomain[] = MAP_OBJECT_DOMAINS.map((domain) => ({
    ...domain,
    dataset: new LocalizedGeoJsonDataset(domain.geoJsonUrl),
  }))
  private destroyed = false

  constructor(
    private readonly map: maplibregl.Map,
    private language: SupportedLanguage,
    private baseMapVariant: BaseMapVariantId,
  ) {}

  initialize(): void {
    const theme = BASE_MAP_VARIANTS[this.baseMapVariant].overlayTheme
    this.domains.forEach(({ register }) => register(this.map, theme))
    this.applyThemeImages(theme)
    switchBaseMapVariant(this.map, this.baseMapVariant)
    this.refreshLocalizedSources()
  }

  setLanguage(language: SupportedLanguage): void {
    if (language === this.language) return
    this.language = language
    this.refreshLocalizedSources()
  }

  setBaseMapVariant(variant: BaseMapVariantId): void {
    if (variant === this.baseMapVariant) return
    this.baseMapVariant = variant
    this.applyBaseMapVariant()
  }

  destroy(): void {
    this.destroyed = true
    this.abortController.abort()
  }

  /** Returns domain-owned raw feature references, independent of map viewport and zoom. */
  async getSearchFeatures(): Promise<SearchMapObjectFeature[]> {
    const collections = await Promise.all(this.domains.map(async ({ sourceId, dataset }) => ({
      sourceId,
      data: await dataset.load(this.abortController.signal),
    })))

    return collections.flatMap(({ sourceId, data }) => data.features.flatMap((feature) => {
      const id = getFeatureId(feature)
      return id === null ? [] : [{ sourceId, id, feature }]
    }))
  }

  /**
   * Uses rendered features only to identify the object under the pointer. The
   * returned feature always comes from the complete raw domain dataset.
   */
  async getFeatureAtPoint(point: maplibregl.PointLike): Promise<SearchMapObjectFeature | null> {
    if (this.destroyed) return null

    let renderedFeatures: maplibregl.MapGeoJSONFeature[]
    try {
      renderedFeatures = this.map.queryRenderedFeatures(point, {
        layers: this.domains.flatMap(({ interactiveLayerIds }) => interactiveLayerIds),
      })
    } catch (error: unknown) {
      if (!this.destroyed) console.error('Unable to inspect map object at pointer', error)
      return null
    }

    const identities = renderedFeatures.flatMap((feature) => {
      const id = feature.id
      return feature.source && (typeof id === 'string' || typeof id === 'number')
        ? [{ sourceId: feature.source, id }]
        : []
    })
    if (identities.length === 0) return null

    try {
      const rawFeatures = await this.getSearchFeatures()
      if (this.destroyed) return null
      return identities
        .map(({ sourceId, id }) => rawFeatures.find((feature) => feature.sourceId === sourceId && feature.id === id))
        .find((feature): feature is SearchMapObjectFeature => Boolean(feature)) ?? null
    } catch (error: unknown) {
      if (!this.destroyed) console.error('Unable to load map object for inspection', error)
      return null
    }
  }

  private applyBaseMapVariant(): void {
    const theme = BASE_MAP_VARIANTS[this.baseMapVariant].overlayTheme
    switchBaseMapVariant(this.map, this.baseMapVariant)
    this.applyThemeImages(theme)
    this.domains.forEach(({ applyTheme }) => applyTheme(this.map, theme))
  }

  private applyThemeImages(theme: OverlayTheme): void {
    Object.entries(theme.images ?? {}).forEach(([name, image]) => {
      if (this.map.hasImage(name)) return

      void this.map.loadImage(image.url)
        .then(({ data }) => {
          if (!this.destroyed && !this.map.hasImage(name)) this.map.addImage(name, data, image.options)
        })
        .catch((error: unknown) => {
          if (!this.destroyed) console.error(`Unable to load map image "${name}"`, error)
        })
    })
  }

  private refreshLocalizedSources(): void {
    this.domains.forEach((domain) => {
      void domain.dataset
        .applyToMap(this.map, domain.sourceId, this.language, this.abortController.signal)
        .catch((error: unknown) => {
          if (this.destroyed || (error instanceof DOMException && error.name === 'AbortError')) return
          console.error(`Unable to update map source "${domain.sourceId}"`, error)
        })
    })
  }
}
