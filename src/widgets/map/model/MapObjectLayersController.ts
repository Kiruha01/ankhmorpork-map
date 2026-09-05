import type maplibregl from 'maplibre-gl'
import { registerBeerLayer } from '../../../entities/beer/map/registerBeerLayer'
import { applyBeerTheme } from '../../../entities/beer/map/layers'
import { BEERS_GEOJSON_URL, BEERS_SOURCE_ID } from '../../../entities/beer/map/source'
import { registerBuildingsLayer } from '../../../entities/building/map/registerBuildingsLayer'
import { applyBuildingTheme } from '../../../entities/building/map/layers'
import { BUILDINGS_GEOJSON_URL, BUILDINGS_SOURCE_ID } from '../../../entities/building/map/source'
import { switchBaseMapVariant } from '../../../entities/base-map/map/registerBaseMapLayer'
import { registerStreetsLayer } from '../../../entities/street/map/registerStreetsLayer'
import { applyStreetTheme } from '../../../entities/street/map/layers'
import { STREETS_GEOJSON_URL, STREETS_SOURCE_ID } from '../../../entities/street/map/source'
import { BASE_MAP_VARIANTS, type BaseMapVariantId, type OverlayTheme } from '../../../shared/config/map'
import { LocalizedGeoJsonDataset } from '../../../shared/lib/geojson/localizedSource'
import type { SupportedLanguage } from '../../../shared/config/i18n'

type ObjectDomain = {
  sourceId: string
  dataset: LocalizedGeoJsonDataset
  register: (map: maplibregl.Map, theme: OverlayTheme) => void
}

/** Coordinates the one MapLibre instance with domain-owned sources and layers. */
export class MapObjectLayersController {
  private readonly abortController = new AbortController()
  private readonly domains: ObjectDomain[] = [
    {
      sourceId: BUILDINGS_SOURCE_ID,
      dataset: new LocalizedGeoJsonDataset(BUILDINGS_GEOJSON_URL),
      register: registerBuildingsLayer,
    },
    {
      sourceId: STREETS_SOURCE_ID,
      dataset: new LocalizedGeoJsonDataset(STREETS_GEOJSON_URL),
      register: registerStreetsLayer,
    },
    {
      sourceId: BEERS_SOURCE_ID,
      dataset: new LocalizedGeoJsonDataset(BEERS_GEOJSON_URL),
      register: registerBeerLayer,
    },
  ]
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

  private applyBaseMapVariant(): void {
    const theme = BASE_MAP_VARIANTS[this.baseMapVariant].overlayTheme
    switchBaseMapVariant(this.map, this.baseMapVariant)
    this.applyThemeImages(theme)
    applyBuildingTheme(this.map, theme)
    applyStreetTheme(this.map, theme)
    applyBeerTheme(this.map, theme)
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
