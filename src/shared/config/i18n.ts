import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

type TranslationResource = {
  interface?: {
    language?: {
      name?: string
      flag?: string
    }
  }
}

type LanguageResource = {
  code: string
  translation: TranslationResource
}

export type SupportedLanguage = string

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

export { i18n }
