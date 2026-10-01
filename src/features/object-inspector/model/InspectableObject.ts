import { i18n, getObjectItemTranslation, getUntitledObjectTitle, type SupportedLanguage } from '../../../shared/config/i18n'
import type { MapObjectFeature } from '../../../shared/lib/geojson/types'
import type { SearchMapObjectFeature } from '../../../widgets/map/model/MapObjectLayersController'

/** A raw GeoJSON object paired with its stable MapLibre source and feature identity. */
export type InspectableObject = {
  sourceId: string
  id: string | number
  feature: MapObjectFeature
  title: string
  description: string
  fandomWiki: string
}

function getNameId(feature: MapObjectFeature): string | null {
  const nameId = feature.properties?.name_id
  return typeof nameId === 'string' && nameId.trim() ? nameId : null
}

export function createInspectableObject(
  { sourceId, id, feature }: SearchMapObjectFeature,
  language: SupportedLanguage,
): InspectableObject {
  if (sourceId === 'local-markers' && typeof feature.properties?.markerTitleKey === 'string') {
    return { sourceId, id, feature,
      title: i18n.t(feature.properties.markerTitleKey, { lng: language }),
      description: i18n.t(String(feature.properties.markerDescriptionKey), { lng: language }),
      fandomWiki: String(feature.properties.wikiUrl ?? ''),
    }
  }
  const nameId = getNameId(feature)
  const translation = nameId ? getObjectItemTranslation(language, nameId) : null

  return {
    sourceId,
    id,
    feature,
    title: translation?.title || nameId || getUntitledObjectTitle(language),
    description: translation?.description ?? '',
    fandomWiki: translation?.fandomWiki ?? '',
  }
}

export function relocalizeInspectableObject(object: InspectableObject, language: SupportedLanguage): InspectableObject {
  return createInspectableObject(object, language)
}
