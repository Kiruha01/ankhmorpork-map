import { useEffect, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import './MapZoomIndicator.css'

type MapZoomIndicatorProps = {
  map: maplibregl.Map | null
}

export function MapZoomIndicator({ map }: MapZoomIndicatorProps) {
  const [zoom, setZoom] = useState<number | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!map) return

    const updateZoom = () => setZoom(map.getZoom())
    updateZoom()
    map.on('zoom', updateZoom)

    return () => {
      map.off('zoom', updateZoom)
    }
  }, [map])

  if (zoom === null) return null

  return <div className="map-zoom-indicator" aria-live="polite">{t('interface.zoom.indicator', { value: zoom.toFixed(2) })}</div>
}
