import { useServerMutation } from "@/api/client/requests"
import { UpdateTheme_Variables } from "@/api/generated/endpoint.types"
import { API_ENDPOINTS } from "@/api/generated/endpoints"
import { Models_Theme } from "@/api/generated/types"
import { useOpenInExplorer } from "@/api/hooks/explorer.hooks"
import { useAnimeListTorrentProviderExtensions } from "@/api/hooks/extensions.hooks"
import { useCheckForUpdates } from "@/api/hooks/releases.hooks"
import { useSaveSettings } from "@/api/hooks/settings.hooks"
import { useGetTorrentstreamSettings } from "@/api/hooks/torrentstream.hooks"
import { electronUpdateModalOpenAtom } from "@/app/(main)/_electron/electron-update-modal"
import { CustomLibraryBanner } from "@/app/(main)/_features/anime-library/_containers/custom-library-banner"
import { __issueReport_overlayOpenAtom } from "@/app/(main)/_features/issue-report/issue-report"
import { updateModalOpenAtom as webUpdateModalOpenAtom } from "@/app/(main)/_features/update/update-modal"
import { useServerDisabledFeatures, useServerStatus, useSetServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { ExternalPlayerLinkSettings, MediaplayerSettings } from "@/app/(main)/settings/_components/mediaplayer-settings"
import { PlaybackSettings } from "@/app/(main)/settings/_components/playback-settings"
import { __settings_tabAtom } from "@/app/(main)/settings/_components/settings-page.atoms"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { AnimeLibrarySettings } from "@/app/(main)/settings/_containers/anime-library-settings"
import { DebridSettings } from "@/app/(main)/settings/_containers/debrid-settings"
import { FilecacheSettings } from "@/app/(main)/settings/_containers/filecache-settings"
import { LogsSettings } from "@/app/(main)/settings/_containers/logs-settings"
import { MangaSettings } from "@/app/(main)/settings/_containers/manga-settings"
import { MediastreamSettings } from "@/app/(main)/settings/_containers/mediastream-settings"
import { ServerSettings } from "@/app/(main)/settings/_containers/server-settings"
import { TorrentstreamSettings } from "@/app/(main)/settings/_containers/torrentstream-settings"
import { UISettings } from "@/app/(main)/settings/_containers/ui-settings"
import { PageWrapper } from "@/components/shared/page-wrapper"
import { SeaLink } from "@/components/shared/sea-link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/components/ui/core/styling"
import { Field, Form } from "@/components/ui/form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "@/lib/navigation"
import { DEFAULT_TORRENT_CLIENT, DEFAULT_TORRENT_PROVIDER, settingsSchema, TORRENT_PROVIDER } from "@/lib/server/settings"
import { THEME_DEFAULT_VALUES } from "@/lib/theme/theme-hooks"
import { __isElectronDesktop__ } from "@/types/constants"
import { useQueryClient } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { useAtom } from "jotai/react"
import capitalize from "lodash/capitalize"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { BiDonateHeart } from "react-icons/bi"
import { CgMediaPodcast } from "react-icons/cg"
import { FaDiscord } from "react-icons/fa"
import { HiOutlineServerStack } from "react-icons/hi2"
import {
    LuBookKey,
    LuBookOpen,
    LuCircleArrowOutUpRight,
    LuCirclePlay,
    LuFileSearch,
    LuLibrary,
    LuMonitor,
    LuMonitorPlay,
    LuPalette,
    LuTabletSmartphone,
    LuWandSparkles,
} from "react-icons/lu"
import { LuRefreshCw } from "react-icons/lu"
import { MdOutlineConnectWithoutContact, MdOutlineDownloading, MdOutlinePalette } from "react-icons/md"
import { RiFolderDownloadFill } from "react-icons/ri"
import { SiBittorrent, SiQbittorrent, SiTransmission } from "react-icons/si"
import { TbDatabaseExclamation } from "react-icons/tb"
import { VscDebugAlt } from "react-icons/vsc"
import { toast } from "sonner"
import { SettingsCard, SettingsNavCard, SettingsPageHeader } from "./_components/settings-card"
import { DenshiSettings } from "./_containers/denshi-settings"
import { DiscordRichPresenceSettings } from "./_containers/discord-rich-presence-settings"
import { LocalSettings } from "./_containers/local-settings"
import { NakamaSettings } from "./_containers/nakama-settings"

const tabContentClass = cn(
    "space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
)

function normalizeUpdateChannel(_channel?: string | null) {
    // This fork only exposes the fork-owned GitHub release channel in the UI.
    return "github"
}


export default function Page() {
    const { t } = useTranslation()
    const status = useServerStatus()
    const { isFeatureDisabled, showFeatureWarning } = useServerDisabledFeatures()
    const setServerStatus = useSetServerStatus()
    const router = useRouter()
    const queryClient = useQueryClient()

    const searchParams = useSearchParams()

    const { mutateAsync: saveSettings, data, isPending } = useSaveSettings()

    const [tab, setTab] = useAtom(__settings_tabAtom)
    const formRef = React.useRef<UseFormReturn<any>>(null)

    const { data: torrentProviderExtensions } = useAnimeListTorrentProviderExtensions()

    const { data: torrentstreamSettings } = useGetTorrentstreamSettings()

    const { mutateAsync: saveThemeSettings } = useServerMutation<Models_Theme, UpdateTheme_Variables>({
        endpoint: API_ENDPOINTS.THEME.UpdateTheme.endpoint,
        method: API_ENDPOINTS.THEME.UpdateTheme.methods[0],
        mutationKey: [API_ENDPOINTS.THEME.UpdateTheme.key, "settings-page"],
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.STATUS.GetStatus.key] })
        },
    })

    const { mutate: openInExplorer, isPending: isOpening } = useOpenInExplorer()

    const { mutate: checkForUpdates, isPending: isCheckingForUpdates } = useCheckForUpdates()
    const setWebUpdateModalOpen = useSetAtom(webUpdateModalOpenAtom)
    const setElectronUpdateModalOpen = useSetAtom(electronUpdateModalOpenAtom)

    React.useEffect(() => {
        if (!isPending && !!data?.settings) {
            setServerStatus(data)
        }
    }, [data, isPending])

    const setIssueRecorderOpen = useSetAtom(__issueReport_overlayOpenAtom)

    function handleOpenIssueRecorder() {
        if (isFeatureDisabled("UpdateSettings")) return showFeatureWarning()

        setIssueRecorderOpen(true)
        router.push("/")
    }

    const previousTab = React.useRef(tab)
    React.useEffect(() => {
        if (tab !== previousTab.current) {
            previousTab.current = tab
            formRef.current?.reset()
        }
    }, [tab])

    React.useEffect(() => {
        const initialTab = searchParams.get("tab")
        if (initialTab) {
            setTab(initialTab)
            setTimeout(() => {
                // Remove search param
                if (searchParams.has("tab")) {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete("tab")
                    router.replace(`?${newParams.toString()}`, { scroll: false })
                }
            }, 500)
        }
    }, [searchParams])

    if (!status?.settings) return <LoadingSpinner />

    return (
        <>
            <CustomLibraryBanner discrete />
            <PageWrapper data-settings-page-container className="p-4 sm:p-8 space-y-4 relative">
                {/*<Separator/>*/}


                {/*<Card className="p-0 overflow-hidden">*/}
                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className={cn("w-full grid grid-cols-1 lg:grid lg:grid-cols-[300px,1fr] gap-4")}
                    triggerClass={cn(
                        "text-base px-6 rounded-[--radius-md] w-fit lg:w-full rounded-lg border-0 data-[state=active]:bg-[--subtle] data-[state=active]:text-white dark:hover:text-white",
                        "h-9 lg:justify-start px-3 transition-all duration-200 hover:bg-[--subtle]/50 hover:transform",
                    )}
                    listClass={cn(
                        "w-full flex flex-wrap lg:flex-nowrap h-fit",
                        "lg:block p-2 lg:p-0",
                    )}
                    data-settings-page-tabs
                >
                    <TabsList className="flex-wrap max-w-full lg:space-y-2 lg:sticky lg:top-10">
                        <SettingsNavCard>
                            <div className="flex flex-col gap-4 md:flex-row justify-between items-center">

                            </div>
                            <div className="overflow-x-none overflow-y-hidden rounded-[--radius-md] space-y-1 lg:space-y-3 flex justify-center flex-wrap lg:block">

                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    <div className="space-y-2 p-4 w-full">
                                        <h4 className="text-center text-xl font-bold">{t("settings.title")}</h4>
                                        <div className="space-y-1">
                                            <p className="text-[--muted] text-sm text-center w-full">
                                                {status?.version} {status?.versionName}
                                            </p>
                                            <p className="text-[--muted] text-sm text-center w-full">
                                                {capitalize(status?.os)}{__isElectronDesktop__ &&
                                                <span className="font-medium"> - Denshi</span>}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    <TabsTrigger
                                        value="seanime"
                                        className="group"
                                    ><LuWandSparkles className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.app")}</TabsTrigger>
                                    <TabsTrigger
                                        value="ui"
                                        className="group"
                                    ><MdOutlinePalette className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.userInterface")}</TabsTrigger>
                                    {/* <TabsTrigger
                                     value="local"
                                     className="group"
                                     ><LuUserCog className="text-xl mr-3 transition-transform duration-200" /> Local Account</TabsTrigger> */}
                                    <TabsTrigger
                                        value="library"
                                        className="group"
                                    ><LuLibrary className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.localAnimeLibrary")}</TabsTrigger>
                                </Card>

                                {/*<div className="text-xs lg:text-[--muted] text-center py-1.5 uppercase px-3 border-gray-800 tracking-wide font-medium">*/}
                                {/*    Anime playback*/}
                                {/*</div>*/}

                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    <TabsTrigger
                                        value="playback"
                                        className="group"
                                    ><LuCirclePlay className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.videoPlayback")}</TabsTrigger>

                                    <TabsTrigger
                                        value="media-player"
                                        className="group"
                                    ><LuMonitorPlay className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.desktopMediaPlayer")}</TabsTrigger>
                                    <TabsTrigger
                                        value="external-player-link"
                                        className="group"
                                    ><LuCircleArrowOutUpRight className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.externalPlayerLink")}</TabsTrigger>
                                    <TabsTrigger
                                        value="mediastream"
                                        className="relative group"
                                    ><LuTabletSmartphone className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.transcodingDirectPlay")}</TabsTrigger>
                                </Card>

                                {/*<div className="text-xs lg:text-[--muted] text-center py-1.5 uppercase px-3 border-gray-800 tracking-wide font-medium">*/}
                                {/*    Torrenting*/}
                                {/*</div>*/}

                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    <TabsTrigger
                                        value="torrent"
                                        className="group"
                                    ><LuFileSearch className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.torrentProvider")}</TabsTrigger>
                                    <TabsTrigger
                                        value="torrent-client"
                                        className="group"
                                    ><MdOutlineDownloading className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.torrentClient")}</TabsTrigger>
                                    <TabsTrigger
                                        value="torrentstream"
                                        className="relative group"
                                    ><SiBittorrent className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.torrentStreaming")}</TabsTrigger>
                                    <TabsTrigger
                                        value="debrid"
                                        className="group"
                                    ><HiOutlineServerStack className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.debridService")}</TabsTrigger>
                                </Card>

                                {/*<div className="text-xs lg:text-[--muted] text-center py-1.5 uppercase px-3 border-gray-800 tracking-wide font-medium">*/}
                                {/*    Other features*/}
                                {/*</div>*/}

                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    <TabsTrigger
                                        value="onlinestream"
                                        className="group"
                                    ><CgMediaPodcast className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.onlineStreaming")}</TabsTrigger>

                                    <TabsTrigger
                                        value="manga"
                                        className="group"
                                    ><LuBookOpen className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.manga")}</TabsTrigger>
                                    <TabsTrigger
                                        value="nakama"
                                        className="group relative"
                                    ><MdOutlineConnectWithoutContact className="text-xl mr-3 transition-transform duration-200" /> {t("navigation.nakama")}</TabsTrigger>
                                    <TabsTrigger
                                        value="discord"
                                        className="group"
                                    ><FaDiscord className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.discord")}</TabsTrigger>
                                </Card>

                                {/*<div className="text-xs lg:text-[--muted] text-center py-1.5 uppercase px-3 border-gray-800 tracking-wide font-medium">*/}
                                {/*    Server & Interface*/}
                                {/*</div>*/}

                                <Card className="lg:p-2 contents lg:block border-0 bg-transparent lg:border lg:bg-gray-950/80">
                                    {__isElectronDesktop__ && (
                                        <TabsTrigger
                                            value="denshi"
                                            className="group"
                                        ><LuMonitor className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.denshi")}</TabsTrigger>
                                    )}
                                    {/* <TabsTrigger
                                     value="cache"
                                     className="group"
                                     ><TbDatabaseExclamation className="text-xl mr-3 transition-transform duration-200" /> Cache</TabsTrigger> */}
                                    <TabsTrigger
                                        value="logs"
                                        className="group"
                                    ><LuBookKey className="text-xl mr-3 transition-transform duration-200" /> {t("settings.sections.logsCache")}</TabsTrigger>
                                </Card>
                            </div>
                        </SettingsNavCard>

                        <div className="flex justify-center !mt-0 pb-4">
                            <SeaLink
                                href="https://github.com/sponsors/5rahim"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    intent="gray-link"
                                    size="md"
                                    leftIcon={<BiDonateHeart className="text-lg" />}
                                >
                                    {t("common.buttons.donate")}
                                </Button>
                            </SeaLink>
                        </div>
                    </TabsList>

                    <div className="">
                        <Form
                            schema={settingsSchema}
                            mRef={formRef}
                            onSubmit={async data => {
                                await saveSettings({
                                    library: {
                                        libraryPath: data.libraryPath,
                                        autoUpdateProgress: data.autoUpdateProgress,
                                        disableUpdateCheck: data.disableUpdateCheck,
                                        torrentProvider: data.torrentProvider,
                                        autoSelectTorrentProvider: data.autoSelectTorrentProvider,
                                        autoScan: data.autoScan,
                                        enableOnlinestream: data.enableOnlinestream,
                                        includeOnlineStreamingInLibrary: data.includeOnlineStreamingInLibrary ?? false,
                                        disableAnimeCardTrailers: data.disableAnimeCardTrailers,
                                        enableManga: data.enableManga,
                                        dohProvider: data.dohProvider === "-" ? "" : data.dohProvider,
                                        openTorrentClientOnStart: data.openTorrentClientOnStart,
                                        openWebURLOnStart: data.openWebURLOnStart,
                                        refreshLibraryOnStart: data.refreshLibraryOnStart,
                                        autoPlayNextEpisode: data.autoPlayNextEpisode ?? false,
                                        enableWatchContinuity: data.enableWatchContinuity ?? false,
                                        libraryPaths: data.libraryPaths ?? [],
                                        autoSyncOfflineLocalData: data.autoSyncOfflineLocalData ?? false,
                                        scannerMatchingThreshold: data.scannerMatchingThreshold,
                                        scannerMatchingAlgorithm: data.scannerMatchingAlgorithm === "-" ? "" : data.scannerMatchingAlgorithm,
                                        autoSyncToLocalAccount: data.autoSyncToLocalAccount ?? false,
                                        autoSaveCurrentMediaOffline: data.autoSaveCurrentMediaOffline ?? false,
                                        useFallbackMetadataProvider: data.useFallbackMetadataProvider ?? false,
                                        scannerUseLegacyMatching: data.scannerUseLegacyMatching ?? false,
                                        scannerConfig: data.scannerConfig ?? "",
                                        updateChannel: normalizeUpdateChannel(data.updateChannel),
                                        enableExtensionSecureMode: data.enableExtensionSecureMode ?? false,
                                        defaultPlaybackSource: data.defaultPlaybackSource === "-" ? "" : data.defaultPlaybackSource,
                                    },
                                    nakama: {
                                        enabled: data.nakamaEnabled ?? false,
                                        username: data.nakamaUsername,
                                        isHost: data.nakamaIsHost ?? false,
                                        remoteServerURL: data.nakamaRemoteServerURL,
                                        remoteServerPassword: data.nakamaRemoteServerPassword,
                                        hostShareLocalAnimeLibrary: data.nakamaHostShareLocalAnimeLibrary ?? false,
                                        hostPassword: data.nakamaHostPassword,
                                        includeNakamaAnimeLibrary: data.includeNakamaAnimeLibrary ?? false,
                                        hostUnsharedAnimeIds: data?.nakamaHostUnsharedAnimeIds ?? [],
                                        hostEnablePortForwarding: data.nakamaHostEnablePortForwarding ?? false,
                                    },
                                    manga: {
                                        defaultMangaProvider: data.defaultMangaProvider === "-" ? "" : data.defaultMangaProvider,
                                        mangaAutoUpdateProgress: data.mangaAutoUpdateProgress ?? false,
                                        mangaLocalSourceDirectory: data.mangaLocalSourceDirectory || "",
                                    },
                                    mediaPlayer: {
                                        host: data.mediaPlayerHost,
                                        defaultPlayer: data.defaultPlayer,
                                        vlcPort: data.vlcPort,
                                        vlcUsername: data.vlcUsername || "",
                                        vlcPassword: data.vlcPassword,
                                        vlcPath: data.vlcPath || "",
                                        mpcPort: data.mpcPort,
                                        mpcPath: data.mpcPath || "",
                                        mpvSocket: data.mpvSocket || "",
                                        mpvPath: data.mpvPath || "",
                                        mpvArgs: data.mpvArgs || "",
                                        iinaSocket: data.iinaSocket || "",
                                        iinaPath: data.iinaPath || "",
                                        iinaArgs: data.iinaArgs || "",
                                        vcTranslate: data.vcTranslate ?? false,
                                        vcTranslateApiKey: data.vcTranslateApiKey || "",
                                        vcTranslateProvider: data.vcTranslateProvider || "",
                                        vcTranslateTargetLanguage: data.vcTranslateTargetLanguage || "",
                                        vcTranslateBaseUrl: data.vcTranslateBaseUrl || "",
                                        vcTranslateModel: data.vcTranslateModel || "",
                                    },
                                    torrent: {
                                        defaultTorrentClient: data.defaultTorrentClient,
                                        qbittorrentPath: data.qbittorrentPath,
                                        qbittorrentHost: data.qbittorrentHost,
                                        qbittorrentPort: data.qbittorrentPort,
                                        qbittorrentPassword: data.qbittorrentPassword,
                                        qbittorrentUsername: data.qbittorrentUsername,
                                        qbittorrentTags: data.qbittorrentTags,
                                        qbittorrentCategory: data.qbittorrentCategory,
                                        transmissionPath: data.transmissionPath,
                                        transmissionHost: data.transmissionHost,
                                        transmissionPort: data.transmissionPort,
                                        transmissionUsername: data.transmissionUsername,
                                        transmissionPassword: data.transmissionPassword,
                                        showActiveTorrentCount: data.showActiveTorrentCount ?? false,
                                        hideTorrentList: data.hideTorrentList ?? false,
                                    },
                                    discord: {
                                        enableRichPresence: data?.enableRichPresence ?? false,
                                        enableAnimeRichPresence: data?.enableAnimeRichPresence ?? false,
                                        enableMangaRichPresence: data?.enableMangaRichPresence ?? false,
                                        richPresenceHideSeanimeRepositoryButton: data?.richPresenceHideSeanimeRepositoryButton ?? false,
                                        richPresenceShowAniListMediaButton: data?.richPresenceShowAniListMediaButton ?? false,
                                        richPresenceShowAniListProfileButton: data?.richPresenceShowAniListProfileButton ?? false,
                                        richPresenceUseMediaTitleStatus: data?.richPresenceUseMediaTitleStatus ?? false,
                                    },
                                    anilist: {
                                        hideAudienceScore: data.hideAudienceScore,
                                        enableAdultContent: data.enableAdultContent,
                                        blurAdultContent: data.blurAdultContent,
                                        disableCacheLayer: data.disableCacheLayer,
                                    },
                                    notifications: {
                                        disableNotifications: data?.disableNotifications ?? false,
                                        disableAutoDownloaderNotifications: data?.disableAutoDownloaderNotifications ?? false,
                                        disableAutoScannerNotifications: data?.disableAutoScannerNotifications ?? false,
                                    },
                                }, {
                                    onSuccess: () => {
                                        formRef.current?.reset(formRef.current.getValues())

                                        // Sync the normalized fork update source to Denshi
                                        if (__isElectronDesktop__ && window.electron?.denshiSettings) {
                                            window.electron.denshiSettings.get().then((denshiSettings) => {
                                                window.electron!.denshiSettings.set({
                                                    ...denshiSettings,
                                                    updateChannel: normalizeUpdateChannel(data.updateChannel),
                                                })
                                            })
                                        }
                                    },
                                })

                                const prevTheme = status?.themeSettings ?? { id: 0, ...THEME_DEFAULT_VALUES }
                                const shouldSaveSpoilerSettings =
                                    data.hideAnimeSpoilers !== prevTheme.hideAnimeSpoilers
                                    || data.hideAnimeSpoilerThumbnails !== prevTheme.hideAnimeSpoilerThumbnails
                                    || data.hideAnimeSpoilerTitles !== prevTheme.hideAnimeSpoilerTitles
                                    || data.hideAnimeSpoilerDescriptions !== prevTheme.hideAnimeSpoilerDescriptions
                                    || data.hideAnimeSpoilerSkipNextEpisode !== prevTheme.hideAnimeSpoilerSkipNextEpisode

                                if (shouldSaveSpoilerSettings) {
                                    await saveThemeSettings({
                                        theme: {
                                            ...prevTheme,
                                            hideAnimeSpoilers: data.hideAnimeSpoilers ?? false,
                                            hideAnimeSpoilerThumbnails: data.hideAnimeSpoilerThumbnails ?? true,
                                            hideAnimeSpoilerTitles: data.hideAnimeSpoilerTitles ?? true,
                                            hideAnimeSpoilerDescriptions: data.hideAnimeSpoilerDescriptions ?? true,
                                            hideAnimeSpoilerSkipNextEpisode: data.hideAnimeSpoilerSkipNextEpisode ?? false,
                                        },
                                    })
                                }

                                formRef.current?.reset(formRef.current.getValues())

                                if (__isElectronDesktop__ && window.electron?.denshiSettings) {
                                    const denshiSettings = await window.electron.denshiSettings.get()
                                    await window.electron.denshiSettings.set({
                                        ...denshiSettings,
                                        updateChannel: data.updateChannel || "github",
                                    })
                                }
                            }}
                            defaultValues={{
                                libraryPath: status?.settings?.library?.libraryPath,
                                mediaPlayerHost: status?.settings?.mediaPlayer?.host,
                                torrentProvider: status?.settings?.library?.torrentProvider || DEFAULT_TORRENT_PROVIDER, // (Backwards compatibility)
                                autoSelectTorrentProvider: status?.settings?.library?.autoSelectTorrentProvider || DEFAULT_TORRENT_PROVIDER, // (Backwards
                                // compatibility)
                                autoScan: status?.settings?.library?.autoScan,
                                defaultPlayer: status?.settings?.mediaPlayer?.defaultPlayer,
                                vlcPort: status?.settings?.mediaPlayer?.vlcPort,
                                vlcUsername: status?.settings?.mediaPlayer?.vlcUsername,
                                vlcPassword: status?.settings?.mediaPlayer?.vlcPassword,
                                vlcPath: status?.settings?.mediaPlayer?.vlcPath,
                                mpcPort: status?.settings?.mediaPlayer?.mpcPort,
                                mpcPath: status?.settings?.mediaPlayer?.mpcPath,
                                mpvSocket: status?.settings?.mediaPlayer?.mpvSocket,
                                mpvPath: status?.settings?.mediaPlayer?.mpvPath,
                                mpvArgs: status?.settings?.mediaPlayer?.mpvArgs,
                                iinaSocket: status?.settings?.mediaPlayer?.iinaSocket,
                                iinaPath: status?.settings?.mediaPlayer?.iinaPath,
                                iinaArgs: status?.settings?.mediaPlayer?.iinaArgs,
                                defaultTorrentClient: status?.settings?.torrent?.defaultTorrentClient || DEFAULT_TORRENT_CLIENT, // (Backwards
                                // compatibility)
                                hideTorrentList: status?.settings?.torrent?.hideTorrentList ?? false,
                                qbittorrentPath: status?.settings?.torrent?.qbittorrentPath,
                                qbittorrentHost: status?.settings?.torrent?.qbittorrentHost,
                                qbittorrentPort: status?.settings?.torrent?.qbittorrentPort,
                                qbittorrentPassword: status?.settings?.torrent?.qbittorrentPassword,
                                qbittorrentUsername: status?.settings?.torrent?.qbittorrentUsername,
                                qbittorrentTags: status?.settings?.torrent?.qbittorrentTags,
                                qbittorrentCategory: status?.settings?.torrent?.qbittorrentCategory,
                                transmissionPath: status?.settings?.torrent?.transmissionPath,
                                transmissionHost: status?.settings?.torrent?.transmissionHost,
                                transmissionPort: status?.settings?.torrent?.transmissionPort,
                                transmissionUsername: status?.settings?.torrent?.transmissionUsername,
                                transmissionPassword: status?.settings?.torrent?.transmissionPassword,
                                hideAudienceScore: status?.settings?.anilist?.hideAudienceScore ?? false,
                                autoUpdateProgress: status?.settings?.library?.autoUpdateProgress ?? false,
                                disableUpdateCheck: status?.settings?.library?.disableUpdateCheck ?? false,
                                enableOnlinestream: status?.settings?.library?.enableOnlinestream ?? false,
                                includeOnlineStreamingInLibrary: status?.settings?.library?.includeOnlineStreamingInLibrary ?? false,
                                disableAnimeCardTrailers: status?.settings?.library?.disableAnimeCardTrailers ?? false,
                                enableManga: status?.settings?.library?.enableManga ?? false,
                                enableRichPresence: status?.settings?.discord?.enableRichPresence ?? false,
                                enableAnimeRichPresence: status?.settings?.discord?.enableAnimeRichPresence ?? false,
                                enableMangaRichPresence: status?.settings?.discord?.enableMangaRichPresence ?? false,
                                enableAdultContent: status?.settings?.anilist?.enableAdultContent ?? false,
                                blurAdultContent: status?.settings?.anilist?.blurAdultContent ?? false,
                                dohProvider: status?.settings?.library?.dohProvider || "-",
                                openTorrentClientOnStart: status?.settings?.library?.openTorrentClientOnStart ?? false,
                                openWebURLOnStart: status?.settings?.library?.openWebURLOnStart ?? false,
                                refreshLibraryOnStart: status?.settings?.library?.refreshLibraryOnStart ?? false,
                                richPresenceHideSeanimeRepositoryButton: status?.settings?.discord?.richPresenceHideSeanimeRepositoryButton ?? false,
                                richPresenceShowAniListMediaButton: status?.settings?.discord?.richPresenceShowAniListMediaButton ?? false,
                                richPresenceShowAniListProfileButton: status?.settings?.discord?.richPresenceShowAniListProfileButton ?? false,
                                richPresenceUseMediaTitleStatus: status?.settings?.discord?.richPresenceUseMediaTitleStatus ?? false,
                                disableNotifications: status?.settings?.notifications?.disableNotifications ?? false,
                                disableAutoDownloaderNotifications: status?.settings?.notifications?.disableAutoDownloaderNotifications ?? false,
                                disableAutoScannerNotifications: status?.settings?.notifications?.disableAutoScannerNotifications ?? false,
                                defaultMangaProvider: status?.settings?.manga?.defaultMangaProvider || "-",
                                mangaAutoUpdateProgress: status?.settings?.manga?.mangaAutoUpdateProgress ?? false,
                                showActiveTorrentCount: status?.settings?.torrent?.showActiveTorrentCount ?? false,
                                autoPlayNextEpisode: status?.settings?.library?.autoPlayNextEpisode ?? false,
                                enableWatchContinuity: status?.settings?.library?.enableWatchContinuity ?? false,
                                libraryPaths: status?.settings?.library?.libraryPaths ?? [],
                                autoSyncOfflineLocalData: status?.settings?.library?.autoSyncOfflineLocalData ?? false,
                                scannerMatchingThreshold: status?.settings?.library?.scannerMatchingThreshold ?? 0.5,
                                scannerMatchingAlgorithm: status?.settings?.library?.scannerMatchingAlgorithm || "-",
                                mangaLocalSourceDirectory: status?.settings?.manga?.mangaLocalSourceDirectory || "",
                                autoSyncToLocalAccount: status?.settings?.library?.autoSyncToLocalAccount ?? false,
                                nakamaEnabled: status?.settings?.nakama?.enabled ?? false,
                                nakamaUsername: status?.settings?.nakama?.username ?? "",
                                nakamaIsHost: status?.settings?.nakama?.isHost ?? false,
                                nakamaRemoteServerURL: status?.settings?.nakama?.remoteServerURL ?? "",
                                nakamaRemoteServerPassword: status?.settings?.nakama?.remoteServerPassword ?? "",
                                nakamaHostShareLocalAnimeLibrary: status?.settings?.nakama?.hostShareLocalAnimeLibrary ?? false,
                                nakamaHostPassword: status?.settings?.nakama?.hostPassword ?? "",
                                includeNakamaAnimeLibrary: status?.settings?.nakama?.includeNakamaAnimeLibrary ?? false,
                                nakamaHostUnsharedAnimeIds: status?.settings?.nakama?.hostUnsharedAnimeIds ?? [],
                                autoSaveCurrentMediaOffline: status?.settings?.library?.autoSaveCurrentMediaOffline ?? false,
                                useFallbackMetadataProvider: status?.settings?.library?.useFallbackMetadataProvider ?? false,
                                vcTranslate: status?.settings?.mediaPlayer?.vcTranslate ?? false,
                                vcTranslateApiKey: status?.settings?.mediaPlayer?.vcTranslateApiKey ?? "",
                                vcTranslateProvider: status?.settings?.mediaPlayer?.vcTranslateProvider ?? "",
                                vcTranslateTargetLanguage: status?.settings?.mediaPlayer?.vcTranslateTargetLanguage ?? "",
                                vcTranslateBaseUrl: status?.settings?.mediaPlayer?.vcTranslateBaseUrl ?? "",
                                vcTranslateModel: status?.settings?.mediaPlayer?.vcTranslateModel ?? "",
                                scannerUseLegacyMatching: status?.settings?.library?.scannerUseLegacyMatching ?? false,
                                scannerConfig: status?.settings?.library?.scannerConfig ?? "",
                                updateChannel: normalizeUpdateChannel(status?.settings?.library?.updateChannel),
                                enableExtensionSecureMode: status?.settings?.library?.enableExtensionSecureMode ?? false,
                                defaultPlaybackSource: status?.settings?.library?.defaultPlaybackSource || "-",
                                hideAnimeSpoilers: status?.themeSettings?.hideAnimeSpoilers ?? THEME_DEFAULT_VALUES.hideAnimeSpoilers,
                                hideAnimeSpoilerThumbnails: status?.themeSettings?.hideAnimeSpoilerThumbnails ?? THEME_DEFAULT_VALUES.hideAnimeSpoilerThumbnails,
                                hideAnimeSpoilerTitles: status?.themeSettings?.hideAnimeSpoilerTitles ?? THEME_DEFAULT_VALUES.hideAnimeSpoilerTitles,
                                hideAnimeSpoilerDescriptions: status?.themeSettings?.hideAnimeSpoilerDescriptions ?? THEME_DEFAULT_VALUES.hideAnimeSpoilerDescriptions,
                                hideAnimeSpoilerSkipNextEpisode: status?.themeSettings?.hideAnimeSpoilerSkipNextEpisode ?? THEME_DEFAULT_VALUES.hideAnimeSpoilerSkipNextEpisode,
                            }}
                            stackClass="space-y-0 relative"
                        >
                            {(f) => {
                                return <>
                                    <SettingsIsDirty />
                                    <TabsContent value="seanime" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.app.title")}
                                            description={t("settings.pages.app.description")}
                                            icon={LuWandSparkles}
                                        />

                                        <div className="flex flex-wrap gap-2 slide-in-from-bottom duration-500 delay-150">
                                            {!!status?.dataDir && <Button
                                                size="sm"
                                                intent="gray-outline"
                                                onClick={() => openInExplorer({
                                                    path: status?.dataDir,
                                                })}
                                                className="transition-all duration-200 hover:scale-105 hover:shadow-md"
                                                leftIcon={
                                                    <RiFolderDownloadFill className="transition-transform duration-200 group-hover:scale-110" />}
                                            >
                                                {t("settings.pages.app.openDataDirectory")}
                                            </Button>}
                                            <Button
                                                size="sm"
                                                intent="gray-outline"
                                                onClick={handleOpenIssueRecorder}
                                                leftIcon={<VscDebugAlt className="transition-transform duration-200 group-hover:scale-110" />}
                                                className="transition-all duration-200 hover:scale-105 hover:shadow-md group"
                                                data-open-issue-recorder-button
                                            >
                                                {t("settings.pages.app.recordIssue")}
                                            </Button>
                                            <Button
                                                size="sm"
                                                intent="gray-outline"
                                                onClick={() => {
                                                    checkForUpdates(undefined, {
                                                        onSuccess: (data) => {
                                                            if (data?.release) {
                                                                queryClient.setQueryData([API_ENDPOINTS.RELEASES.GetLatestUpdate.key], data)

                                                                if (__isElectronDesktop__) {
                                                                    // Also trigger Electron update
                                                                    if (window.electron) {
                                                                        window.electron.checkForUpdates().catch(() => { })
                                                                    }
                                                                    setElectronUpdateModalOpen(true)
                                                                } else {
                                                                    setWebUpdateModalOpen(true)
                                                                }
                                                            } else {
                                                                toast.success(t("settings.pages.app.latestVersion"))
                                                            }

                                                        },
                                                    })
                                                }}
                                                loading={isCheckingForUpdates}
                                                leftIcon={<LuRefreshCw className="transition-transform duration-200 group-hover:rotate-180" />}
                                                className="transition-all duration-200 hover:scale-105 hover:shadow-md group"
                                                data-check-for-updates-button
                                            >
                                                {t("settings.pages.app.checkForUpdates")}
                                            </Button>
                                        </div>

                                        <ServerSettings isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="library" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.library.title")}
                                            description={t("settings.pages.library.description")}
                                            icon={LuLibrary}
                                        />

                                        <AnimeLibrarySettings isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="local" className={tabContentClass}>

                                        <LocalSettings isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="manga" className={tabContentClass}>

                                        <MangaSettings isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="onlinestream" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.onlineStreaming.title")}
                                            description={t("settings.pages.onlineStreaming.description")}
                                            icon={CgMediaPodcast}
                                        />

                                        <SettingsCard>
                                            <div data-settings-enable-onlinestream>
                                                <Field.Switch
                                                    side="right"
                                                    name="enableOnlinestream"
                                                    label={t("settings.fields.enable")}
                                                    help={t("settings.onlineStreaming.enableHelp")}
                                                />
                                            </div>
                                        </SettingsCard>

                                        <SettingsCard title={t("settings.common.homeScreen")}>
                                            <Field.Switch
                                                side="right"
                                                name="includeOnlineStreamingInLibrary"
                                                label={t("settings.common.includeInAnimeLibrary")}
                                                help={t("settings.common.includeInAnimeLibraryHelp")}
                                            />
                                        </SettingsCard>

                                        <SettingsSubmitButton isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="discord" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.discord.title")}
                                            description={t("settings.pages.discord.description")}
                                            icon={FaDiscord}
                                        />

                                        <DiscordRichPresenceSettings />

                                        <SettingsSubmitButton isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="torrent" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.torrentProvider.title")}
                                            description={t("settings.pages.torrentProvider.description")}
                                            icon={LuFileSearch}
                                        />

                                        <SettingsCard>
                                            <Field.Select
                                                name="torrentProvider"
                                                label={t("settings.fields.defaultProvider")}
                                                help={t("settings.torrentProvider.defaultProviderHelp")}
                                                leftIcon={<RiFolderDownloadFill className="text-orange-500" />}
                                                options={[
                                                    ...(torrentProviderExtensions?.filter(ext => ext?.settings?.type === "main")?.map(ext => ({
                                                        label: ext.name,
                                                        value: ext.id,
                                                    })) ?? []).sort((a, b) => a?.label?.localeCompare(b?.label) ?? 0),
                                                    { label: t("common.words.none"), value: TORRENT_PROVIDER.NONE },
                                                ]}
                                            />
                                        </SettingsCard>


                                        {/*<Separator />*/}

                                        {/*<h3>DNS over HTTPS</h3>*/}

                                        {/*<Field.Select*/}
                                        {/*    name="dohProvider"*/}
                                        {/*    // label="Torrent Provider"*/}
                                        {/*    help="Choose a DNS over HTTPS provider to resolve domain names for torrent search."*/}
                                        {/*    leftIcon={<FcFilingCabinet className="-500" />}*/}
                                        {/*    options={[*/}
                                        {/*        { label: "None", value: "-" },*/}
                                        {/*        { label: "Cloudflare", value: "cloudflare" },*/}
                                        {/*        { label: "Quad9", value: "quad9" },*/}
                                        {/*    ]}*/}
                                        {/*/>*/}

                                        <SettingsSubmitButton isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="media-player" className={tabContentClass}>
                                        <MediaplayerSettings isPending={isPending} />
                                    </TabsContent>


                                    <TabsContent value="external-player-link" className={tabContentClass}>
                                        <ExternalPlayerLinkSettings />
                                    </TabsContent>

                                    <TabsContent value="playback" className={tabContentClass}>
                                        <PlaybackSettings />
                                    </TabsContent>

                                    <TabsContent value="torrent-client" className={tabContentClass}>

                                        <SettingsPageHeader
                                            title={t("settings.pages.torrentClient.title")}
                                            description={t("settings.pages.torrentClient.description")}
                                            icon={MdOutlineDownloading}
                                        />

                                        <SettingsCard>
                                            <Field.Select
                                                name="defaultTorrentClient"
                                                label={t("settings.fields.defaultTorrentClient")}
                                                options={[
                                                    { label: "qBittorrent", value: "qbittorrent" },
                                                    { label: "Transmission", value: "transmission" },
                                                    { label: t("common.words.none"), value: "none" },
                                                ]}
                                            />
                                        </SettingsCard>

                                        {/*<SettingsCard>*/}
                                        <Accordion
                                            type="single"
                                            className="group/settings-card relative bg-gray-950/70 rounded-xl border overflow-hidden"
                                            triggerClass="px-4 py-3 text-[--muted] dark:data-[state=open]:text-white dark:hover:bg-transparent hover:bg-transparent dark:hover:text-white !font-medium transition-all duration-200 hover:translate-x-1"
                                            itemClass="border-b border-[--border] rounded-none transition-all duration-200 hover:border-[--brand]/30"
                                            contentClass="!p-4 animate-in duration-300"
                                            collapsible
                                            defaultValue={status?.settings?.torrent?.defaultTorrentClient}
                                        >
                                            <AccordionItem value="qbittorrent">
                                                <AccordionTrigger>
                                                    <h4 className="flex gap-2 items-center">
                                                        <SiQbittorrent className="text-blue-400" /> qBittorrent
                                                    </h4>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-0 py-4 space-y-4">
                                                    <Field.Text
                                                        name="qbittorrentHost"
                                                        label={t("settings.fields.host")}
                                                    />
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <Field.Text
                                                            name="qbittorrentUsername"
                                                            label={t("settings.fields.username")}
                                                        />
                                                        <Field.Text
                                                            name="qbittorrentPassword"
                                                            label={t("settings.fields.password")}
                                                            type="password"
                                                        />
                                                        <Field.Number
                                                            name="qbittorrentPort"
                                                            label={t("settings.fields.port")}
                                                            formatOptions={{
                                                                useGrouping: false,
                                                            }}
                                                        />
                                                    </div>
                                                    <Field.Text
                                                        name="qbittorrentPath"
                                                        label={t("settings.fields.executable")}
                                                    />
                                                    <Field.Text
                                                        name="qbittorrentTags"
                                                        label={t("settings.fields.tags")}
                                                        help={t("settings.torrentClient.tagsHelp")}
                                                    />
                                                    <Field.Text
                                                        name="qbittorrentCategory"
                                                        label={t("settings.fields.category")}
                                                        help={t("settings.torrentClient.categoryHelp")}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="transmission">
                                                <AccordionTrigger>
                                                    <h4 className="flex gap-2 items-center">
                                                        <SiTransmission className="text-orange-200" /> Transmission</h4>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-0 py-4 space-y-4 !border-b-0">
                                                    <Field.Text
                                                        name="transmissionHost"
                                                        label={t("settings.fields.host")}
                                                    />
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <Field.Text
                                                            name="transmissionUsername"
                                                            label={t("settings.fields.username")}
                                                        />
                                                        <Field.Text
                                                            name="transmissionPassword"
                                                            label={t("settings.fields.password")}
                                                            type="password"
                                                        />
                                                        <Field.Number
                                                            name="transmissionPort"
                                                            label={t("settings.fields.port")}
                                                            formatOptions={{
                                                                useGrouping: false,
                                                            }}
                                                        />
                                                    </div>
                                                    <Field.Text
                                                        name="transmissionPath"
                                                        label={t("settings.fields.executable")}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                        {/*</SettingsCard>*/}

                                        <SettingsCard title={t("settings.common.integration")}>
                                            {/*<Field.Switch*/}
                                            {/*    side="right"*/}
                                            {/*    name="hideTorrentList"*/}
                                            {/*    label="Hide torrent list navigation icon"*/}
                                            {/*/>*/}
                                            <Field.Switch
                                                side="right"
                                                name="showActiveTorrentCount"
                                                label={t("settings.torrentClient.showActiveTorrentCount")}
                                                help={t("settings.torrentClient.showActiveTorrentCountHelp")}
                                            />
                                            <Field.Switch
                                                side="right"
                                                name="openTorrentClientOnStart"
                                                label={t("settings.torrentClient.openTorrentClientOnStartup")}
                                            />
                                        </SettingsCard>

                                        <SettingsSubmitButton isPending={isPending} />

                                    </TabsContent>

                                    <TabsContent value="nakama" className={tabContentClass}>

                                        <NakamaSettings isPending={isPending} />

                                    </TabsContent>
                                </>
                            }}
                        </Form>

                        {/* <TabsContent value="cache" className={tabContentClass}>

                         <SettingsPageHeader
                         title="Cache"
                         description="Manage the cache"
                         icon={TbDatabaseExclamation}
                         />

                         <FilecacheSettings />

                         </TabsContent> */}

                        <TabsContent value="mediastream" className={tabContentClass}>

                            <MediastreamSettings />

                        </TabsContent>

                        <TabsContent value="ui" className={tabContentClass}>

                            <SettingsPageHeader
                                title={t("settings.ui.title")}
                                description={t("settings.ui.description")}
                                icon={LuPalette}
                            />

                            <UISettings />

                        </TabsContent>

                        <TabsContent value="torrentstream" className={tabContentClass}>

                            <SettingsPageHeader
                                title={t("settings.pages.torrentStreaming.title")}
                                description={t("settings.pages.torrentStreaming.description")}
                                icon={SiBittorrent}
                            />

                            <TorrentstreamSettings settings={torrentstreamSettings} />

                        </TabsContent>

                        <TabsContent value="logs" className={tabContentClass}>

                            <SettingsPageHeader
                                title={t("settings.pages.logs.title")}
                                description={t("settings.pages.logs.description")}
                                icon={LuBookKey}
                            />


                            <LogsSettings />

                            <Separator />

                            <SettingsPageHeader
                                title={t("settings.pages.cache.title")}
                                description={t("settings.pages.cache.description")}
                                icon={TbDatabaseExclamation}
                            />

                            <FilecacheSettings />

                        </TabsContent>

                        {__isElectronDesktop__ && (
                            <TabsContent value="denshi" className={tabContentClass}>

                                <SettingsPageHeader
                                    title={t("settings.pages.denshi.title")}
                                    description={t("settings.pages.denshi.description")}
                                    icon={LuMonitor}
                                />

                                <DenshiSettings />

                            </TabsContent>
                        )}


                        {/*<TabsContent value="data" className="space-y-4">*/}

                        {/*    <DataSettings />*/}

                        {/*</TabsContent>*/}

                        <TabsContent value="debrid" className={tabContentClass}>

                            <DebridSettings />

                        </TabsContent>
                    </div>
                </Tabs>
                {/*</Card>*/}

            </PageWrapper>
        </>
    )

}
