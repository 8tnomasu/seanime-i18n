import { useSaveMediaPlayerSettings } from "@/api/hooks/settings.hooks"
import { vc_subtitleManager } from "@/app/(main)/_features/video-core/video-core"
import { vc_mediaCaptionsManager } from "@/app/(main)/_features/video-core/video-core"
import { vc_audioManager } from "@/app/(main)/_features/video-core/video-core"
import { VideoCoreChapterCue } from "@/app/(main)/_features/video-core/video-core"
import { vc_isMuted } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_volume } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_isFullscreen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_containerElement } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_fullscreenManager } from "@/app/(main)/_features/video-core/video-core-fullscreen"
import { useVideoCoreInSight } from "@/app/(main)/_features/video-core/video-core-in-sight"
import { useVideoCoreOverlayFeedback } from "@/app/(main)/_features/video-core/video-core-overlay-display"
import { vc_pip } from "@/app/(main)/_features/video-core/video-core-pip"
import { vc_pipManager } from "@/app/(main)/_features/video-core/video-core-pip"
import { useVideoCorePlaylist } from "@/app/(main)/_features/video-core/video-core-playlist"
import {
    vc_defaultKeybindings,
    vc_initialSettings,
    vc_keybindingsAtom,
    vc_settings,
    vc_showStatsForNerdsAtom,
    vc_storedMutedAtom,
    vc_storedVolumeAtom,
    vc_useLibassRendererAtom,
    VideoCoreKeybindings,
} from "@/app/(main)/_features/video-core/video-core.atoms"
import { vc_dispatchAction } from "@/app/(main)/_features/video-core/video-core.utils"
import { AlphaBadge } from "@/components/shared/beta-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import { NumberInput } from "@/components/ui/number-input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TextInput } from "@/components/ui/text-input"
import { logger } from "@/lib/helpers/debug"
import { atom, useAtom, useAtomValue } from "jotai"
import { useSetAtom } from "jotai/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerStatus } from "../../_hooks/use-server-status"
import { useVideoCoreScreenshot } from "./video-core-screenshot"

export const videoCorePreferencesModalAtom = atom(false)

const tabsRootClass = cn("w-full contents space-y-4")

const tabsTriggerClass = cn(
    "text-base px-6 rounded-[--radius-md] w-fit border-none data-[state=active]:bg-[--subtle] data-[state=active]:text-white dark:hover:text-white",
    "h-10 lg:justify-center px-3 flex-1",
)

const tabsListClass = cn(
    "w-full flex flex-row lg:flex-row flex-wrap h-fit !mt-4",
)

const tabContentClass = cn(
    "space-y-4 animate-in fade-in-0 duration-300",
)

const translationSettingsSchema = defineSchema(({ z, presets }) => z.object({
    vcTranslate: z.boolean().default(false),
    vcTranslateProvider: z.string().default("google"),
    vcTranslateTargetLanguage: z.string().default("en"),
    vcTranslateApiKey: z.string().default(""),
}))

const TRANSLATION_TARGET_LANGUAGE_OPTIONS = [
    { value: "en-US", labelKey: "player.preferences.translation.languages.enUS" },
    { value: "en-GB", labelKey: "player.preferences.translation.languages.enGB" },
    { value: "es", labelKey: "player.preferences.translation.languages.es" },
    { value: "fr", labelKey: "player.preferences.translation.languages.fr" },
    { value: "de", labelKey: "player.preferences.translation.languages.de" },
    { value: "it", labelKey: "player.preferences.translation.languages.it" },
    { value: "pt-BR", labelKey: "player.preferences.translation.languages.ptBR" },
    { value: "pt-PT", labelKey: "player.preferences.translation.languages.ptPT" },
    { value: "ru", labelKey: "player.preferences.translation.languages.ru" },
    { value: "ja", labelKey: "player.preferences.translation.languages.ja" },
    { value: "ko", labelKey: "player.preferences.translation.languages.ko" },
    { value: "zh-hans", labelKey: "player.preferences.translation.languages.zhHans" },
    { value: "zh-hant", labelKey: "player.preferences.translation.languages.zhHant" },
    { value: "ar", labelKey: "player.preferences.translation.languages.ar" },
    { value: "tr", labelKey: "player.preferences.translation.languages.tr" },
    { value: "pl", labelKey: "player.preferences.translation.languages.pl" },
    { value: "nl", labelKey: "player.preferences.translation.languages.nl" },
    { value: "sv", labelKey: "player.preferences.translation.languages.sv" },
    { value: "nb", labelKey: "player.preferences.translation.languages.nb" },
    { value: "da", labelKey: "player.preferences.translation.languages.da" },
    { value: "fi", labelKey: "player.preferences.translation.languages.fi" },
    { value: "el", labelKey: "player.preferences.translation.languages.el" },
    { value: "cs", labelKey: "player.preferences.translation.languages.cs" },
    { value: "hu", labelKey: "player.preferences.translation.languages.hu" },
    { value: "ro", labelKey: "player.preferences.translation.languages.ro" },
    { value: "id", labelKey: "player.preferences.translation.languages.id" },
    { value: "uk", labelKey: "player.preferences.translation.languages.uk" },
    { value: "bg", labelKey: "player.preferences.translation.languages.bg" },
    { value: "sk", labelKey: "player.preferences.translation.languages.sk" },
    { value: "sl", labelKey: "player.preferences.translation.languages.sl" },
    { value: "et", labelKey: "player.preferences.translation.languages.et" },
    { value: "lv", labelKey: "player.preferences.translation.languages.lv" },
    { value: "lt", labelKey: "player.preferences.translation.languages.lt" },
    { value: "hi", labelKey: "player.preferences.translation.languages.hi" },
    { value: "bn", labelKey: "player.preferences.translation.languages.bn" },
    { value: "ta", labelKey: "player.preferences.translation.languages.ta" },
    { value: "te", labelKey: "player.preferences.translation.languages.te" },
    { value: "mr", labelKey: "player.preferences.translation.languages.mr" },
    { value: "kn", labelKey: "player.preferences.translation.languages.kn" },
    { value: "ml", labelKey: "player.preferences.translation.languages.ml" },
    { value: "pa", labelKey: "player.preferences.translation.languages.pa" },
    { value: "fa", labelKey: "player.preferences.translation.languages.fa" },
    { value: "ur", labelKey: "player.preferences.translation.languages.ur" },
    { value: "sw", labelKey: "player.preferences.translation.languages.sw" },
    { value: "af", labelKey: "player.preferences.translation.languages.af" },
    { value: "ms", labelKey: "player.preferences.translation.languages.ms" },
    { value: "hr", labelKey: "player.preferences.translation.languages.hr" },
    { value: "sr", labelKey: "player.preferences.translation.languages.sr" },
    { value: "he", labelKey: "player.preferences.translation.languages.he" },
    { value: "th", labelKey: "player.preferences.translation.languages.th" },
    { value: "vi", labelKey: "player.preferences.translation.languages.vi" },
]

