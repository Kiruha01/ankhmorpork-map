import { beerMapDomain } from '../../beer/map/domain'
import { buildingMapDomain } from '../../building/map/domain'
import { parkMapDomain } from '../../park/map/domain'
import { squareMapDomain } from '../../square/map/domain'
import { streetMapDomain } from '../../street/map/domain'
import type { MapObjectDomain } from './types'

/**
 * Single composition point for all GeoJSON object domains.
 * Add a domain descriptor here to make it available to the map and search.
 */
export const MAP_OBJECT_DOMAINS: readonly MapObjectDomain[] = [
  // Register terrain labels first so every other object layer is painted above them.
  parkMapDomain,
  squareMapDomain,
  buildingMapDomain,
  streetMapDomain,
  beerMapDomain,
]
