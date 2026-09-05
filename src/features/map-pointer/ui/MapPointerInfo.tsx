import { useEffect, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import './MapPointerInfo.css'

type MapPointerInfoProps = {
  map: maplibregl.Map | null
}

type PointerPosition = {
  x: number
  y: number
  lng: number
  lat: number
}

export function MapPointerInfo({ map }: MapPointerInfoProps) {
  const [position, setPosition] = useState<PointerPosition | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!map) return

    const updatePosition = (event: maplibregl.MapMouseEvent) => {
      const lngLat = event.lngLat.wrap()
      setPosition({ x: event.point.x, y: event.point.y, lng: lngLat.lng, lat: lngLat.lat })
    }

    map.on('mousemove', updatePosition)
    return () => {
      map.off('mousemove', updatePosition)
    }
  }, [map])

  if (!position) return null

  return (
    <output className="map-pointer-info">
      {t('interface.pointer.position', {
        x: position.x,
        y: position.y,
        lng: position.lng.toFixed(6),
        lat: position.lat.toFixed(6),
      })}
    </output>
  )
}
