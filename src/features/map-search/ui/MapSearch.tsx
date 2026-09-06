import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import { MAP_OBJECT_DOMAINS } from '../../../entities/map-object/map/domains'
import type { SupportedLanguage } from '../../../shared/config/i18n'
import type { MapObjectFeaturesProvider, SearchMapObjectFeature } from '../../../widgets/map/model/MapObjectLayersController'
import { extendGeometryBounds } from '../model/geometryBounds'
import { createSearchIndex, searchItems, type SearchResult } from '../model/searchIndex'
import './MapSearch.css'

type MapSearchProps = {
  map: maplibregl.Map | null
  getSearchFeatures: MapObjectFeaturesProvider | null
  language: SupportedLanguage
  onSearchResults: (objects: SearchMapObjectFeature[], bounds: maplibregl.LngLatBounds, intent: SearchIntent) => void
  onSearchReset: () => void
  onClearReady: (clear: (() => void) | null) => void
  onHighlightsReady: (apply: ((objects: readonly SearchMapObjectFeature[]) => void) | null) => void
}

const VISIBLE_RESULTS_LIMIT = 8
const SEARCH_ICON_URL = `${import.meta.env.BASE_URL}assets/icons/search.svg`
export type SearchIntent = 'results' | 'direct-detail'

/** A retained UI callback can outlive MapLibre's style during map teardown. */
function isMapStyleReady(map: maplibregl.Map): boolean {
  try {
    return map.isStyleLoaded() === true
  } catch {
    return false
  }
}

export function MapSearch({ map, getSearchFeatures, language, onSearchResults, onSearchReset, onClearReady, onHighlightsReady }: MapSearchProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const searchRunRef = useRef(0)
  const index = useMemo(() => createSearchIndex(language), [language])
  const results = useMemo(() => searchItems(index, query), [index, query])

  const applyHighlights = useCallback((objects: readonly SearchMapObjectFeature[]) => {
    if (!map || !isMapStyleReady(map)) return
    MAP_OBJECT_DOMAINS.forEach(({ sourceId, applySearchResults }) => {
      applySearchResults(map, objects.filter((object) => object.sourceId === sourceId).map(({ id }) => id))
    })
  }, [map])

  const clearHighlights = useCallback(() => applyHighlights([]), [applyHighlights])

  const resetSearch = useCallback(() => {
    searchRunRef.current += 1
    setQuery('')
    clearHighlights()
    onSearchReset()
  }, [clearHighlights, onSearchReset])

  useEffect(() => () => clearHighlights(), [map])

  useEffect(() => {
    onClearReady(resetSearch)
    return () => onClearReady(null)
  }, [onClearReady, resetSearch])

  useEffect(() => {
    onHighlightsReady(applyHighlights)
    return () => onHighlightsReady(null)
  }, [applyHighlights, onHighlightsReady])

  useEffect(() => {
    searchRunRef.current += 1
    clearHighlights()
    onSearchReset()
  // A search index is locale-specific, so an old selection must not persist after a locale switch.
  }, [clearHighlights, language, onSearchReset])

  const runSearch = async (matchedResults: SearchResult[], intent: SearchIntent) => {
    const searchRun = ++searchRunRef.current
    if (!map || !getSearchFeatures) return

    clearHighlights()
    const matchedIds = new Set(matchedResults.map(({ id }) => id))
    const bounds = new maplibregl.LngLatBounds()
    const featureReferences = new Map<string, SearchMapObjectFeature>()

    try {
      const features = await getSearchFeatures()
      if (searchRun !== searchRunRef.current) return

      features.forEach(({ sourceId, id, feature }) => {
        if (!matchedIds.has(String(feature.properties?.name_id))) return

        featureReferences.set(`${sourceId}:${id}`, { sourceId, id, feature })
        extendGeometryBounds(bounds, feature.geometry)
      })
    } catch (error: unknown) {
      if (searchRun !== searchRunRef.current) return
      console.error('Unable to load map objects for search', error)
      return
    }

    const selectedFeatures = [...featureReferences.values()]
    applyHighlights(selectedFeatures)

    if (selectedFeatures.length === 0 || bounds.isEmpty()) {
      // Keep the entered query, but tell the parent that this search session no
      // longer has objects. This prevents a previous inspector session from
      // remaining visible after an empty search.
      onSearchResults([], bounds, intent)
      return
    }
    onSearchResults(selectedFeatures, bounds, intent)
  }

  return (
    <form
      className="map-search"
      role="search"
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
      }}
      onSubmit={(event) => {
        event.preventDefault()
        void runSearch(results, 'results')
      }}
    >
      <label className="map-search__label" htmlFor="map-search-input">{t('interface.search.label')}</label>
      <div className="map-search__field">
        <input
          id="map-search-input"
          className="map-search__input"
          type="search"
          value={query}
          placeholder={t('interface.search.placeholder')}
          autoComplete="off"
          aria-controls="map-search-results"
          aria-expanded={isFocused && query.trim().length > 0}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            resetSearch()
          }}
        />
        {query && (
          <button type="button" className="map-search__reset" aria-label={t('interface.search.reset')} onClick={resetSearch}>
            <span aria-hidden="true">×</span>
          </button>
        )}
        <button type="submit" className="map-search__submit" aria-label={t('interface.search.submit')}>
          <img src={SEARCH_ICON_URL} alt="" aria-hidden="true" />
        </button>
      </div>

      {isFocused && query.trim() && (
        <ul id="map-search-results" className="map-search__results" aria-label={t('interface.search.resultsLabel')}>
          {results.slice(0, VISIBLE_RESULTS_LIMIT).map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="map-search__result"
                onClick={() => {
                  setIsFocused(false)
                  setQuery(result.title)
                  void runSearch([result], 'direct-detail')
                }}
              >
                {result.title}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="map-search__empty">{t('interface.search.empty')}</li>}
        </ul>
      )}
    </form>
  )
}