const KeybindingValueInput = ({
    actionKey,
    value,
    onValueChange,
}: {
    actionKey: keyof VideoCoreKeybindings
    value: number
    onValueChange: (value: number) => void
}) => {
    return (
        <NumberInput
            value={value}
            onValueChange={onValueChange}
            size="sm"
            fieldClass="w-16"
            hideControls
            min={0}
            step={actionKey.includes("Speed") ? 0.25 : 1}
            // onKeyDown={(e) => e.stopPropagation()}
            // onInput={(e) => e.stopPropagation()}
        />
    )
}

const KeybindingRow = ({
    action,
    description,
    actionKey,
    hasValue = false,
    valueLabel = "",
    editedKeybindings,
    setEditedKeybindings,
    recordingKey,
    handleKeyRecord,
    formatKeyDisplay = (actionKey: keyof VideoCoreKeybindings) => actionKey,
}: {
    action: string
    description: string
    actionKey: keyof VideoCoreKeybindings
    hasValue?: boolean
    valueLabel?: string
    editedKeybindings: VideoCoreKeybindings
    setEditedKeybindings: React.Dispatch<React.SetStateAction<VideoCoreKeybindings>>
    recordingKey: string | null
    handleKeyRecord: (actionKey: keyof VideoCoreKeybindings) => void
    formatKeyDisplay?: (actionKey: keyof VideoCoreKeybindings) => keyof VideoCoreKeybindings | string
}) => {
    const { t } = useTranslation()

    return (
        <div className="flex items-center justify-between py-2 border rounded-lg px-3 bg-[--paper]">
            <div className="flex-1">
                <div className="font-medium text-sm">{action}</div>
                {hasValue && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{valueLabel}:</span>
                        <KeybindingValueInput
                            actionKey={actionKey}
                            value={("value" in editedKeybindings[actionKey]) ? (editedKeybindings[actionKey] as any).value : 0}
                            onValueChange={(value) => {
                                setEditedKeybindings(prev => ({
                                    ...prev,
                                    [actionKey]: { ...prev[actionKey], value: value || 0 },
                                }))
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    intent={recordingKey === actionKey ? "white-subtle" : "gray-glass"}
                    size="sm"
                    onClick={() => handleKeyRecord(actionKey)}
                    className={cn(
                        "h-8 px-3 text-lg font-mono",
                        recordingKey === actionKey && "!text-xs text-white",
                    )}
                >
                    {recordingKey === actionKey ? t("player.preferences.keybindings.pressKey") : formatKeyDisplay(editedKeybindings?.[actionKey]?.key as any ?? "" as any)}
                </Button>
            </div>
        </div>
    )
}

export function VideoCorePreferencesModal({ isWebPlayer }: { isWebPlayer: boolean }) {
    const { t } = useTranslation()
    const isFullscreen = useAtomValue(vc_isFullscreen)
    const containerElement = useAtomValue(vc_containerElement)
    const [open, setOpen] = useAtom(videoCorePreferencesModalAtom)
    const [keybindings, setKeybindings] = useAtom(vc_keybindingsAtom)
    const [editedKeybindings, setEditedKeybindings] = useState<VideoCoreKeybindings>(keybindings)
    const [useLibassRenderer, setUseLibassRenderer] = useAtom(vc_useLibassRendererAtom)
    const [editedUseLibassRenderer, setEditedUseLibassRenderer] = useState(useLibassRenderer)

    const [recordingKey, setRecordingKey] = useState<string | null>(null)

    const [tab, setTab] = useState("keybinds")
    const { mutate: saveMediaPlayerSettings } = useSaveMediaPlayerSettings()
    const serverStatus = useServerStatus()
    const translationFormRef = useRef<UseFormReturn<any>>(null)

    const [settings, setSettings] = useAtom(vc_settings)
    const [editedSubLanguage, setEditedSubLanguage] = useState(settings.preferredSubtitleLanguage)
    const [editedAudioLanguage, setEditedAudioLanguage] = useState(settings.preferredAudioLanguage)
    const [editedSubsBlacklist, setEditedSubsBlacklist] = useState(settings.preferredSubtitleBlacklist)
    const [editedSubtitleDelay, setEditedSubtitleDelay] = useState(settings.subtitleDelay ?? 0)
    // const [editedSubCustomization, setEditedSubCustomization] = useState<VideoCoreSettings["subtitleCustomization"]>(
    //     settings.subtitleCustomization || vc_initialSettings.subtitleCustomization
    // )
    const subtitleManager = useAtomValue(vc_subtitleManager)
    const mediaCaptionsManager = useAtomValue(vc_mediaCaptionsManager)

    // Reset edited keybindings and language preferences when modal opens
    useEffect(() => {
        if (open) {
            setEditedKeybindings(keybindings)
            setEditedSubLanguage(settings.preferredSubtitleLanguage)
            setEditedAudioLanguage(settings.preferredAudioLanguage)
            setEditedSubsBlacklist(settings.preferredSubtitleBlacklist)
            setEditedSubtitleDelay(settings.subtitleDelay ?? 0)
            setEditedUseLibassRenderer(useLibassRenderer)
            // setEditedSubCustomization(settings.subtitleCustomization || vc_initialSettings.subtitleCustomization)
        }
    }, [open, keybindings, settings, useLibassRenderer])

    const handleKeyRecord = (actionKey: keyof VideoCoreKeybindings) => {
        setRecordingKey(actionKey)

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            setEditedKeybindings(prev => ({
                ...prev,
                [actionKey]: {
                    ...prev[actionKey],
                    key: e.code,
                },
            }))

            setRecordingKey(null)
            document.removeEventListener("keydown", handleKeyDown, true)
        }

        document.addEventListener("keydown", handleKeyDown, true)
    }

    const handleSave = () => {
        setKeybindings(editedKeybindings)
        const newSettings = {
            ...settings,
            preferredSubtitleLanguage: editedSubLanguage,
            preferredAudioLanguage: editedAudioLanguage,
            preferredSubtitleBlacklist: editedSubsBlacklist,
            subtitleDelay: editedSubtitleDelay,
            // subtitleCustomization: editedSubCustomization,
        }
        setSettings(newSettings)
        setUseLibassRenderer(editedUseLibassRenderer)
        // Update subtitle manager with new settings
        subtitleManager?.updateSettings(newSettings)
        mediaCaptionsManager?.updateSettings(newSettings)
        setOpen(false)
    }

    const handleReset = () => {
        setEditedKeybindings(vc_defaultKeybindings)
        setEditedSubLanguage(vc_initialSettings.preferredSubtitleLanguage)
        setEditedAudioLanguage(vc_initialSettings.preferredAudioLanguage)
        setEditedSubsBlacklist(vc_initialSettings.preferredSubtitleBlacklist)
        setEditedSubtitleDelay(vc_initialSettings.subtitleDelay)
        setEditedUseLibassRenderer(true)
        // setEditedSubCustomization(vc_initialSettings.subtitleCustomization)
    }

    const formatKeyDisplay = (keyCode: string) => {
        const keyMap: Record<string, string> = {
            "KeyA": "A", "KeyB": "B", "KeyC": "C", "KeyD": "D", "KeyE": "E", "KeyF": "F",
            "KeyG": "G", "KeyH": "H", "KeyI": "I", "KeyJ": "J", "KeyK": "K", "KeyL": "L",
            "KeyM": "M", "KeyN": "N", "KeyO": "O", "KeyP": "P", "KeyQ": "Q", "KeyR": "R",
            "KeyS": "S", "KeyT": "T", "KeyU": "U", "KeyV": "V", "KeyW": "W", "KeyX": "X",
            "KeyY": "Y", "KeyZ": "Z",
            "ArrowUp": "↑", "ArrowDown": "↓", "ArrowLeft": "←", "ArrowRight": "→",
            "BracketLeft": "[", "BracketRight": "]",
            "Space": "⎵",
        }
        return keyMap[keyCode] || keyCode
    }

    function handleSaveTranslationSettings(data: z.infer<typeof translationSettingsSchema>) {
        const currentMediaPlayer = serverStatus?.settings?.mediaPlayer!

        saveMediaPlayerSettings({
            mediaPlayer: {
                ...currentMediaPlayer,
                vcTranslate: data.vcTranslate,
                vcTranslateTargetLanguage: data.vcTranslateTargetLanguage.toLowerCase(),
                vcTranslateProvider: data.vcTranslateProvider,
                vcTranslateApiKey: data.vcTranslateApiKey,
            },
        }, {
            onSuccess: () => {
                toast.success(t("player.toasts.translationSettingsSaved"))
                translationFormRef.current?.reset(translationFormRef.current.getValues())

                subtitleManager?.updateShouldTranslate(data.vcTranslate ? data.vcTranslateTargetLanguage : null)
                mediaCaptionsManager?.updateShouldTranslate(data.vcTranslate ? data.vcTranslateTargetLanguage : null)
            },
        })
    }

    return (
        <Modal
            title={t("player.preferences.title")}
            open={open}
            onOpenChange={setOpen}
            contentClass="max-w-5xl focus:outline-none focus-visible:outline-none outline-none bg-[--background] backdrop-blur-sm z-[101]"
            overlayClass="z-[150] bg-black/50"
            portalContainer={isFullscreen ? containerElement || undefined : undefined}
        >

            <Tabs
                value={tab}
                onValueChange={setTab}
                className={tabsRootClass}
                triggerClass={tabsTriggerClass}
                listClass={tabsListClass}
            >
                <TabsList className="flex-wrap max-w-full bg-[--paper] p-2 border rounded-xl">
                    <TabsTrigger value="keybinds">{t("player.preferences.tabs.keyboardShortcuts")}</TabsTrigger>
                    <TabsTrigger value="subtitles">{t("player.preferences.tabs.subtitlesAudio")}</TabsTrigger>
                    <TabsTrigger value="translation">{t("player.preferences.tabs.translation")} <AlphaBadge /></TabsTrigger>
                    {/*<TabsTrigger value="browser-client">Rendering</TabsTrigger>*/}
                </TabsList>

                <TabsContent value="keybinds" className={tabContentClass}>
                    <div className="space-y-3 hidden lg:block">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                                {/* <h3 className="text-lg font-semibold mb-4 text-white">Playback</h3> */}
                                <div className="space-y-3">
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.seekForwardFine")}
                                        description={t("player.preferences.keybindings.seekForwardFineDescription")}
                                        actionKey="seekForwardFine"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.seconds")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.seekBackwardFine")}
                                        description={t("player.preferences.keybindings.seekBackwardFineDescription")}
                                        actionKey="seekBackwardFine"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.seconds")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.seekForward")}
                                        description={t("player.preferences.keybindings.seekForwardDescription")}
                                        actionKey="seekForward"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.seconds")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.seekBackward")}
                                        description={t("player.preferences.keybindings.seekBackwardDescription")}
                                        actionKey="seekBackward"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.seconds")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.increaseSpeed")}
                                        description={t("player.preferences.keybindings.increaseSpeedDescription")}
                                        actionKey="increaseSpeed"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.increment")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.decreaseSpeed")}
                                        description={t("player.preferences.keybindings.decreaseSpeedDescription")}
                                        actionKey="decreaseSpeed"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.increment")}
                                    />
                                </div>
                            </div>

                            <div>
                                {/* <h3 className="text-lg font-semibold mb-4 text-white">Navigation</h3> */}
                                <div className="space-y-3">
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.nextChapter")}
                                        description={t("player.preferences.keybindings.nextChapterDescription")}
                                        actionKey="nextChapter"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.previousChapter")}
                                        description={t("player.preferences.keybindings.previousChapterDescription")}
                                        actionKey="previousChapter"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.nextEpisode")}
                                        description={t("player.preferences.keybindings.nextEpisodeDescription")}
                                        actionKey="nextEpisode"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.previousEpisode")}
                                        description={t("player.preferences.keybindings.previousEpisodeDescription")}
                                        actionKey="previousEpisode"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.cycleSubtitles")}
                                        description={t("player.preferences.keybindings.cycleSubtitlesDescription")}
                                        actionKey="cycleSubtitles"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.fullscreen")}
                                        description={t("player.preferences.keybindings.fullscreenDescription")}
                                        actionKey="fullscreen"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.pictureInPicture")}
                                        description={t("player.preferences.keybindings.pictureInPictureDescription")}
                                        actionKey="pictureInPicture"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.takeScreenshot")}
                                        description={t("player.preferences.keybindings.takeScreenshotDescription")}
                                        actionKey="takeScreenshot"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                </div>
                            </div>

                            <div>
                                {/* <h3 className="text-lg font-semibold mb-4 text-white">Audio</h3> */}
                                <div className="space-y-3">
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.volumeUp")}
                                        description={t("player.preferences.keybindings.volumeUpDescription")}
                                        actionKey="volumeUp"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.percent")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.volumeDown")}
                                        description={t("player.preferences.keybindings.volumeDownDescription")}
                                        actionKey="volumeDown"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                        hasValue={true}
                                        valueLabel={t("player.preferences.keybindings.percent")}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.mute")}
                                        description={t("player.preferences.keybindings.muteDescription")}
                                        actionKey="mute"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.cycleAudio")}
                                        description={t("player.preferences.keybindings.cycleAudioDescription")}
                                        actionKey="cycleAudio"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.displayCharacters")}
                                        description={t("player.preferences.keybindings.displayCharactersDescription")}
                                        actionKey="openInSight"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                    <KeybindingRow
                                        action={t("player.preferences.keybindings.statsForNerds")}
                                        description={t("player.preferences.keybindings.statsForNerdsDescription")}
                                        actionKey="statsForNerds"
                                        editedKeybindings={editedKeybindings}
                                        setEditedKeybindings={setEditedKeybindings}
                                        recordingKey={recordingKey}
                                        handleKeyRecord={handleKeyRecord}
                                        formatKeyDisplay={formatKeyDisplay}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6">
                            <Button
                                intent="gray-outline"
                                onClick={handleReset}
                            >
                                {t("player.preferences.actions.resetAll")}
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    intent="gray-outline"
                                    onClick={() => setOpen(false)}
                                >
                                    {t("common.buttons.cancel")}
                                </Button>
                                <Button
                                    intent="primary"
                                    onClick={handleSave}
                                >
                                    {t("common.buttons.save")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="subtitles" className={tabContentClass}>
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">{t("player.preferences.defaults")}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    {t("player.preferences.subtitles.preferredSubtitleLanguage")}
                                </label>
                                <TextInput
                                    value={editedSubLanguage}
                                    onValueChange={setEditedSubLanguage}
                                    placeholder="eng,jpn,spa"
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onInput={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    {t("player.preferences.subtitles.preferredAudioLanguage")}
                                </label>
                                <TextInput
                                    value={editedAudioLanguage}
                                    onValueChange={setEditedAudioLanguage}
                                    placeholder="jpn,eng,kor"
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onInput={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                {t("player.preferences.subtitles.ignoredSubtitleNames")}
                            </label>
                            <TextInput
                                value={editedSubsBlacklist}
                                onValueChange={setEditedSubsBlacklist}
                                placeholder={t("player.preferences.subtitles.ignoredSubtitleNamesPlaceholder")}
                                onKeyDown={(e) => e.stopPropagation()}
                                onInput={(e) => e.stopPropagation()}
                                help={t("player.preferences.subtitles.ignoredSubtitleNamesHelp")}
                            />
                        </div>
                    </div>

                    {isWebPlayer && <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">{t("player.preferences.rendering")}</h3>
                        <div className="space-y-2">
                            <Switch
                                side="right"
                                label={t("player.preferences.subtitles.convertSoftSubsToAss")}
                                value={editedUseLibassRenderer}
                                onValueChange={setEditedUseLibassRenderer}
                                help={t("player.preferences.subtitles.convertSoftSubsToAssHelp")}
                            />
                        </div>
                    </div>}

                    <div className="flex items-center justify-between pt-6">
                        <Button
                            intent="gray-outline"
                            onClick={handleReset}
                        >
                            {t("player.preferences.actions.resetAll")}
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                intent="gray-outline"
                                onClick={() => setOpen(false)}
                            >
                                {t("common.buttons.cancel")}
                            </Button>
                            <Button
                                intent="primary"
                                onClick={handleSave}
                            >
                                {t("common.buttons.save")}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="translation" className={tabContentClass}>
                    <Form
                        schema={translationSettingsSchema}
                        onSubmit={handleSaveTranslationSettings}
                        defaultValues={{
                            vcTranslate: serverStatus?.settings?.mediaPlayer?.vcTranslate ?? false,
                            vcTranslateProvider: serverStatus?.settings?.mediaPlayer?.vcTranslateProvider || "deepl",
                            vcTranslateTargetLanguage: serverStatus?.settings?.mediaPlayer?.vcTranslateTargetLanguage?.toLowerCase() || "en",
                            vcTranslateApiKey: serverStatus?.settings?.mediaPlayer?.vcTranslateApiKey || "",
                        }}
                        stackClass="space-y-4 relative"
                        mRef={translationFormRef}
                    >
                        {(f) => (
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    <Field.Switch
                                        name="vcTranslate"
                                        side="right"
                                        label={t("player.preferences.translation.enableTranslation")}
                                        help={t("player.preferences.translation.enableTranslationHelp")}
                                    />
                                    <div className="space-y-2">
                                        <Field.Select
                                            label={t("player.preferences.translation.provider")}
                                            name="vcTranslateProvider"
                                            options={[
                                                { value: "deepl", label: "DeepL" },
                                                { value: "openai", label: "OpenAI" },
                                            ]}
                                            contentClass="z-[999]"
                                        />
                                    </div>

                                    {f.watch("vcTranslateProvider") === "deepl" && (
                                        <p>
                                            {t("player.preferences.translation.deepLNote")}
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        <Field.Select
                                            label={t("player.preferences.translation.targetLanguage")}
                                            name="vcTranslateTargetLanguage"
                                            options={TRANSLATION_TARGET_LANGUAGE_OPTIONS.map(option => ({
                                                value: option.value,
                                                label: t(option.labelKey),
                                            }))}
                                            contentClass="z-[999]"
                                            help={t("player.preferences.translation.targetLanguageHelp")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Field.Text
                                            label={t("player.preferences.translation.apiKey")}
                                            name="vcTranslateApiKey"
                                            placeholder={t("player.preferences.translation.apiKeyPlaceholder")}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            onInput={(e) => e.stopPropagation()}
                                            type="password"
                                        />
                                    </div>
                                </div>

                                <p className="text-[--muted]">
                                    {t("player.preferences.translation.reloadRequired")}
                                </p>

                                <div className="flex items-center justify-end pt-6">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            intent="gray-outline"
                                            onClick={() => setOpen(false)}
                                        >
                                            {t("common.buttons.cancel")}
                                        </Button>
                                        <Button
                                            type="submit"
                                            intent="primary"
                                        >
                                            {t("common.buttons.save")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                </TabsContent>
            </Tabs>

        </Modal>
    )
}

export function VideoCoreKeybindingController(props: {
    active: boolean
    videoRef: React.RefObject<HTMLVideoElement | null>,
    chapterCues: VideoCoreChapterCue[],
    introEndTime: number | undefined,
    introStartTime: number | undefined
    endingEndTime: number | undefined,
    endingStartTime: number | undefined
}) {
    const {
        active,
        videoRef,
        chapterCues,
        introEndTime,
        introStartTime,
        endingEndTime,
        endingStartTime,
    } = props

    const { t } = useTranslation()
    const [keybindings] = useAtom(vc_keybindingsAtom)
    const isKeybindingsModalOpen = useAtomValue(videoCorePreferencesModalAtom)
    const fullscreen = useAtomValue(vc_isFullscreen)
    const pip = useAtomValue(vc_pip)
    const volume = useAtomValue(vc_volume)
    const setVolume = useSetAtom(vc_storedVolumeAtom)
    const muted = useAtomValue(vc_isMuted)
    const setMuted = useSetAtom(vc_storedMutedAtom)
    const { toggleOpen: toggleInSight } = useVideoCoreInSight()
    const { showOverlayFeedback } = useVideoCoreOverlayFeedback()

    const setShowStats = useSetAtom(vc_showStatsForNerdsAtom)

    const action = useSetAtom(vc_dispatchAction)

    const subtitleManager = useAtomValue(vc_subtitleManager)
    const mediaCaptionsManager = useAtomValue(vc_mediaCaptionsManager)
    const audioManager = useAtomValue(vc_audioManager)
    const fullscreenManager = useAtomValue(vc_fullscreenManager)
    const pipManager = useAtomValue(vc_pipManager)

    const { playEpisode, hasNextEpisode, hasPreviousEpisode } = useVideoCorePlaylist()

    // Rate limiting for seeking operations
    const lastSeekTime = useRef(0)
    const SEEK_THROTTLE_MS = 100 // Minimum time between seek operations

    function seek(seconds: number) {
        const isPaused = videoRef.current?.paused
        if (!isPaused) {
            videoRef.current?.pause()
        }
        action({ type: "seek", payload: { time: seconds, flashTime: true } })
        if (!isPaused) {
            videoRef.current?.play()?.catch()
        }
    }

    function seekTo(to: number) {
        const isPaused = videoRef.current?.paused
        if (!isPaused) {
            videoRef.current?.pause()
        }
        action({ type: "seekTo", payload: { time: to, flashTime: true } })
        if (!isPaused) {
            videoRef.current?.play()?.catch()
        }
    }

    const { takeScreenshot } = useVideoCoreScreenshot()

    //
    // Keyboard shortcuts
    //

    const handleKeyboardShortcuts = useCallback(async (e: KeyboardEvent) => {
        // Don't handle shortcuts if in an input/textarea or while keybindings modal is open
        if (isKeybindingsModalOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return
        }

        // Ignore combinations with modifier keys
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
            return
        }

        if (!videoRef.current || !active) {
            return
        }

        const video = videoRef.current


        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault()
            if (video.paused) {
                await video.play()
                showOverlayFeedback({ message: "PLAY", type: "icon" })
            } else {
                video.pause()
                showOverlayFeedback({ message: "PAUSE", type: "icon" })
            }
            return
        }

        // Home, go to beginning
        if (e.code === "Home") {
            e.preventDefault()
            seekTo(0)
            showOverlayFeedback({ message: t("player.overlay.beginning") })
            return
        }

        // End, go to end
        if (e.code === "End") {
            e.preventDefault()
            seekTo(video.duration)
            showOverlayFeedback({ message: t("player.overlay.end") })
            return
        }

        // Escape - Exit fullscreen
        if (e.code === "Escape" && fullscreen) {
            e.preventDefault()
            fullscreenManager?.exitFullscreen()
            return
        }

        // Number keys 0-9, seek to percentage (0%, 10%, 20%, ..., 90%)
        if (e.code.startsWith("Digit") && e.code.length === 6) {
            e.preventDefault()
            const digit = parseInt(e.code.slice(-1))
            const percentage = digit * 10
            const seekTime = Math.max(0, Math.min(video.duration, (video.duration * percentage) / 100))
            seekTo(seekTime)
            // showOverlayFeedback({ message: `${percentage}%` })
            return
        }

        // frame-by-frame seeking, assuming 24fps
        if (e.code === "Comma") {
            e.preventDefault()
            seek(-1 / 24)
            showOverlayFeedback({ message: t("player.overlay.previousFrame") })
            return
        }

        if (e.code === "Period") {
            e.preventDefault()
            seek(1 / 24)
            showOverlayFeedback({ message: t("player.overlay.nextFrame") })
            return
        }

        // Helper function to check if seeking is rate limited
        const canSeek = () => {
            const now = Date.now()
            if (now - lastSeekTime.current < SEEK_THROTTLE_MS) {
                return false
            }
            lastSeekTime.current = now
            return true
        }

        // Check which shortcut was pressed
        if (e.code === keybindings.seekForward.key) {
            e.preventDefault()
            if (!canSeek()) return

            if (props.introEndTime && props.introStartTime && video.currentTime < props.introEndTime && video.currentTime >= props.introStartTime) {
                seekTo(props.introEndTime)
                showOverlayFeedback({ message: t("player.overlay.skippedOpening") })
                return
            }
            if (props.endingEndTime && props.endingStartTime && video.currentTime < props.endingEndTime && video.currentTime >= props.endingStartTime) {
                seekTo(props.endingEndTime)
                showOverlayFeedback({ message: t("player.overlay.skippedEnding") })
                return
            }
            seek(keybindings.seekForward.value)
            video.dispatchEvent(new Event("seeked"))
        } else if (e.code === keybindings.seekBackward.key) {
            e.preventDefault()
            if (!canSeek()) return
            seek(-keybindings.seekBackward.value)
            video.dispatchEvent(new Event("seeked"))
        } else if (e.code === keybindings.seekForwardFine.key) {
            e.preventDefault()
            // if (!canSeek()) return
            video.dispatchEvent(new Event("seeking"))
            seek(keybindings.seekForwardFine.value)
            video.dispatchEvent(new Event("seeked"))
        } else if (e.code === keybindings.seekBackwardFine.key) {
            e.preventDefault()
            // if (!canSeek()) return
            video.dispatchEvent(new Event("seeking"))
            seek(-keybindings.seekBackwardFine.value)
            video.dispatchEvent(new Event("seeked"))
        } else if (e.code === keybindings.nextChapter.key) {
            e.preventDefault()
            handleNextChapter()
        } else if (e.code === keybindings.previousChapter.key) {
            e.preventDefault()
            handlePreviousChapter()
        } else if (e.code === keybindings.volumeUp.key) {
            e.preventDefault()
            const newVolume = Math.min(1, volume + keybindings.volumeUp.value / 100)
            setVolume(newVolume)
        } else if (e.code === keybindings.volumeDown.key) {
            e.preventDefault()
            const newVolume = Math.max(0, volume - keybindings.volumeDown.value / 100)
            setVolume(newVolume)
        } else if (e.code === keybindings.mute.key) {
            e.preventDefault()
            setMuted(!muted)
        } else if (e.code === keybindings.cycleSubtitles.key) {
            e.preventDefault()
            handleCycleSubtitles()
        } else if (e.code === keybindings.cycleAudio.key) {
            e.preventDefault()
            handleCycleAudio()
        } else if (e.code === keybindings.nextEpisode.key) {
            e.preventDefault()
            handleNextEpisode()
        } else if (e.code === keybindings.previousEpisode.key) {
            e.preventDefault()
            handlePreviousEpisode()
        } else if (e.code === keybindings.fullscreen.key) {
            e.preventDefault()
            handleToggleFullscreen()
        } else if (e.code === keybindings.pictureInPicture.key) {
            e.preventDefault()
            handleTogglePictureInPicture()
        } else if (e.code === keybindings.takeScreenshot.key) {
            e.preventDefault()
            takeScreenshot()
        } else if (e.code === keybindings.openInSight.key) {
            e.preventDefault()
            toggleInSight()
        } else if (e.code === keybindings.statsForNerds.key) {
            e.preventDefault()
            setShowStats(prev => !prev)
        } else if (e.code === keybindings.increaseSpeed.key) {
            e.preventDefault()
            const newRate = Math.min(8, video.playbackRate + keybindings.increaseSpeed.value)
            video.playbackRate = newRate
            showOverlayFeedback({ message: t("player.overlay.speed", { rate: newRate.toFixed(2) }) })
        } else if (e.code === keybindings.decreaseSpeed.key) {
            e.preventDefault()
            const newRate = Math.max(0.20, video.playbackRate - keybindings.decreaseSpeed.value)
            video.playbackRate = newRate
            showOverlayFeedback({ message: t("player.overlay.speed", { rate: newRate.toFixed(2) }) })
        }
        },
        [keybindings, volume, muted, seek, active, fullscreen, pip, showOverlayFeedback, introEndTime, introStartTime, isKeybindingsModalOpen,
            toggleInSight, t])

    // Keyboard shortcut handlers
    const handleNextChapter = useCallback(() => {
        if (!videoRef.current || !chapterCues) return

        const currentTime = videoRef.current.currentTime

        // Sort chapters by start time to ensure proper order
        const sortedChapters = [...chapterCues].sort((a, b) => a.startTime - b.startTime)

        // Find the next chapter (with a small buffer to avoid edge cases)
        const nextChapter = sortedChapters.find(chapter => chapter.startTime > currentTime + 1)
        if (nextChapter) {
            seekTo(nextChapter.startTime)
            // Try to get chapter name from video track cues
            const chapterName = nextChapter.text
            showOverlayFeedback({
                message: chapterName
                    ? t("player.overlay.chapterNamed", { name: chapterName })
                    : t("player.overlay.chapter", { number: sortedChapters.indexOf(nextChapter) + 1 }),
            })
        } else {
            // If no next chapter, go to the end
            const lastChapter = sortedChapters[sortedChapters.length - 1]
            if (lastChapter && lastChapter.endTime) {
                seekTo(lastChapter.endTime)
                showOverlayFeedback({ message: t("player.overlay.endOfChapters") })
            }
        }
    }, [chapterCues, seekTo, showOverlayFeedback, t])

    const handlePreviousChapter = useCallback(() => {
        if (!videoRef.current || !chapterCues) return

        const currentTime = videoRef.current.currentTime

        // Sort chapters by start time to ensure proper order
        const sortedChapters = [...chapterCues].sort((a, b) => a.startTime - b.startTime)

        // Find the current chapter first
        const currentChapterIndex = sortedChapters.findIndex((chapter, index) => {
            const nextChapter = sortedChapters[index + 1]
            return chapter.startTime <= currentTime && (!nextChapter || currentTime < nextChapter.startTime)
        })

        if (currentChapterIndex > 0) {
            // Go to previous chapter
            const previousChapter = sortedChapters[currentChapterIndex - 1]
            seekTo(previousChapter.startTime)
            const chapterName = previousChapter.text
            showOverlayFeedback({
                message: chapterName
                    ? t("player.overlay.chapterNamed", { name: chapterName })
                    : t("player.overlay.chapter", { number: currentChapterIndex }),
            })
        } else if (currentChapterIndex === 0) {
            // Already in first chapter, go to the beginning
            seekTo(0)
            const firstChapter = sortedChapters[0]
            const chapterName = firstChapter.text
            showOverlayFeedback({
                message: chapterName
                    ? t("player.overlay.chapterNamed", { name: chapterName })
                    : t("player.overlay.chapter", { number: 1 }),
            })
        } else {
            // If we can't determine current chapter, just go to the beginning
            seekTo(0)
            showOverlayFeedback({ message: t("player.overlay.beginning") })
        }
    }, [chapterCues, seekTo, showOverlayFeedback, t])


    const handleCycleSubtitles = useCallback(() => {
        if (!videoRef.current) return
        // TODO: make it work when both types are combined
        let found = false
        if (subtitleManager) {
            // Cycle to next track or disable if we're at the end
            const nextTrackNumber = subtitleManager.getNextTrackNumber(subtitleManager.getSelectedTrackNumberOrNull())

            // Enable next track if available
            if (nextTrackNumber > -1) {
                subtitleManager?.selectTrack(nextTrackNumber)
                const trackName = subtitleManager.getTrack(nextTrackNumber)?.label || t("player.overlay.track", { number: nextTrackNumber })
                showOverlayFeedback({ message: t("player.overlay.subtitlesTrack", { trackName }) })
                found = true
            }
        }
        if (mediaCaptionsManager) {
            const currentTrackIdx = mediaCaptionsManager.getSelectedTrackIndexOrNull() ?? -1
            const nextTrackIdx = currentTrackIdx + 1
            const nextTrack = mediaCaptionsManager.getTrack(nextTrackIdx)

            // Enable next track if available
            if (nextTrack) {
                mediaCaptionsManager?.selectTrack(nextTrackIdx)
                const trackName = mediaCaptionsManager.getTrack(nextTrackIdx)?.label || t("player.overlay.track", { number: nextTrackIdx })
                showOverlayFeedback({ message: t("player.overlay.subtitlesTrack", { trackName }) })
                found = true
            }
        }

        if (!found) {
            showOverlayFeedback({ message: t("player.overlay.subtitlesOff") })
            subtitleManager?.setNoTrack()
            mediaCaptionsManager?.setNoTrack()
        }
    }, [subtitleManager, mediaCaptionsManager, showOverlayFeedback, t])

    const handleCycleAudio = useCallback(() => {
        if (!videoRef.current || !audioManager) return

        // HLS stream
        if (audioManager.isHlsStream()) {
            const currentTrackNumber = audioManager.getSelectedTrackNumberOrNull()
            if (currentTrackNumber === null) {
                showOverlayFeedback({ message: t("player.overlay.noAdditionalAudioTracks") })
                return
            }
            const audioTracks = audioManager.getHlsAudioTracks()

            const nextTrackNumber = (currentTrackNumber + 1) % (audioTracks.length)

            const nextTrack = audioTracks.find(n => n.id === nextTrackNumber)
            if (nextTrack) {
                const trackName = nextTrack.name || nextTrack.language || t("player.overlay.track", { number: nextTrack.id + 1 })
                showOverlayFeedback({ message: t("player.overlay.audioTrack", { trackName }) })
                audioManager.selectTrack(nextTrackNumber)
            }

            return
        }

        const audioTracks = videoRef.current.audioTracks
        if (!audioTracks || audioTracks.length <= 1) {
            showOverlayFeedback({ message: t("player.overlay.noAdditionalAudioTracks") })
            return
        }

        // Find currently enabled track
        let currentTrackIndex = -1
        for (let i = 0; i < audioTracks.length; i++) {
            if (audioTracks[i].enabled) {
                currentTrackIndex = i
                break
            }
        }

        // Cycle to next track
        const nextIndex = (currentTrackIndex + 1) % audioTracks.length

        // Disable all tracks first
        for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].enabled = false
        }

        // Enable next track
        audioTracks[nextIndex].enabled = true
        audioManager?.selectTrack(nextIndex)

        const trackName = audioTracks[nextIndex].label || audioTracks[nextIndex].language || t("player.overlay.track", { number: nextIndex + 1 })
        showOverlayFeedback({ message: t("player.overlay.audioTrack", { trackName }) })
    }, [audioManager, showOverlayFeedback, t])

    const log = logger("VideoCoreKeybindings")

    const handleNextEpisode = useCallback(() => {
        if (!hasNextEpisode) {
            showOverlayFeedback({ message: t("player.overlay.noNextEpisode") })
            log.info("No next episode available")
            return
        }

        log.info("Playing next episode")
        playEpisode("next")
    }, [hasNextEpisode, playEpisode, showOverlayFeedback, t])

    const handlePreviousEpisode = useCallback(() => {
        if (!hasPreviousEpisode) {
            showOverlayFeedback({ message: t("player.overlay.noPreviousEpisode") })
            log.info("No previous episode available")
            return
        }

        log.info("Playing previous episode")
        playEpisode("previous")
    }, [hasPreviousEpisode, playEpisode, showOverlayFeedback, t])

    const handleToggleFullscreen = useCallback(() => {
        fullscreenManager?.toggleFullscreen()

        React.startTransition(() => {
            setTimeout(() => {
                videoRef.current?.focus()
            }, 100)
        })
    }, [fullscreenManager])

    const handleTogglePictureInPicture = useCallback(() => {
        pipManager?.enterPip()

        React.startTransition(() => {
            setTimeout(() => {
                videoRef.current?.focus()
            }, 100)
        })
    }, [pip, pipManager])

    // Add keyboard event listeners
    useEffect(() => {
        if (!active) return

        document.addEventListener("keydown", handleKeyboardShortcuts)

        return () => {
            document.removeEventListener("keydown", handleKeyboardShortcuts)
        }
    }, [handleKeyboardShortcuts, active])

    // Handle fullscreen state changes to ensure video gets focused
    useEffect(() => {
        if (!active) return

        const handleFullscreenChange = () => {
            // Small delay to ensure fullscreen transition is complete
            setTimeout(() => {
                if (document.fullscreenElement && videoRef.current) {
                    videoRef.current.focus()
                }
            }, 100)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [active])

    return null
}
