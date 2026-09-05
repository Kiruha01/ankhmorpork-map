import { beerMapDomain } from '../../beer/map/domain'
import { buildingMapDomain } from '../../building/map/domain'
import { streetMapDomain } from '../../street/map/domain'
import type { MapObjectDomain } from './types'

/**
 * Single composition point for all GeoJSON object domains.
 * Add a domain descriptor here to make it available to the map and search.
 */
export const MAP_OBJECT_DOMAINS: readonly MapObjectDomain[] = [
  buildingMapDomain,
  streetMapDomain,
  beerMapDomain,
]

