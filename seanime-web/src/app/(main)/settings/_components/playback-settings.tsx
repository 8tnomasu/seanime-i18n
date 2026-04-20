import {
    ElectronPlaybackMethod,
    PlaybackDownloadedMedia,
    PlaybackTorrentStreaming,
    useCurrentDevicePlaybackSettings,
    useExternalPlayerLink,
} from "@/app/(main)/_atoms/playback.atoms"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { useMediastreamActiveOnDevice } from "@/app/(main)/mediastream/_lib/mediastream.atoms"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { __settings_tabAtom } from "@/app/(main)/settings/_components/settings-page.atoms"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { Switch } from "@/components/ui/switch"
import { __isElectronDesktop__ } from "@/types/constants"
import { useSetAtom } from "jotai"
import React from "react"
import { useTranslation } from "react-i18next"
import { BiDesktop } from "react-icons/bi"
import { LuCirclePlay, LuClapperboard, LuExternalLink, LuLaptop } from "react-icons/lu"
import { MdOutlineBroadcastOnHome } from "react-icons/md"
import { RiSettings3Fill } from "react-icons/ri"
import { toast } from "sonner"

type PlaybackSettingsProps = {
    children?: React.ReactNode
}

export function PlaybackSettings(props: PlaybackSettingsProps) {
    const { t } = useTranslation()

    const {
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()

    const {
        downloadedMediaPlayback,
        setDownloadedMediaPlayback,
        torrentStreamingPlayback,
        setTorrentStreamingPlayback,
        electronPlaybackMethod,
        setElectronPlaybackMethod,
    } = useCurrentDevicePlaybackSettings()

    const { activeOnDevice, setActiveOnDevice } = useMediastreamActiveOnDevice()
    const { externalPlayerLink } = useExternalPlayerLink()
    const setTab = useSetAtom(__settings_tabAtom)

    const usingNativePlayer = __isElectronDesktop__ && electronPlaybackMethod === ElectronPlaybackMethod.NativePlayer

    const notifyUpdated = React.useCallback(() => {
        toast.success(t("toasts.settings.playbackSettingsUpdated"))
    }, [t])

    return (
        <>
            <div className="space-y-4">
                <SettingsPageHeader
                    title={t("settings.pages.playback.title")}
                    description={t("settings.pages.playback.description")}
                    icon={LuCirclePlay}
                />

                <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                    <BiDesktop className="text-lg text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{t("settings.playback.deviceLabel")}:</span>
                    <span className="font-medium">{serverStatus?.clientDevice || "-"}</span>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium">{serverStatus?.clientPlatform || "-"}</span>
                </div>
            </div>

            {(!externalPlayerLink && (downloadedMediaPlayback === PlaybackDownloadedMedia.ExternalPlayerLink || torrentStreamingPlayback === PlaybackTorrentStreaming.ExternalPlayerLink)) && (
                <Alert
                    intent="alert-basic"
                    description={
                        <div className="flex items-center justify-between gap-3">
                            <span>{t("settings.playback.noExternalPlayerScheme")}</span>
                            <Button
                                intent="gray-outline"
                                size="sm"
                                onClick={() => setTab("external-player-link")}
                            >
                                {t("common.buttons.add")}
                            </Button>
                        </div>
                    }
                />
            )}

            {__isElectronDesktop__ && (
                <SettingsCard
                    title={t("settings.common.seanimeDenshi")}
                    className="border-2 border-dashed dark:border-gray-700 bg-gradient-to-r from-indigo-50/50 to-pink-50/50 dark:from-gray-900/20 dark:to-gray-900/20"
                >
                    <div className="space-y-4">

                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/20 border border-indigo-500/20">
                                <LuClapperboard className="text-2xl text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <Switch
                                    label={t("settings.playback.useBuiltInPlayer")}
                                    help={t("settings.playback.useBuiltInPlayerHelp")}
                                    value={electronPlaybackMethod === ElectronPlaybackMethod.NativePlayer}
                                    onValueChange={v => {
                                        setElectronPlaybackMethod(v ? ElectronPlaybackMethod.NativePlayer : ElectronPlaybackMethod.Default)
                                        notifyUpdated()
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            )}

            <SettingsCard
                title={t("settings.playback.downloadedMediaTitle")}
                description={t("settings.playback.downloadedMediaDescription")}
                className={cn(
                    "transition-all duration-200",
                    usingNativePlayer && "opacity-50",
                )}
            >
                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                downloadedMediaPlayback === PlaybackDownloadedMedia.Default && !activeOnDevice
                                    ? "border-[--brand] bg-brand-900/10"
                                    : "border-gray-700 hover:border-gray-600",
                            )}
                            onClick={() => {
                                setDownloadedMediaPlayback(PlaybackDownloadedMedia.Default)
                                setActiveOnDevice(false)
                                notifyUpdated()
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <LuLaptop className="text-xl text-brand-600 dark:text-brand-400 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="font-medium">{t("settings.pages.mediaPlayer.title")}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t("settings.playback.desktopMediaPlayerDescription")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                downloadedMediaPlayback === PlaybackDownloadedMedia.Default && activeOnDevice
                                    ? "border-[--brand] bg-brand-900/10"
                                    : "border-gray-700 hover:border-gray-600",
                                !serverStatus?.mediastreamSettings?.transcodeEnabled && "opacity-50",
                            )}
                            onClick={() => {
                                if (serverStatus?.mediastreamSettings?.transcodeEnabled) {
                                    setDownloadedMediaPlayback(PlaybackDownloadedMedia.Default)
                                    setActiveOnDevice(true)
                                    notifyUpdated()
                                }
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <MdOutlineBroadcastOnHome className="text-xl text-brand-600 dark:text-brand-400 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="font-medium">{t("settings.pages.mediastream.title")}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {serverStatus?.mediastreamSettings?.transcodeEnabled
                                                ? t("settings.playback.transcodingEnabledDescription")
                                                : t("settings.playback.transcodingNotEnabled")
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                downloadedMediaPlayback === PlaybackDownloadedMedia.ExternalPlayerLink
                                    ? "border-[--brand] bg-brand-900/10"
                                    : "border-gray-700 hover:border-gray-600",
                            )}
                            onClick={() => {
                                setDownloadedMediaPlayback(PlaybackDownloadedMedia.ExternalPlayerLink)
                                notifyUpdated()
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <LuExternalLink className="text-xl text-brand-600 dark:text-brand-400 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="font-medium">{t("settings.pages.externalPlayerLink.title")}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t("settings.playback.externalPlayerLinkDescription")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title={t("settings.playback.torrentAndDebridStreamingTitle")}
                description={t("settings.playback.torrentAndDebridStreamingDescription")}
                className={cn(
                    "transition-all duration-200",
                    usingNativePlayer && "opacity-50",
                )}
            >
                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                torrentStreamingPlayback === PlaybackTorrentStreaming.Default
                                    ? "border-[--brand] bg-brand-900/10"
                                    : "border-gray-700 hover:border-gray-600",
                            )}
                            onClick={() => {
                                setTorrentStreamingPlayback(PlaybackTorrentStreaming.Default)
                                notifyUpdated()
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <LuLaptop className="text-xl text-brand-600 dark:text-brand-400 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="font-medium">{t("settings.pages.mediaPlayer.title")}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t("settings.playback.desktopMediaPlayerStreamsDescription")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-lg border cursor-pointer transition-all",
                                torrentStreamingPlayback === PlaybackTorrentStreaming.ExternalPlayerLink
                                    ? "border-[--brand] bg-brand-900/10"
                                    : "border-gray-700 hover:border-gray-600",
                            )}
                            onClick={() => {
                                setTorrentStreamingPlayback(PlaybackTorrentStreaming.ExternalPlayerLink)
                                notifyUpdated()
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <LuExternalLink className="text-xl text-brand-600 dark:text-brand-400 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <p className="font-medium">{t("settings.pages.externalPlayerLink.title")}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{t("settings.playback.externalPlayerLinkDescription")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-800 border-dashed">
                <RiSettings3Fill className="text-base" />
                <span>{t("settings.common.savedAutomatically")}</span>
            </div>

        </>
    )
}
