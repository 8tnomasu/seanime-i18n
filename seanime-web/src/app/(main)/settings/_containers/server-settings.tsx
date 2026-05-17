import { useGetAnilistCacheLayerStatus, useToggleAnilistCacheLayerStatus } from "@/api/hooks/anilist.hooks"
import { useListAnimeEntryEpisodeTabExtensions } from "@/api/hooks/extensions.hooks"
import { useLocalSyncSimulatedDataToAnilist } from "@/api/hooks/local.hooks"
import { __seaCommand_shortcuts } from "@/app/(main)/_features/sea-command/sea-command"
import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { __isElectronDesktop__ } from "@/types/constants"
import { useAtom } from "jotai/react"
import React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FaRedo } from "react-icons/fa"
import { LuCircleAlert, LuCloudUpload, LuDatabaseBackup, LuEyeOff, LuImageOff, LuImages, LuShield, LuStarOff, LuUserPen } from "react-icons/lu"
import { MdDownloading } from "react-icons/md"
import { RiMovieAiLine } from "react-icons/ri"
import { TbAlertSquareRoundedOff, TbBrowserShare, TbChecklist, TbClockPlay, TbDownloadOff, TbProgressCheck, TbRating18Plus } from "react-icons/tb"
import { useServerStatus } from "../../_hooks/use-server-status"

type ServerSettingsProps = {
    isPending: boolean
}

