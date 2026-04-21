import { SeaLink } from "@/components/shared/sea-link"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/lib/navigation"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { useTranslation } from "react-i18next"

type ExternalPlayerLinkButtonProps = {}

export const __externalPlayerLinkButton_linkAtom = atom<string | null>(null)

export function ExternalPlayerLinkButton(props: ExternalPlayerLinkButtonProps) {

    const {} = props

    const { t } = useTranslation()
    const router = useRouter()

    const [link, setLink] = useAtom(__externalPlayerLinkButton_linkAtom)

    if (!link) return null

    return (
        <>
            <div className="fixed bottom-2 right-2 z-50">
                <SeaLink href={link} target="_blank">
                    <Button
                        rounded
                        size="lg"
                        className="animate-bounce"
                        onClick={() => {
                            React.startTransition(() => {
                                setLink(null)
                            })
                        }}
                    >
                        {t("player.actions.openInExternalPlayer")}
                    </Button>
                </SeaLink>
            </div>
        </>
    )
}
