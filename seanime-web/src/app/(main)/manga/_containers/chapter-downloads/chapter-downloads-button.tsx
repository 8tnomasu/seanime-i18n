import { __manga_chapterDownloadsDrawerIsOpenAtom } from "@/app/(main)/manga/_containers/chapter-downloads/chapter-downloads-drawer"
import { Button } from "@/components/ui/button"
import { usePathname } from "@/lib/navigation"
import { useSetAtom } from "jotai/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { LuFolderDown } from "react-icons/lu"

type ChapterDownloadsButtonProps = {
    children?: React.ReactNode
}

export function ChapterDownloadsButton(props: ChapterDownloadsButtonProps) {
    const { t } = useTranslation()

    const {
        children,
        ...rest
    } = props

    const pathname = usePathname()

    const openDownloadQueue = useSetAtom(__manga_chapterDownloadsDrawerIsOpenAtom)

    if (!pathname.startsWith("/manga")) return null

    return (
        <>
            <Button
                onClick={() => openDownloadQueue(true)}
                intent="white-subtle"
                rounded
                size="sm"
                leftIcon={<LuFolderDown />}
            >
                {t("mediaDetail.chapters.downloadedChapters")}
            </Button>
        </>
    )
}
