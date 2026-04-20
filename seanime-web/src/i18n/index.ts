import i18n from "i18next"
import { atomWithStorage } from "jotai/utils"
import { initReactI18next } from "react-i18next"
import enUS from "./locales/en-US.json"
import zhTW from "./locales/zh-TW.json"

export const DEFAULT_LANGUAGE = "en-US" as const
export const FALLBACK_LANGUAGE = DEFAULT_LANGUAGE
export const LANGUAGE_STORAGE_KEY = "sea-language"

export const SUPPORTED_LANGUAGES = [
    {
        value: "en-US",
        labelKey: "language.options.en-US",
    },
    {
        value: "zh-TW",
        labelKey: "language.options.zh-TW",
    },
] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]["value"]

export function isAppLanguage(value: unknown): value is AppLanguage {
    return SUPPORTED_LANGUAGES.some(language => language.value === value)
}

function readStoredLanguage(): AppLanguage | null {
    if (typeof window === "undefined") return null

    const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (!storedValue) return null

    try {
        const parsed = JSON.parse(storedValue)
        return isAppLanguage(parsed) ? parsed : null
    } catch {
        return isAppLanguage(storedValue) ? storedValue : null
    }
}

export function getInitialLanguage(): AppLanguage {
    return readStoredLanguage() ?? DEFAULT_LANGUAGE
}

export const appLanguageAtom = atomWithStorage<AppLanguage>(
    LANGUAGE_STORAGE_KEY,
    DEFAULT_LANGUAGE,
    undefined,
    { getOnInit: true },
)

const resources = {
    "en-US": {
        translation: enUS,
    },
    "zh-TW": {
        translation: zhTW,
    },
} as const

if (!i18n.isInitialized) {
    void i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: getInitialLanguage(),
            fallbackLng: FALLBACK_LANGUAGE,
            supportedLngs: SUPPORTED_LANGUAGES.map(language => language.value),
            defaultNS: "translation",
            interpolation: {
                escapeValue: false,
            },
            returnNull: false,
        })
}

export default i18n
