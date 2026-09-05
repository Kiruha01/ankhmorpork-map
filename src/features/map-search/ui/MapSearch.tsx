import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useTranslation } from 'react-i18next'
import { MAP_OBJECT_DOMAINS } from '../../../entities/map-object/map/domains'
import type { SupportedLanguage } from '../../../shared/config/i18n'
import type { MapObjectFeaturesProvider } from '../../../widgets/map/model/MapObjectLayersController'
import { extendGeometryBounds } from '../model/geometryBounds'
import { createSearchIndex, searchItems, type SearchResult } from '../model/searchIndex'
import searchIcon from '../../../shared/assets/icons/search.svg'
import './MapSearch.css'

type MapSearchProps = {
  map: maplibregl.Map | null
  getSearchFeatures: MapObjectFeaturesProvider | null
  language: SupportedLanguage
}

type FeatureReference = {
  source: string
  id: string | number
}

const VISIBLE_RESULTS_LIMIT = 8

export function MapSearch({ map, getSearchFeatures, language }: MapSearchProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const searchRunRef = useRef(0)
  const index = useMemo(() => createSearchIndex(language), [language])
  const results = useMemo(() => searchItems(index, query), [index, query])

  const clearHighlights = () => {
    if (!map) return
    MAP_OBJECT_DOMAINS.forEach(({ applySearchResults }) => applySearchResults(map, []))
  }

  const resetSearch = () => {
    searchRunRef.current += 1
    setQuery('')
    clearHighlights()
  }

  useEffect(() => () => clearHighlights(), [map])

  useEffect(() => {
    searchRunRef.current += 1
    clearHighlights()
  // A search index is locale-specific, so an old selection must not persist after a locale switch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const runSearch = async (matchedResults: SearchResult[]) => {
    const searchRun = ++searchRunRef.current
    if (!map || !getSearchFeatures) return

    clearHighlights()
    const matchedIds = new Set(matchedResults.map(({ id }) => id))
    const bounds = new maplibregl.LngLatBounds()
    const featureReferences = new Map<string, FeatureReference>()

    try {
      const features = await getSearchFeatures()
      if (searchRun !== searchRunRef.current) return

      features.forEach(({ sourceId, id, feature }) => {
        if (!matchedIds.has(String(feature.properties?.name_id))) return

        const reference = { source: sourceId, id }
        featureReferences.set(`${sourceId}:${id}`, reference)
        extendGeometryBounds(bounds, feature.geometry)
      })
    } catch (error: unknown) {
      if (searchRun !== searchRunRef.current) return
      console.error('Unable to load map objects for search', error)
      return
    }

    const selectedFeatures = [...featureReferences.values()]
    MAP_OBJECT_DOMAINS.forEach(({ sourceId, applySearchResults }) => {
      applySearchResults(map, selectedFeatures.filter((feature) => feature.source === sourceId).map(({ id }) => id))
    })

    if (selectedFeatures.length === 0 || bounds.isEmpty()) return

    const southWest = bounds.getSouthWest()
    const northEast = bounds.getNorthEast()
    if (southWest.lng === northEast.lng && southWest.lat === northEast.lat) {
      map.flyTo({ center: southWest, zoom: Math.max(map.getZoom(), 18.5), duration: 600 })
      return
    }

    map.fitBounds(bounds, {
      padding: { top: 80, right: 80, bottom: 80, left: 360 },
      maxZoom: 18.5,
      duration: 600,
    })
  }

  return (
    <form
      className="map-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        void runSearch(results)
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
          aria-expanded={query.trim().length > 0}
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
          <img src={searchIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      {query.trim() && (
        <ul id="map-search-results" className="map-search__results" aria-label={t('interface.search.resultsLabel')}>
          {results.slice(0, VISIBLE_RESULTS_LIMIT).map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="map-search__result"
                onClick={() => {
                  setQuery(result.title)
                  void runSearch([result])
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
