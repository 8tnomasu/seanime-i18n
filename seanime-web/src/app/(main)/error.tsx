import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import React from "react"
import { useTranslation } from "react-i18next"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const { t } = useTranslation()

    React.useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex justify-center">
            <LuffyError
                title={t("common.states.clientSideErrorTitle")}
            >
                <p className="max-w-xl text-sm text-[--muted] mb-4">
                    {error.message || t("common.states.unexpectedError")}
                </p>
                <Button
                    onClick={
                        () => reset()
                    }
                >
                    {t("common.buttons.retry")}
                </Button>
            </LuffyError>
        </div>
    )
}
