import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import React from "react"
import { useTranslation } from "react-i18next"

export function NotFound() {
    const { t } = useTranslation()

    return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
            <LuffyError title={t("common.states.pageNotFoundTitle")}>
                <p className="text-[--muted] mb-4">
                    {t("common.states.pageNotFoundDescription")}
                </p>
                <Link to="/">
                    <Button>{t("common.buttons.goHome")}</Button>
                </Link>
            </LuffyError>
        </div>
    )
}
