import { AL_BaseAnime, AL_BaseManga, Local_QueueState } from "@/api/generated/types"
import {
    useLocalGetHasLocalChanges,
    useLocalGetLocalStorageSize,
    useLocalGetTrackedMediaItems,
    useLocalSetHasLocalChanges,
    useLocalSyncAnilistData,
    useLocalSyncData,
    useSetOfflineMode,
} from "@/api/hooks/local.hooks"
import { useGetMangaCollection } from "@/api/hooks/manga.hooks"
import { animeLibraryCollectionWithoutStreamsAtom } from "@/app/(main)/_atoms/anime-library-collection.atoms"
import { MediaCardLazyGrid } from "@/app/(main)/_features/media/_components/media-card-grid"
import { MediaEntryCard } from "@/app/(main)/_features/media/_components/media-entry-card"
import { useWebsocketMessageListener } from "@/app/(main)/_hooks/handle-websockets"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SyncAddMediaModal } from "@/app/(main)/sync/_containers/sync-add-media-modal"
import { LuffyError } from "@/components/shared/luffy-error"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { LoadingSpinner, Spinner } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"
import { Separator } from "@/components/ui/separator"
import { anilist_getListDataFromEntry } from "@/lib/helpers/media"
import { WSEvents } from "@/lib/server/ws-events"
import { useAtomValue } from "jotai/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { LuCloud, LuCloudDownload, LuCloudOff, LuCloudUpload, LuFolderSync } from "react-icons/lu"
import { VscSyncIgnored } from "react-icons/vsc"
import { toast } from "sonner"


