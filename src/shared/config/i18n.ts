import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

type TranslationResource = {
  items?: Record<string, {
    title?: unknown
    description?: unknown
    fandom_wiki?: unknown
    aliases?: unknown
  }>
  interface?: {
    language?: {
      name?: string
      flag?: string
    }
    inspector?: {
      untitled?: string
    }
  }
}

type LanguageResource = {
  code: string
  translation: TranslationResource
}

export type SupportedLanguage = string

export type SearchableTranslationItem = {
  id: string
  title: string
  description: string
  aliases: string[]
}

export type ObjectItemTranslation = {
  title: string
  description: string
  fandomWiki: string
}

export const LANGUAGE_STORAGE_KEY = 'map-language'

const translationFiles = import.meta.glob('../../../translates/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, TranslationResource>

const languageResources: LanguageResource[] = Object.entries(translationFiles)
  .map(([path, translation]) => ({
    code: path.match(/\/([^/]+)\.json$/)?.[1],
    translation,
  }))
  .filter((resource): resource is LanguageResource => Boolean(resource.code))

const fallbackLanguage = languageResources.find(({ code }) => code === 'en')?.code ?? languageResources[0]?.code ?? 'en'
const storedLanguage = typeof window === 'undefined' ? null : window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
const initialLanguage = languageResources.some(({ code }) => code === storedLanguage) ? storedLanguage! : fallbackLanguage

export const AVAILABLE_LANGUAGES = languageResources.map(({ code, translation }) => ({
  code,
  name: translation.interface?.language?.name ?? code.toUpperCase(),
  flag: translation.interface?.language?.flag ?? '🏳️',
}))

void i18n.use(initReactI18next).init({
  resources: Object.fromEntries(languageResources.map(({ code, translation }) => [code, { translation }])),
  lng: initialLanguage,
  fallbackLng: fallbackLanguage,
  supportedLngs: AVAILABLE_LANGUAGES.map(({ code }) => code),
  interpolation: { escapeValue: false },
})

export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language)
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

/** Returns a public object title without ever exposing a technical `name_id`. */
export function getItemTitle(language: SupportedLanguage, nameId: string): string | null {
  return getObjectItemTranslation(language, nameId)?.title ?? null
}

function getTranslation(language: SupportedLanguage): TranslationResource | undefined {
  return languageResources.find(({ code }) => code === language)?.translation
}

function getLocalizedString(selected: unknown, english: unknown): string {
  if (typeof selected === 'string' && selected.trim()) return selected
  if (typeof english === 'string' && english.trim()) return english
  return ''
}

/** Resolves every object field independently: selected locale, then English. */
export function getObjectItemTranslation(language: SupportedLanguage, nameId: string): ObjectItemTranslation | null {
  const selected = getTranslation(language)?.items?.[nameId]
  const english = getTranslation('en')?.items?.[nameId]
  if (!selected && !english) return null

  return {
    title: getLocalizedString(selected?.title, english?.title),
    description: getLocalizedString(selected?.description, english?.description),
    fandomWiki: getLocalizedString(selected?.fandom_wiki, english?.fandom_wiki),
  }
}

export function getUntitledObjectTitle(language: SupportedLanguage): string {
  return getLocalizedString(getTranslation(language)?.interface?.inspector?.untitled, getTranslation('en')?.interface?.inspector?.untitled) || 'Untitled'
}

/**
 * Returns only entries from the active locale file. Search intentionally does
 * not fall back to English: its index must reflect the currently selected
 * translation file.
 */
export function getSearchableTranslationItems(language: SupportedLanguage): SearchableTranslationItem[] {
  const translation = getTranslation(language)

  return Object.entries(translation?.items ?? []).flatMap(([id, item]) => {
    if (typeof item.title !== 'string' || !item.title.trim()) return []

    return [{
      id,
      title: item.title,
      description: typeof item.description === 'string' ? item.description : '',
      aliases: Array.isArray(item.aliases) ? item.aliases.filter((alias): alias is string => typeof alias === 'string') : [],
    }]
  })
}

export { i18n }
