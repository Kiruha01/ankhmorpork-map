import { useEffect, useState } from 'react'
import { createInitialLayerVisibility } from '../../shared/config/map'
import { MARKER_CATEGORIES } from '../../features/map-markers/model/catalog'

const STORAGE_KEY = 'map-ui-preferences-v1'

function defaults() {
  return {
    layerVisibility: createInitialLayerVisibility(),
    markerVisibility: Object.fromEntries(MARKER_CATEGORIES.map(category => [category.id, category.defaultVisible])),
    showAttributes: true,
    showZoom: false,
    showNavigation: false,
  }
}
type Preferences = ReturnType<typeof defaults>

/** Only known boolean settings are restored; new options keep their configured defaults. */
function restore<T extends object>(fallback: T, saved: unknown): T {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return fallback
  const values = saved as Record<string, unknown>
  return Object.fromEntries(Object.entries(fallback).map(([key, value]) => [key,
    typeof value === 'boolean'
      ? typeof values[key] === 'boolean' ? values[key] : value
      : restore(value, values[key]),
  ])) as T
}

function readPreferences(): Preferences {
  const fallback = defaults()
  try {
    return restore(fallback, JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null'))
  } catch {
    return fallback
  }
}

export function useMapPreferences() {
  const [preferences, setPreferences] = useState(readPreferences)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Settings still work for this session if browser storage is unavailable.
    }
  }, [preferences])
  return [preferences, setPreferences] as const
}