export default function Page() {
    const { t } = useTranslation()
    const serverStatus = useServerStatus()

    const [syncModalOpen, setSyncModalOpen] = React.useState(false)

    const { data: trackedMediaItems, isLoading } = useLocalGetTrackedMediaItems()
    const { mutate: syncLocal, isPending: isSyncingLocal } = useLocalSyncData()
    const { mutate: syncAnilist, isPending: isSyncingAnilist } = useLocalSyncAnilistData()
    const { data: hasLocalChanges } = useLocalGetHasLocalChanges()
    const { mutate: syncHasLocalChanges, isPending: isChangingLocalChangeStatus } = useLocalSetHasLocalChanges()
    const { data: localStorageSize } = useLocalGetLocalStorageSize()
    const { mutate: setOfflineMode, isPending: isSettingOfflineMode } = useSetOfflineMode()

    const trackedAnimeItems = React.useMemo(() => {
        return trackedMediaItems?.filter(n => n.type === "anime" && !!n.animeEntry?.media) ?? []
    }, [trackedMediaItems])

    const trackedMangaItems = React.useMemo(() => {
        return trackedMediaItems?.filter(n => n.type === "manga" && !!n.mangaEntry?.media) ?? []
    }, [trackedMediaItems])

    const animeLibraryCollection = useAtomValue(animeLibraryCollectionWithoutStreamsAtom)
    const { data: mangaLibraryCollection } = useGetMangaCollection()

    const unsavedAnime = React.useMemo(() => {
        const trackedIds = new Set(trackedAnimeItems.map(n => n.mediaId))
        const currentList = animeLibraryCollection?.lists?.find(n => n.type === "CURRENT")
        let unsavedAnime: AL_BaseAnime[] = []
        // only include entries that have local files
        for (const entry of currentList?.entries ?? []) {
            if (!trackedIds.has(entry.mediaId)) {
                unsavedAnime.push(entry.media!)
            }
        }
        return unsavedAnime
    }, [animeLibraryCollection?.lists, trackedAnimeItems])

    const unsavedManga = React.useMemo(() => {
        const trackedIds = new Set(trackedMangaItems.map(n => n.mediaId))
        const currentList = mangaLibraryCollection?.lists?.find(n => n.type === "CURRENT")
        let unsavedManga: AL_BaseManga[] = []
        for (const entry of currentList?.entries ?? []) {
            if (!trackedIds.has(entry.mediaId)) {
                unsavedManga.push(entry.media!)
            }
        }
        return unsavedManga
    }, [mangaLibraryCollection?.lists, trackedMangaItems])

    const [queueState, setQueueState] = React.useState<Local_QueueState | null>(null)
    useWebsocketMessageListener<Local_QueueState>({
        type: WSEvents.SYNC_LOCAL_QUEUE_STATE,
        onMessage: data => {
            setQueueState(data)
        },
    })

    function handleSyncLocal() {
        syncLocal(undefined, {
            onSuccess: () => {
                setSyncModalOpen(false)
            },
        })
    }

    function handleSyncAnilist() {
        syncAnilist(undefined, {
            onSuccess: () => {
                setSyncModalOpen(false)
            },
        })
    }

    function handleIgnoreLocalChanges() {
        syncHasLocalChanges({
            updated: false,
        }, {
            onSuccess: () => {
                toast.success(t("toasts.offlineSync.localChangesIgnored"))
                handleSyncLocal()
            },
        })
    }

    if (isLoading) return <LoadingSpinner />

    if (serverStatus?.user?.isSimulated) {
        return <LuffyError
            title={t("offlineSync.errors.notAuthenticatedTitle")}
        >
            {t("offlineSync.errors.notAuthenticatedDescription")}
        </LuffyError>
    }

    const unsavedAnimeCount = unsavedAnime.length
    const unsavedMangaCount = unsavedManga.length
    const unsavedMediaMessage = unsavedAnimeCount && unsavedMangaCount
        ? t("offlineSync.alerts.unsavedAnimeAndManga", { animeCount: unsavedAnimeCount, mangaCount: unsavedMangaCount })
        : unsavedAnimeCount
            ? t("offlineSync.alerts.unsavedAnime", { count: unsavedAnimeCount })
            : t("offlineSync.alerts.unsavedManga", { count: unsavedMangaCount })

    return (
        <PageWrapper
            className="p-4 sm:p-8 pt-4 relative space-y-8"
        >

            <Button
                intent="gray-subtle"
                rounded
                className=""
                leftIcon={!serverStatus?.isOffline ? <LuCloudOff className="text-2xl" /> : <LuCloud className="text-2xl" />}
                loading={isSettingOfflineMode}
                onClick={() => {
                    setOfflineMode({
                        enabled: !serverStatus?.isOffline,
                    })
                }}
            >
                {serverStatus?.isOffline ? t("offlineSync.actions.disableOfflineMode") : t("offlineSync.actions.enableOfflineMode")}
            </Button>

            <div className="flex flex-col lg:flex-row gap-2">
                <div>
                    <h2 className="">{t("offlineSync.title")}</h2>
                    <p className="text-[--muted]">
                        {t("offlineSync.description")}
                    </p>
                </div>

                <div className="flex flex-1"></div>

                <div className="contents">
                    <Modal
                        title={t("offlineSync.sync.title")}
                        open={syncModalOpen}
                        onOpenChange={v => {
                            if (isSyncingLocal) return
                            return setSyncModalOpen(v)
                        }}
                        trigger={<Button
                            intent="white"
                            rounded
                            leftIcon={<LuFolderSync className="text-2xl" />}
                            loading={isSyncingLocal}
                        >
                            {t("offlineSync.actions.syncNow")}
                        </Button>}
                    >
                        <div className="space-y-4">

                            <Button
                                intent="white"
                                rounded
                                className="w-full"
                                leftIcon={<LuCloudDownload className="text-2xl" />}
                                loading={isSyncingLocal}
                                disabled={isSyncingAnilist}
                                onClick={handleSyncLocal}
                            >
                                {t("offlineSync.actions.updateLocalData")}
                            </Button>
                            <p className="text-sm">
                                {t("offlineSync.sync.updateLocalDataDescription")}
                                {" "}
                                {t("offlineSync.sync.updateLocalDataAutomation")}
                                {" "}
                                <kbd>{t("offlineSync.sync.offlineModeSettingsPath")}</kbd>.
                            </p>
                            <Separator />
                            <Button
                                intent="primary-subtle"
                                rounded
                                className="w-full"
                                leftIcon={<LuCloudUpload className="text-2xl" />}
                                disabled={isSyncingLocal}
                                loading={isSyncingAnilist}
                                onClick={handleSyncAnilist}
                            >
                                {t("offlineSync.actions.uploadLocalChangesToAniList")}
                            </Button>
                            <p className="text-sm">
                                {t("offlineSync.sync.uploadLocalChangesDescription")}
                            </p>

                            <Alert
                                intent="warning"
                                description={t("offlineSync.sync.irreversibleWarning")}
                            />
                        </div>
                    </Modal>

                    <SyncAddMediaModal
                        savedMediaIds={trackedMediaItems?.map(n => n.mediaId) ?? []}
                    />
                </div>
            </div>

            {(!!unsavedAnime?.length || !!unsavedManga?.length) && (
                <Alert
                    intent="info-basic"
                    className="border-transparent"
                    description={
                        <div className="space-y-2">
                            <p>
                                <span>{unsavedMediaMessage}</span>
                            </p>
                        </div>
                    }
                />
            )}

            <p className="text-sm">
                <span>{t("offlineSync.fields.localStorageSize")}: </span>
                <span>{localStorageSize}</span>
            </p>

            {hasLocalChanges && <>
                <Alert
                    intent="warning"
                    description={<div className="space-y-2">
                        <p>
                            <span>{t("offlineSync.alerts.localChangesNotSynced")}</span>
                            {serverStatus?.settings?.library?.autoSyncOfflineLocalData &&
                                <span> {t("offlineSync.alerts.autoRefreshPaused")}</span>}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                intent="white"
                                leftIcon={<LuCloudUpload className="text-2xl" />}
                                onClick={() => {
                                    handleSyncAnilist()
                                    syncHasLocalChanges({
                                        updated: false,
                                    })
                                }}
                                loading={isSyncingAnilist}
                                disabled={isChangingLocalChangeStatus}
                            >
                                {t("offlineSync.actions.uploadLocalChanges")}
                            </Button>
                            <Button
                                intent="alert"
                                leftIcon={<VscSyncIgnored className="text-2xl" />}
                                onClick={handleIgnoreLocalChanges}
                                loading={isChangingLocalChangeStatus}
                                disabled={isSyncingAnilist}
                            >
                                {t("offlineSync.actions.deleteLocalChanges")}
                            </Button>
                        </div>
                    </div>}
                />
            </>}

            {/*{(queueState && (Object.keys(queueState.animeTasks!).length > 0 || Object.keys(queueState.mangaTasks!).length > 0)) &&*/}
            {/*    <div className="border rounded-[--radius-md] p-2">*/}
            {/*        <p className="flex items-center gap-1">*/}
            {/*            <Spinner className="size-6" />*/}
            {/*            <span>Syncing in progress</span>*/}
            {/*        </p>*/}
            {/*    </div>}*/}

            {(!trackedAnimeItems?.length && !trackedMangaItems?.length) && <LuffyError
                title={t("offlineSync.empty.noTrackedMedia")}
            />}

            {!!trackedAnimeItems?.length && <div className="space-y-4">
                <h3>{t("offlineSync.sections.savedAnime")}</h3>
                <MediaCardLazyGrid itemCount={trackedAnimeItems?.length}>
                    {trackedAnimeItems?.map((item) => (
                        <MediaEntryCard
                            key={item.mediaId}
                            type="anime"
                            media={item.animeEntry!.media!}
                            listData={anilist_getListDataFromEntry(item.animeEntry!)}
                            overlay={!!queueState?.animeTasks?.[item.mediaId] && <SyncingBadge />}
                            containerClassName={cn(!!queueState?.animeTasks?.[item.mediaId] && "animate-pulse")}
                        />
                    ))}
                </MediaCardLazyGrid>
            </div>}

            {!!trackedMangaItems?.length && <div className="space-y-4">
                <h3>{t("offlineSync.sections.savedManga")}</h3>
                <MediaCardLazyGrid itemCount={trackedMangaItems?.length}>
                    {trackedMangaItems?.map((item) => (
                        <MediaEntryCard
                            key={item.mediaId}
                            type="manga"
                            media={item.mangaEntry!.media!}
                            listData={anilist_getListDataFromEntry(item.mangaEntry!)}
                            overlay={!!queueState?.mangaTasks?.[item.mediaId] && <SyncingBadge />}
                            containerClassName={cn(!!queueState?.mangaTasks?.[item.mediaId] && "animate-pulse")}
                        />
                    ))}
                </MediaCardLazyGrid>
            </div>}
        </PageWrapper>
    )
}

function SyncingBadge() {
    const { t } = useTranslation()

    return (
        <Badge
            intent="gray-solid"
            className="rounded-tl-md rounded-bl-none rounded-tr-none rounded-br-md bg-gray-950 border gap-0"
        >
            <Spinner className="size-4 px-0" />
            <span>
                {t("offlineSync.status.inProgress")}
            </span>
        </Badge>
    )
}


