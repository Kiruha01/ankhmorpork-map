import { useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import { createMarkerObject, type MarkerCategory } from '../model/catalog'
import type { InspectableObject } from '../../object-inspector/model/InspectableObject'
import './MapMarkers.css'

export type MarkerVisibility = Record<string, boolean>
export function MapMarkerOptions({ categories, visibility, onChange }: {
  categories: readonly MarkerCategory[]; visibility: MarkerVisibility; onChange: (id: string, visible: boolean) => void
}) {
  const { t } = useTranslation()
  return <div className="map-markers__categories">{categories.map(category => <label className="map-markers__choice" key={category.id}>
    <input type="checkbox" checked={visibility[category.id] ?? category.defaultVisible} onChange={event => onChange(category.id, event.target.checked)} />
    <span className="map-markers__icon" aria-hidden="true"><span className="map-search__pin" /></span>
    <span className="map-markers__text"><strong>{t(category.titleKey)}</strong><small>{t(category.descriptionKey)}</small></span>
    <span className="map-markers__check" aria-hidden="true">✓</span>
  </label>)}</div>
}
export function MapMarkers({ map, categories, visibility, language, onSelect }: {
  map: maplibregl.Map | null; categories: readonly MarkerCategory[]; visibility: MarkerVisibility; language: string
  onSelect: (object: InspectableObject) => void
}) {
  useEffect(() => {
    if (!map) return
    const markers = categories.filter(category => visibility[category.id] ?? category.defaultVisible).flatMap(category => category.markers).map(definition => {
      const object = createMarkerObject(definition, language)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'map-markers__marker'
      button.setAttribute('aria-label', object.title)
      button.title = object.title
      const pin = document.createElement('span')
      pin.className = 'map-search__pin'
      pin.setAttribute('aria-hidden', 'true')
      button.append(pin)
      button.addEventListener('click', event => { event.stopPropagation(); onSelect(object) })
      return new maplibregl.Marker({ element: button, anchor: 'bottom' }).setLngLat(definition.coordinates as [number, number]).addTo(map)
    })
    return () => markers.forEach(marker => marker.remove())
  }, [map, categories, visibility, language, onSelect])
  return null
}
