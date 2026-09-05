import Fuse from 'fuse.js'
import { getSearchableTranslationItems, type SearchableTranslationItem, type SupportedLanguage } from '../../../shared/config/i18n'

const SEARCH_OPTIONS = {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'aliases', weight: 0.25 },
    { name: 'description', weight: 0.15 },
  ],
  ignoreLocation: true,
  threshold: 0.35,
}

export type SearchResult = SearchableTranslationItem

export function createSearchIndex(language: SupportedLanguage): Fuse<SearchResult> {
  return new Fuse(getSearchableTranslationItems(language), SEARCH_OPTIONS)
}

export function searchItems(index: Fuse<SearchResult>, query: string): SearchResult[] {
  const normalizedQuery = query.trim()
  return normalizedQuery ? index.search(normalizedQuery).map(({ item }) => item) : []
}