export function ServerSettings(props: ServerSettingsProps) {
    const { t } = useTranslation()

    const {
        isPending,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const { data: episodeTabExtensions } = useListAnimeEntryEpisodeTabExtensions()

    const [shortcuts, setShortcuts] = useAtom(__seaCommand_shortcuts)
    const f = useFormContext()
    const defaultPlaybackSource = useWatch({ name: "defaultPlaybackSource" })

    const defaultPlaybackSourceOptions = React.useMemo(() => {
        const pluginOptions = Array.from(new Map((episodeTabExtensions ?? []).map(ext => [
            `ext:${ext.id}`,
            {
                value: `ext:${ext.id}`,
                label: ext.tabName ? `${ext.tabName} (${ext.name})` : ext.name,
            },
        ])).values()).sort((a, b) => a.label.localeCompare(b.label))

        const options = [
            { value: "-", label: t("settings.server.defaultPlaybackSourceOptions.automatic") },
            { value: "library", label: t("settings.server.defaultPlaybackSourceOptions.localLibrary") },
            ...(serverStatus?.debridSettings?.enabled ? [{ value: "debridstream", label: t("settings.server.defaultPlaybackSourceOptions.debridStreaming") }] : []),
            ...(serverStatus?.torrentstreamSettings?.enabled ? [{ value: "torrentstream", label: t("settings.server.defaultPlaybackSourceOptions.torrentStreaming") }] : []),
            ...(serverStatus?.settings?.library?.enableOnlinestream ? [{ value: "onlinestream", label: t("settings.server.defaultPlaybackSourceOptions.onlineStreaming") }] : []),
            ...pluginOptions,
        ]

        if (!!defaultPlaybackSource && defaultPlaybackSource.startsWith("ext:") && !options.some(option => option.value === defaultPlaybackSource)) {
            options.push({ value: defaultPlaybackSource, label: t("settings.server.defaultPlaybackSourceOptions.unavailablePlugin") })
        }

        return options
    }, [episodeTabExtensions, serverStatus, defaultPlaybackSource])

    const { mutate: upload, isPending: isUploading } = useLocalSyncSimulatedDataToAnilist()

    const { data: isApiWorking, isLoading: isFetchingApiStatus } = useGetAnilistCacheLayerStatus()
    const { mutate: toggleCacheLayer, isPending: isTogglingCacheLayer } = useToggleAnilistCacheLayerStatus()

    const confirmDialog = useConfirmationDialog({
        title: t("settings.common.uploadToAniListDialog.title"),
        description: t("settings.common.uploadToAniListDialog.description"),
        actionText: t("common.buttons.upload"),
        actionIntent: "primary",
        onConfirm: async () => {
            if (isUploading) return
            upload()
        },
    })

    return (
        <div className="space-y-4">

            {(!isApiWorking && !isFetchingApiStatus) && (
                <Alert
                    intent="warning-basic"
                    description={<div className="space-y-1">
                        <p>{t("settings.server.aniListApiCacheWarningLine1")}</p>
                        <p>{t("settings.server.aniListApiCacheWarningLine2")}</p>
                    </div>}
                    className="fixed top-4 right-4 z-[50] hidden lg:block"
                />
            )}

            <SettingsCard>
                {/*<p className="text-[--muted]">*/}
                {/*    Only applies to desktop and integrated players.*/}
                {/*</p>*/}

                <Field.Switch
                    side="right"
                    name="autoUpdateProgress"
                    label={t("settings.server.automaticallyUpdateProgress")}
                    help={t("settings.server.automaticallyUpdateProgressHelp")}
                    moreHelp={t("settings.server.desktopAndIntegratedPlayersOnly")}
                    icon={<TbProgressCheck className="" />}
                />
                {/*<Separator />*/}
                <Field.Switch
                    side="right"
                    name="enableWatchContinuity"
                    label={t("settings.server.enableWatchHistory")}
                    help={t("settings.server.enableWatchHistoryHelp")}
                    moreHelp={t("settings.server.desktopAndIntegratedPlayersOnly")}
                    icon={<TbClockPlay className="" />}
                />

                <Field.Switch
                    side="right"
                    name="disableAnimeCardTrailers"
                    label={t("settings.server.disableAnimeCardTrailers")}
                    help={t("settings.server.disableAnimeCardTrailersHelp")}
                    icon={<LuImageOff className="" />}
                />

                <div data-settings-default-episode-source>
                    <Field.Select
                        name="defaultPlaybackSource"
                        label={t("settings.server.defaultPlaybackSource")}
                        help={t("settings.server.defaultPlaybackSourceHelp")}
                        leftIcon={<RiMovieAiLine />}
                        options={defaultPlaybackSourceOptions}
                    />
                </div>

                <Separator />

                    <div data-settings-hide-anime-spoilers>
                        <Field.Switch
                            side="right"
                            label={t("settings.server.hideAnimeSpoilers")}
                            help={t("settings.server.hideAnimeSpoilersHelp")}
                            name="hideAnimeSpoilers"
                            icon={<LuEyeOff className="" />}
                        />
                </div>

                {f.watch("hideAnimeSpoilers") && (
                    <div className="space-y-1 pl-4 border-l border-[--border] ml-2">
                        <Field.Switch
                            side="right"
                            label={t("settings.server.hideAnimeSpoilerThumbnails")}
                            name="hideAnimeSpoilerThumbnails"
                        />

                        <Field.Switch
                            side="right"
                            label={t("settings.server.hideAnimeSpoilerTitles")}
                            name="hideAnimeSpoilerTitles"
                        />

                        <Field.Switch
                            side="right"
                            label={t("settings.server.hideAnimeSpoilerDescriptions")}
                            name="hideAnimeSpoilerDescriptions"
                        />

                        <Field.Switch
                            side="right"
                            label={t("settings.server.hideAnimeSpoilerSkipNextEpisode")}
                            help={t("settings.server.hideAnimeSpoilerSkipNextEpisodeHelp")}
                            name="hideAnimeSpoilerSkipNextEpisode"
                        />
                    </div>
                )}

                <Field.Switch
                    side="right"
                    name="hideAudienceScore"
                    label={t("settings.server.hideAudienceScore")}
                    help={t("settings.server.hideAudienceScoreHelp")}
                    icon={<LuStarOff className="" />}
                />


                <Field.Switch
                    side="right"
                    name="enableAdultContent"
                    label={t("settings.server.enableAdultContent")}
                    help={t("settings.server.enableAdultContentHelp")}
                    icon={<TbRating18Plus className="" />}
                />
                {f.watch("enableAdultContent") && <div className="space-y-1 pl-4 border-l border-[--border] ml-2">
                    <Field.Switch
                        side="right"
                        name="blurAdultContent"
                        label="Blur adult content"
                        fieldClass={cn(
                            !f.watch("enableAdultContent") && "opacity-50",
                        )}
                    />
                </div>}

                <Field.Switch
                    side="right"
                    name="blurAdultContent"
                    label={t("settings.server.blurAdultContent")}
                    help={t("settings.server.blurAdultContentHelp")}
                    fieldClass={cn(
                        !f.watch("enableAdultContent") && "opacity-50",
                    )}
                />

                <Separator />

                <div data-settings-enable-extension-secure-mode>
                    <Field.Switch
                        side="right"
                        name="enableExtensionSecureMode"
                        label={t("settings.server.enableExtensionSecureMode")}
                        help={t("settings.server.enableExtensionSecureModeHelp")}
                        icon={<LuShield className="" />}
                    />
                </div>


            </SettingsCard>

            <SettingsCard
                title={t("settings.common.localData")}
                description={t("settings.server.localDataDescription")}
            >
                <div className={cn(serverStatus?.user?.isSimulated && "opacity-50 pointer-events-none")}>
                    <Field.Switch
                        side="right"
                        name="autoSyncToLocalAccount"
                        label={t("settings.server.autoBackupListsFromAniList")}
                        help={t("settings.server.autoBackupListsFromAniListHelp")}
                        icon={<LuUserPen className="" />}
                    />
                </div>
                <Separator />
                <Button
                    size="sm"
                    intent="primary-subtle"
                    loading={isUploading}
                    leftIcon={<LuCloudUpload className="size-4" />}
                    onClick={() => {
                        confirmDialog.open()
                    }}
                    disabled={serverStatus?.user?.isSimulated}
                >
                    {t("settings.server.uploadLocalListsToAniList")}
                </Button>
            </SettingsCard>

            <ConfirmationDialog {...confirmDialog} />

            <SettingsCard title={t("settings.common.offlineMode")} description={t("settings.server.offlineModeDescription")}>

                <Field.Switch
                    side="right"
                    name="autoSyncOfflineLocalData"
                    label={t("settings.server.downloadMetadataAutomaticallyForOfflineUse")}
                    help={t("settings.server.downloadMetadataAutomaticallyForOfflineUseHelp")}
                    moreHelp={t("settings.server.downloadMetadataAutomaticallyForOfflineUseMoreHelp")}
                    icon={<MdDownloading className="" />}
                />

                <Field.Switch
                    side="right"
                    name="autoSaveCurrentMediaOffline"
                    label={t("settings.server.saveCurrentMediaOffline")}
                    help={t("settings.server.saveCurrentMediaOfflineHelp")}
                    icon={<TbChecklist className="" />}
                />

            </SettingsCard>

            <SettingsCard title={t("settings.common.keyboardShortcuts")}>
                <div className="space-y-4">
                    {[
                        {
                            label: t("settings.server.openCommandPalette"),
                            value: "meta+j",
                            altValue: "q",
                        },
                    ].map(item => {
                        return (
                            <div className="flex gap-2 items-center" key={item.label}>
                                <label className="text-[--gray]">
                                    <span className="font-semibold">{item.label}</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                    <Button
                                        onKeyDownCapture={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()

                                            const specialKeys = ["Control", "Shift", "Meta", "Command", "Alt", "Option"]
                                            if (!specialKeys.includes(e.key)) {
                                                const keyStr = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.altKey
                                                    ? "alt+"
                                                    : ""}${e.shiftKey ? "shift+" : ""}${e.key.toLowerCase()
                                                    .replace("arrow", "")
                                                    .replace("insert", "ins")
                                                    .replace("delete", "del")
                                                    .replace(" ", "space")
                                                    .replace("+", "plus")}`

                                                // Update the first shortcut
                                                setShortcuts(prev => [keyStr, prev[1]])
                                            }
                                        }}
                                        className="focus:ring-2 focus:ring-[--brand] focus:ring-offset-1"
                                        size="sm"
                                        intent="white-subtle"
                                    >
                                        {shortcuts[0]}
                                    </Button>
                                    <span className="text-[--muted]">{t("common.words.or")}</span>
                                    <Button
                                        onKeyDownCapture={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()

                                            const specialKeys = ["Control", "Shift", "Meta", "Command", "Alt", "Option"]
                                            if (!specialKeys.includes(e.key)) {
                                                const keyStr = `${e.metaKey ? "meta+" : ""}${e.ctrlKey ? "ctrl+" : ""}${e.altKey
                                                    ? "alt+"
                                                    : ""}${e.shiftKey ? "shift+" : ""}${e.key.toLowerCase()
                                                    .replace("arrow", "")
                                                    .replace("insert", "ins")
                                                    .replace("delete", "del")
                                                    .replace(" ", "space")
                                                    .replace("+", "plus")}`

                                                // Update the second shortcut
                                                setShortcuts(prev => [prev[0], keyStr])
                                            }
                                        }}
                                        className="focus:ring-2 focus:ring-[--brand] focus:ring-offset-1"
                                        size="sm"
                                        intent="white-subtle"
                                    >
                                        {shortcuts[1]}
                                    </Button>
                                </div>
                                {(shortcuts[0] !== "meta+j" || shortcuts[1] !== "q") && (
                                    <Button
                                        onClick={() => {
                                            setShortcuts(["meta+j", "q"])
                                        }}
                                        className="rounded-full"
                                        size="sm"
                                        intent="white-basic"
                                        leftIcon={<FaRedo />}
                                    >
                                        {t("common.buttons.reset")}
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </SettingsCard>

            <SettingsCard title={t("settings.common.app")}>
                {/*<Separator />*/}
                <Field.Switch
                    side="right"
                    name="openWebURLOnStart"
                    label={t("settings.server.openLocalhostWebUrlOnStartup")}
                    icon={<TbBrowserShare className="" />}
                />
                <Field.Switch
                    side="right"
                    name="disableNotifications"
                    label={t("settings.server.disableSystemNotifications")}
                    moreHelp={t("settings.server.disableSystemNotificationsMoreHelp")}
                    icon={<TbAlertSquareRoundedOff className="" />}
                />
                <Field.Switch
                    side="right"
                    name="disableCacheLayer"
                    label={t("settings.server.disableAniListCaching")}
                    help={t("settings.server.disableAniListCachingHelp")}
                    moreHelp={t("settings.server.disableAniListCachingMoreHelp")}
                    icon={<LuDatabaseBackup className="" />}
                />
                {!f.watch("disableCacheLayer") && (
                    <div className="space-y-1 pl-4 border-l border-[--border] ml-2">
                        <Switch
                            value={!isApiWorking}
                            onValueChange={v => toggleCacheLayer()}
                            disabled={isTogglingCacheLayer}
                            label={t("settings.server.useCacheOnlyMode")}
                            moreHelp={t("settings.server.useCacheOnlyModeHelp")}
                        />
                    </div>
                )}
                <Separator />
                <Field.Switch
                    side="right"
                    name="useFallbackMetadataProvider"
                    label={t("settings.server.useFallbackMetadataProvider")}
                    help={t("settings.server.useFallbackMetadataProviderHelp")}
                    icon={<LuImages className="" />}
                />
                {/*<Separator />*/}
                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="disableAutoDownloaderNotifications"*/}
                {/*    label="Disable Auto Downloader system notifications"*/}
                {/*/>*/}
                {/*/!*<Separator />*!/*/}
                {/*<Field.Switch*/}
                {/*    side="right"*/}
                {/*    name="disableAutoScannerNotifications"*/}
                {/*    label="Disable Auto Scanner system notifications"*/}
                {/*/>*/}
                <Separator />
                <Field.Switch
                    side="right"
                    name="disableUpdateCheck"
                    label={__isElectronDesktop__ ? t("settings.server.doNotFetchUpdateNotes") : t("settings.server.doNotCheckForUpdates")}
                    help={__isElectronDesktop__ ? (<span className="flex gap-2 items-center">
                        <LuCircleAlert className="size-4 text-[--blue]" />
                        <span>{t("settings.server.doNotFetchUpdateNotesHelp")}</span>
                    </span>) : t("settings.server.doNotCheckForUpdatesHelp")}
                    moreHelp={__isElectronDesktop__ ? t("settings.server.doNotFetchUpdateNotesMoreHelp") : undefined}
                    icon={<TbDownloadOff className="" />}
                />
                <Field.Select
                    label={t("settings.server.updateChannelExperimental")}
                    name="updateChannel"
                    help={__isElectronDesktop__ ? t("settings.server.updateChannelHelp") : ""}
                    options={[
                        { label: t("settings.server.updateChannels.github"), value: "github" },
                    ]}
                />
                <Alert intent="info" description={t("settings.server.usingForkReleaseChannel")} />
            </SettingsCard>

            {/*<Accordion*/}
            {/*    type="single"*/}
            {/*    collapsible*/}
            {/*    className="border rounded-[--radius-md]"*/}
            {/*    triggerClass="dark:bg-[--paper]"*/}
            {/*    contentClass="!pt-2 dark:bg-[--paper]"*/}
            {/*>*/}
            {/*    <AccordionItem value="more">*/}
            {/*        <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">*/}
            {/*            Advanced*/}
            {/*        </AccordionTrigger>*/}
            {/*        <AccordionContent className="pt-6 flex flex-col md:flex-row gap-3">*/}
            {/*            */}
            {/*        </AccordionContent>*/}
            {/*    </AccordionItem>*/}
            {/*</Accordion>*/}


            <SettingsSubmitButton isPending={isPending} />

        </div>
    )
}

const cardCheckboxStyles = {
    itemContainerClass: cn(
        "block border border-[--border] cursor-pointer transition overflow-hidden w-full",
        "bg-gray-50 hover:bg-[--subtle] dark:bg-gray-950 border-dashed",
        "data-[checked=false]:opacity-30",
        "data-[checked=true]:bg-white dark:data-[checked=true]:bg-gray-950",
        "focus:ring-2 ring-brand-100 dark:ring-brand-900 ring-offset-1 ring-offset-[--background] focus-within:ring-2 transition",
        "data-[checked=true]:border data-[checked=true]:ring-offset-0",
    ),
    itemClass: cn(
        "hidden",
    ),
    // itemLabelClass: cn(
    //     "border-transparent border data-[checked=true]:border-brand dark:bg-transparent dark:data-[state=unchecked]:bg-transparent",
    //     "data-[state=unchecked]:bg-transparent data-[state=unchecked]:hover:bg-transparent dark:data-[state=unchecked]:hover:bg-transparent",
    //     "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
    // ),
    // itemLabelClass: "font-medium flex flex-col items-center data-[state=checked]:text-[--brand] cursor-pointer",
    stackClass: "flex md:flex-row flex-col space-y-0 gap-4",
}
