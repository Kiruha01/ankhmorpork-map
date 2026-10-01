import type { Point } from 'geojson'
import { i18n } from '../../../shared/config/i18n'
import type { InspectableObject } from '../../object-inspector/model/InspectableObject'

/** JSON-compatible catalog: a future local JSON loader can provide the same records. */
export type MarkerDefinition = {
  id: string
  titleKey: string
  descriptionKey: string
  coordinates: Point['coordinates']
  wikiUrl?: string
}
export type MarkerCategory = {
  id: string
  titleKey: string
  descriptionKey: string
  defaultVisible: boolean
  markers: readonly MarkerDefinition[]
}
export const MARKER_CATEGORIES: readonly MarkerCategory[] = [
  { id: 'landmarks', titleKey: 'interface.markers.landmarks', descriptionKey: 'interface.markers.landmarksDescription', defaultVisible: false,
    markers: [{ id: 'mock-landmark', titleKey: 'interface.markers.landmarkTitle', descriptionKey: 'interface.markers.mockDescription', coordinates: [0.018, -0.009] }] },
  { id: 'meeting', titleKey: 'interface.markers.meeting', descriptionKey: 'interface.markers.meetingDescription', defaultVisible: false,
    markers: [{ id: 'mock-meeting', titleKey: 'interface.markers.meetingTitle', descriptionKey: 'interface.markers.mockDescription', coordinates: [0.023, -0.012] }] },
]
export function createMarkerObject(marker: MarkerDefinition, language: string): InspectableObject {
  return {
    sourceId: 'local-markers', id: marker.id,
    title: i18n.t(marker.titleKey, { lng: language }),
    description: i18n.t(marker.descriptionKey, { lng: language }), fandomWiki: marker.wikiUrl ?? '',
    feature: { type: 'Feature', id: marker.id, geometry: { type: 'Point', coordinates: marker.coordinates },
      properties: { fid: marker.id, markerTitleKey: marker.titleKey, markerDescriptionKey: marker.descriptionKey, wikiUrl: marker.wikiUrl ?? '' } },
  }
}
