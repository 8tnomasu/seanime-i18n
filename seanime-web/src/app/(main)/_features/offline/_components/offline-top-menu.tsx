import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { NavigationMenu, NavigationMenuProps } from "@/components/ui/navigation-menu"
import { usePathname } from "@/lib/navigation"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"

interface OfflineTopMenuProps {
    children?: React.ReactNode
}

export const OfflineTopMenu: React.FC<OfflineTopMenuProps> = (props) => {
    const { t } = useTranslation()

    const { children, ...rest } = props

    const serverStatus = useServerStatus()

    const pathname = usePathname()

    const navigationItems = useMemo<NavigationMenuProps["items"]>(() => {

        return [
            {
                href: "/offline",
                // icon: IoLibrary,
                isCurrent: pathname === "/offline",
                name: t("offlineSync.navigation.animeLibrary"),
            },
            ...[serverStatus?.settings?.library?.enableManga && {
                href: "/offline/manga",
                icon: null,
                isCurrent: pathname.includes("/offline/manga"),
                name: t("mediaFilters.options.types.manga"),
            }].filter(Boolean) as NavigationMenuProps["items"],
        ].filter(Boolean)
    }, [pathname, serverStatus?.settings?.library?.enableManga, t])

    return (
        <NavigationMenu
            className="p-0 hidden lg:inline-block"
            itemClass="text-xl"
            items={navigationItems}
        />
    )

}
