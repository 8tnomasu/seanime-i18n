import { ElectronCrashScreenError } from "@/app/(main)/_electron/electron-crash-screen"
import { LuffyError } from "@/components/shared/luffy-error"
import { LoadingOverlay } from "@/components/ui/loading-spinner"
import { __isElectronDesktop__ } from "@/types/constants"
import React from "react"
import { useTranslation } from "react-i18next"

export default function Page() {
    const { t } = useTranslation()

    return (
        <LoadingOverlay showSpinner={false}>
            <LuffyError title={t("common.states.unexpectedError")}>
                {__isElectronDesktop__ && <ElectronCrashScreenError />}
            </LuffyError>
        </LoadingOverlay>
    )

}
