import { Badge, BadgeProps } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn } from "../ui/core/styling"

type Props = BadgeProps

export function BetaBadge({ className, ...props }: Props) {
    const { t } = useTranslation()
    return (
        <Badge intent="warning" size="sm" className={cn("align-middle ml-2 border-transparent", className)} {...props}>{t("badges.beta")}</Badge>
    )
}

export function AlphaBadge({ className, ...props }: Props) {
    const { t } = useTranslation()
    return (
        <Badge intent="warning" size="sm" className={cn("align-middle ml-2 border-transparent", className)} {...props}>{t("badges.alpha")}</Badge>
    )
}


export function ExperimentalBadge({ className, title, ...props }: Props) {
    const { t } = useTranslation()
    return (
        <Badge intent="warning" size="sm" className={cn("align-middle ml-2 border-transparent", className)} {...props}>{title ?? t("badges.experimental")}</Badge>
    )
}
