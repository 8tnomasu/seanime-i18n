import { Anime_Entry } from "@/api/generated/types"
import { AnimeMetaActionButton } from "@/app/(main)/entry/_components/meta-section"
import { useAnimeEntryPageView } from "@/app/(main)/entry/_containers/anime-entry-page"
import { __torrentSearch_selectionAtom } from "@/app/(main)/entry/_containers/torrent-search/torrent-search-drawer"
import { useSetAtom } from "jotai/react"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { BiDownload } from "react-icons/bi"

export function TorrentSearchButton({ entry, onClick }: { entry: Anime_Entry, onClick?: () => void }) {
    const { t } = useTranslation()

    const setter = useSetAtom(__torrentSearch_selectionAtom)
    const count = entry.downloadInfo?.episodesToDownload?.length
    const isMovie = useMemo(() => entry.media?.format === "MOVIE", [entry.media?.format])
    const {
        isLibraryView,
    } = useAnimeEntryPageView()

    return (
        <div className="contents" data-torrent-search-button-container>
            <AnimeMetaActionButton
                intent={!isLibraryView ? "gray-subtle" : !entry.downloadInfo?.hasInaccurateSchedule
                    ? (!!count ? "white" : "gray-subtle")
                    : "white-subtle"}
                size="md"
                leftIcon={<BiDownload />}
                iconClass="text-2xl"
                onClick={() => {
                    setter("download")
                    if (onClick) onClick()
                }}
                data-torrent-search-button
            >
                {(!entry.downloadInfo?.hasInaccurateSchedule && !!count) ? <>
                    {(!isMovie) && (entry.downloadInfo?.batchAll
                        ? t("mediaDetail.actions.downloadBatchEpisodes", { count })
                        : count > 1
                            ? t("mediaDetail.actions.downloadNextEpisodes", { count })
                            : t("mediaDetail.actions.downloadNextEpisode"))}
                    {(isMovie) && t("mediaDetail.actions.downloadMovie")}
                </> : <>
                    {t("common.buttons.download")}
                </>}
            </AnimeMetaActionButton>
        </div>
    )
}
