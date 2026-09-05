import type maplibregl from 'maplibre-gl'
import { getItemTitle, type SupportedLanguage } from '../../config/i18n'
import type { MapObjectFeature, MapObjectFeatureCollection, MapObjectProperties } from './types'

function isFeatureCollection(value: unknown): value is MapObjectFeatureCollection {
  return Boolean(
    value
      && typeof value === 'object'
      && (value as { type?: unknown }).type === 'FeatureCollection'
      && Array.isArray((value as { features?: unknown }).features),
  )
}

function getFeatureId(properties: MapObjectProperties): string | number | undefined {
  return typeof properties.fid === 'string' || typeof properties.fid === 'number' ? properties.fid : undefined
}

function getLabel(properties: MapObjectProperties, language: SupportedLanguage): string | null {
  return typeof properties.name_id === 'string' ? getItemTitle(language, properties.name_id) : null
}

/**
 * Keeps the source GeoJSON immutable and creates the MapLibre-ready copy.
 * `label` is intentionally the only localization field exposed to map layers.
 */
export function localizeGeoJson(
  featureCollection: MapObjectFeatureCollection,
  language: SupportedLanguage,
): MapObjectFeatureCollection {
  return {
    ...featureCollection,
    features: featureCollection.features.map((feature): MapObjectFeature => {
      const properties = { ...(feature.properties ?? {}) } as MapObjectProperties
      const id = getFeatureId(properties)

      return {
        ...feature,
        ...(id === undefined ? {} : { id }),
        properties: {
          ...properties,
          label: getLabel(properties, language),
        },
      }
    }),
  }
}

/** Loads a local GeoJSON document once and applies localized copies to a MapLibre source. */
export class LocalizedGeoJsonDataset {
  private rawData: MapObjectFeatureCollection | null = null
  private loading: Promise<MapObjectFeatureCollection> | null = null

  constructor(private readonly url: string) {}

  async load(signal: AbortSignal): Promise<MapObjectFeatureCollection> {
    if (this.rawData) return this.rawData
    if (!this.loading) {
      this.loading = fetch(this.url, { signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Unable to load ${this.url}: ${response.status} ${response.statusText}`)
          const data: unknown = await response.json()
          if (!isFeatureCollection(data)) throw new Error(`Invalid GeoJSON FeatureCollection at ${this.url}`)
          this.rawData = data
          return data
        })
        .finally(() => {
          this.loading = null
        })
    }

    return this.loading
  }

  async applyToMap(
    map: maplibregl.Map,
    sourceId: string,
    language: SupportedLanguage,
    signal: AbortSignal,
  ): Promise<void> {
    const data = await this.load(signal)
    if (signal.aborted) return

    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined
    source?.setData(localizeGeoJson(data, language))
  }
}
