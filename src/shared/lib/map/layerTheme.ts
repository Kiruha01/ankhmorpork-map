import type { FilterSpecification, LayerSpecification } from 'maplibre-gl'

/**
 * A theme may change every public MapLibre layer property except the layer
 * identity and its domain-owned GeoJSON source. Expressions and filters keep
 * their native MapLibre syntax and are checked by its style-spec types.
 */
export type LayerTheme<T extends LayerSpecification> = Omit<T, 'id' | 'type' | 'source' | 'source-layer'>

/** Merges a theme patch without making callers repeat the default paint/layout. */
type LayerWithFilter = LayerSpecification & { filter?: FilterSpecification }

export function applyLayerTheme<T extends LayerWithFilter>(
  base: T,
  theme: LayerTheme<T> & { filter?: FilterSpecification },
): T {
  const { filter: themeFilter, ...styleTheme } = theme
  const filter = themeFilter === undefined
    ? base.filter
    : base.filter === undefined
      ? themeFilter
      : ['all', base.filter, themeFilter]

  return {
    ...base,
    ...styleTheme,
    ...(filter === undefined ? {} : { filter }),
    layout: { ...base.layout, ...theme.layout },
    paint: { ...base.paint, ...theme.paint },
  } as T
}
