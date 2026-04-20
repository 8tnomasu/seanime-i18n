import i18n, { appLanguageAtom } from "@/i18n"
import { useAtomValue } from "jotai/react"
import React from "react"
import { I18nextProvider } from "react-i18next"

function I18nStateSync() {
    const language = useAtomValue(appLanguageAtom)

    React.useEffect(() => {
        void i18n.changeLanguage(language)
        document.documentElement.lang = language
    }, [language])

    return null
}

type AppI18nProviderProps = {
    children?: React.ReactNode
}

export function AppI18nProvider({ children }: AppI18nProviderProps) {
    return (
        <I18nextProvider i18n={i18n}>
            {children}
            <I18nStateSync />
        </I18nextProvider>
    )
}
