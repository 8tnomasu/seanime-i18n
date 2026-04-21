import { useOpenInExplorer } from "@/api/hooks/explorer.hooks"
import { vc_subtitleManager } from "@/app/(main)/_features/video-core/video-core"
import { vc_mediaCaptionsManager } from "@/app/(main)/_features/video-core/video-core"
import { anime4kOptions, getAnime4KOptionByValue, vc_anime4kOption } from "@/app/(main)/_features/video-core/video-core-anime-4k"
import { Anime4KOption } from "@/app/(main)/_features/video-core/video-core-anime-4k-manager"
import { vc_menuOpen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_menuSectionOpen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_menuSubSectionOpen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_isMobile } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_playbackRate } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_isFullscreen } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_miniPlayer } from "@/app/(main)/_features/video-core/video-core-atoms"
import { vc_containerElement } from "@/app/(main)/_features/video-core/video-core-atoms"
import { VideoCoreControlButtonIcon } from "@/app/(main)/_features/video-core/video-core-control-bar"
import {
    VideoCoreMenu,
    VideoCoreMenuOption,
    VideoCoreMenuSectionBody,
    VideoCoreMenuSubmenuBody,
    VideoCoreMenuSubOption,
    VideoCoreMenuSubSubmenuBody,
    VideoCoreMenuTitle,
    VideoCoreSettingSelect,
    VideoCoreSettingTextInput,
} from "@/app/(main)/_features/video-core/video-core-menu"
import { videoCorePreferencesModalAtom } from "@/app/(main)/_features/video-core/video-core-preferences"
import {
    vc_autoNextAtom,
    vc_autoPlayVideoAtom,
    vc_autoSkipOPEDAtom,
    vc_beautifyImageAtom,
    vc_highlightOPEDChaptersAtom,
    vc_initialSettings,
    vc_settings,
    vc_showChapterMarkersAtom,
    vc_storedPlaybackRateAtom,
    VideoCoreSettings,
} from "@/app/(main)/_features/video-core/video-core.atoms"
import { vc_dispatchAction } from "@/app/(main)/_features/video-core/video-core.utils"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { upath } from "@/lib/helpers/upath"
import { useAtomValue } from "jotai"
import { useAtom, useSetAtom } from "jotai/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { HiFastForward } from "react-icons/hi"
import { ImFileText } from "react-icons/im"
import { IoCaretForwardCircleOutline } from "react-icons/io5"
import { LuChevronUp, LuHeading, LuPaintbrush, LuPalette, LuSettings, LuSettings2, LuSparkles, LuTvMinimalPlay } from "react-icons/lu"
import { MdOutlineAccessTime, MdOutlineSubtitles, MdSpeed } from "react-icons/md"
import { RiShadowLine } from "react-icons/ri"
import { TbArrowForwardUp } from "react-icons/tb"
import { VscTextSize } from "react-icons/vsc"

const SUBTITLE_STYLES_FONT_SIZE_OPTIONS = [
    { labelKey: "player.options.size.small", value: 54 },
    { labelKey: "player.options.size.medium", value: 62 },
    { labelKey: "player.options.size.large", value: 72 },
    { labelKey: "player.options.size.extraLarge", value: 82 },
]

const SUBTITLE_STYLES_COLOR_OPTIONS = [
    { labelKey: "player.options.colors.white", value: "#FFFFFF" },
    { labelKey: "player.options.colors.black", value: "#000000" },
    { labelKey: "player.options.colors.gray", value: "#808080" },
    { labelKey: "player.options.colors.yellow", value: "#FFD700" },
    { labelKey: "player.options.colors.cyan", value: "#00FFFF" },
    { labelKey: "player.options.colors.pink", value: "#FF69B4" },
    { labelKey: "player.options.colors.purple", value: "#9370DB" },
    { labelKey: "player.options.colors.lime", value: "#00FF00" },
]

const SUBTITLE_STYLES_OUTLINE_WIDTH_OPTIONS = [
    { labelKey: "player.common.none", value: 0 },
    { labelKey: "player.options.size.small", value: 2 },
    { labelKey: "player.options.size.medium", value: 3 },
    { labelKey: "player.options.size.large", value: 4 },
]

const SUBTITLE_STYLES_SHADOW_DEPTH_OPTIONS = [
    { labelKey: "player.common.none", value: 0 },
    { labelKey: "player.options.size.small", value: 1 },
    { labelKey: "player.options.size.medium", value: 2 },
    { labelKey: "player.options.size.large", value: 3 },
]

export const SUBTITLE_STYLES_BACK_COLOR_OPACITY_OPTIONS = [
    { label: "100%", value: 0 },
    { label: "80%", value: 64 },
    { label: "70%", value: 77 },
    { label: "50%", value: 150 },
    { label: "25%", value: 200 },
    { label: "0%", value: 255 },
]

export const vc_subtitleStylesDefaults: VideoCoreSettings["subtitleCustomization"] = {
    enabled: false,
    fontName: "",
    fontSize: SUBTITLE_STYLES_FONT_SIZE_OPTIONS[1].value,
    primaryColor: SUBTITLE_STYLES_COLOR_OPTIONS[0].value,
    outlineColor: SUBTITLE_STYLES_COLOR_OPTIONS[1].value,
    backColor: SUBTITLE_STYLES_COLOR_OPTIONS[1].value,
    backColorOpacity: SUBTITLE_STYLES_BACK_COLOR_OPACITY_OPTIONS[0].value,
    outline: SUBTITLE_STYLES_OUTLINE_WIDTH_OPTIONS[2].value,
    shadow: SUBTITLE_STYLES_SHADOW_DEPTH_OPTIONS[0].value,
}

type TranslationFunction = (key: string) => string
type LocalizedSelectOption<T> = { labelKey: string, value: T }

const PLAYER_MENU_SECTION_IDS = {
    anime4k: "anime4k",
    autoNext: "auto-next",
    autoPlay: "auto-play",
    captionStyles: "caption-styles",
    playerAppearance: "player-appearance",
    playbackSpeed: "playback-speed",
    skipOpEd: "skip-op-ed",
    subtitleDelay: "subtitle-delay",
    subtitleStyles: "subtitle-styles",
} as const

function translateSelectOptions<T>(t: TranslationFunction, options: Array<LocalizedSelectOption<T>>) {
    return options.map(option => ({
        label: t(option.labelKey),
        value: option.value,
    }))
}

function getLocalizedOptionLabel<T>(t: TranslationFunction, options: Array<LocalizedSelectOption<T>>, value: T) {
    const option = options.find(option => option.value === value)
    return option ? t(option.labelKey) : ""
}

function getAnime4KOptionLabel(t: TranslationFunction, option: ReturnType<typeof getAnime4KOptionByValue>) {
    if (!option || option.value === "off") return t("player.common.off")
    return option.label
}

function getAnime4KOptionDescription(t: TranslationFunction, option: (typeof anime4kOptions)[number]) {
    return t(`player.anime4k.descriptions.${option.value}`)
}

export function vc_getSubtitleStyle<T extends keyof VideoCoreSettings["subtitleCustomization"]>(settings: VideoCoreSettings["subtitleCustomization"] | undefined,
    key: T,
): NonNullable<VideoCoreSettings["subtitleCustomization"][T]> {
    return settings?.[key] ?? vc_subtitleStylesDefaults[key] as any
}

export function vc_getSubtitleStyleLabel<T extends keyof VideoCoreSettings["subtitleCustomization"]>(settings: VideoCoreSettings["subtitleCustomization"] | undefined,
    key: T,
    t: TranslationFunction,
): string {
    switch (key) {
        case "fontSize":
            return getLocalizedOptionLabel(t, SUBTITLE_STYLES_FONT_SIZE_OPTIONS, vc_getSubtitleStyle(settings, key) as number)
        case "outline":
            return getLocalizedOptionLabel(t, SUBTITLE_STYLES_OUTLINE_WIDTH_OPTIONS, vc_getSubtitleStyle(settings, key) as number)
        case "shadow":
            return getLocalizedOptionLabel(t, SUBTITLE_STYLES_SHADOW_DEPTH_OPTIONS, vc_getSubtitleStyle(settings, key) as number)
        case "primaryColor":
        case "outlineColor":
        case "backColor":
            return getLocalizedOptionLabel(t, SUBTITLE_STYLES_COLOR_OPTIONS, vc_getSubtitleStyle(settings, key) as string)
        // case "backColorOpacity":
        //     return `${((vc_getSubtitleStyle(settings, "backColorOpacity")-255) / 255 * 100).toFixed(0)}%`
    }
    return ""
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const CAPTION_STYLES_FONT_SIZE_OPTIONS = [
    { labelKey: "player.options.size.small", value: 4 },
    { labelKey: "player.options.size.medium", value: 5 },
    { labelKey: "player.options.size.large", value: 5.7 },
    { labelKey: "player.options.size.extraLarge", value: 6.1 },
]

export const CAPTION_STYLES_TEXT_SHADOW_OPTIONS = [
    { labelKey: "player.common.none", value: 0 },
    { labelKey: "player.options.size.small", value: 2 },
    { labelKey: "player.options.size.medium", value: 4 },
    { labelKey: "player.options.size.large", value: 6 },
]

export const CAPTION_STYLES_BACKGROUND_OPACITY_OPTIONS = [
    { label: "0%", value: 0 },
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "70%", value: 0.7 },
    { label: "80%", value: 0.8 },
    { label: "100%", value: 1 },
]

export const CAPTION_STYLES_COLOR_OPTIONS = SUBTITLE_STYLES_COLOR_OPTIONS

export const vc_captionsStylesDefaults: VideoCoreSettings["captionCustomization"] = {
    fontSize: CAPTION_STYLES_FONT_SIZE_OPTIONS[1].value,
    textColor: CAPTION_STYLES_COLOR_OPTIONS[0].value,
    backgroundColor: SUBTITLE_STYLES_COLOR_OPTIONS[1].value,
    textShadow: CAPTION_STYLES_TEXT_SHADOW_OPTIONS[2].value,
    textShadowColor: CAPTION_STYLES_COLOR_OPTIONS[1].value,
    backgroundOpacity: CAPTION_STYLES_BACKGROUND_OPACITY_OPTIONS[3].value,
}

export function vc_getCaptionStyle<T extends keyof VideoCoreSettings["captionCustomization"]>(settings: VideoCoreSettings["captionCustomization"] | undefined,
    key: T,
): NonNullable<VideoCoreSettings["captionCustomization"][T]> {
    return settings?.[key] ?? vc_captionsStylesDefaults[key] as any
}

export function vc_getCaptionStyleLabel<T extends keyof VideoCoreSettings["captionCustomization"]>(settings: VideoCoreSettings["captionCustomization"] | undefined,
    key: T,
    t: TranslationFunction,
): string {
    switch (key) {
        case "fontSize":
            return getLocalizedOptionLabel(t, CAPTION_STYLES_FONT_SIZE_OPTIONS, vc_getCaptionStyle(settings, key) as number)
        case "textShadow":
            return getLocalizedOptionLabel(t, CAPTION_STYLES_TEXT_SHADOW_OPTIONS, vc_getCaptionStyle(settings, key) as number)
        case "backgroundColor":
        case "textShadowColor":
        case "textColor":
            return getLocalizedOptionLabel(t, CAPTION_STYLES_COLOR_OPTIONS, vc_getCaptionStyle(settings, key) as string)
        case "backgroundOpacity":
            return `${(vc_getCaptionStyle(settings, "backgroundOpacity") * 100).toFixed(0)}%`
    }
    return ""
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function VideoCoreSettingsMenu() {
    const { t } = useTranslation()
    const serverStatus = useServerStatus()
    const isMobile = useAtomValue(vc_isMobile)
    const action = useSetAtom(vc_dispatchAction)
    const isMiniPlayer = useAtomValue(vc_miniPlayer)
    const playbackRate = useAtomValue(vc_playbackRate)
    const setPlaybackRate = useSetAtom(vc_storedPlaybackRateAtom)
    const isFullscreen = useAtomValue(vc_isFullscreen)
    const containerElement = useAtomValue(vc_containerElement)
    const subtitleManager = useAtomValue(vc_subtitleManager)
    const mediaCaptionsManager = useAtomValue(vc_mediaCaptionsManager)

    const [anime4kOption, setAnime4kOption] = useAtom(vc_anime4kOption)
    const currentAnime4kOption = getAnime4KOptionByValue(anime4kOption)

    const [, setKeybindingsModelOpen] = useAtom(videoCorePreferencesModalAtom)

    const [showChapterMarkers, setShowChapterMarkers] = useAtom(vc_showChapterMarkersAtom)
    const [highlightOPEDChapters, setHighlightOPEDChapters] = useAtom(vc_highlightOPEDChaptersAtom)
    const [beautifyImage, setBeautifyImage] = useAtom(vc_beautifyImageAtom)
    const [autoNext, setAutoNext] = useAtom(vc_autoNextAtom)
    const [autoPlay, setAutoPlay] = useAtom(vc_autoPlayVideoAtom)
    const [autoSkipOPED, setAutoSkipOPED] = useAtom(vc_autoSkipOPEDAtom)

    const [menuOpen, setMenuOpen] = useAtom(vc_menuOpen)
    const [openMenuSection, setOpenMenuSection] = useAtom(vc_menuSectionOpen)
    const [openMenuSubSection, setOpenMenuSubSection] = useAtom(vc_menuSubSectionOpen)

    const { mutate: openInExplorer, isPending: isOpeningInExplorer } = useOpenInExplorer()

    const [settings, setSettings] = useAtom(vc_settings)

    const [editedSubCustomization, setEditedSubCustomization] = useState<VideoCoreSettings["subtitleCustomization"]>(
        settings.subtitleCustomization || vc_initialSettings.subtitleCustomization,
    )

    const [editedCaptionCustomization, setEditedCaptionCustomization] = useState<VideoCoreSettings["captionCustomization"]>(
        settings.captionCustomization || vc_initialSettings.captionCustomization,
    )

    const [editedSubtitleDelay, setEditedSubtitleDelay] = useState(settings.subtitleDelay ?? 0)

    const [subFontName, setSubFontName] = useState<string>(editedSubCustomization?.fontName || "")

    React.useEffect(() => {
        if (openMenuSection === PLAYER_MENU_SECTION_IDS.subtitleStyles) {
            setEditedSubCustomization(settings.subtitleCustomization || vc_initialSettings.subtitleCustomization)
        }
        if (openMenuSection === PLAYER_MENU_SECTION_IDS.captionStyles) {
            setEditedCaptionCustomization(settings.captionCustomization || vc_initialSettings.captionCustomization)
        }
        if (openMenuSection === PLAYER_MENU_SECTION_IDS.subtitleDelay) {
            setEditedSubtitleDelay(settings.subtitleDelay)
        }
    }, [openMenuSection, settings])

    const handleSaveSettings = (customization?: VideoCoreSettings["subtitleCustomization"]) => {
        const newSettings = {
            ...settings,
            subtitleCustomization: customization || editedSubCustomization,
        }
        setSettings(newSettings)
        subtitleManager?.updateSettings(newSettings)

        // // Go back to submenu after saving from sub-submenu
        // setOpenMenuSubSection(null)
    }

    const handleSaveCaptionSettings = (customization?: VideoCoreSettings["captionCustomization"]) => {
        const newSettings = {
            ...settings,
            captionCustomization: customization || editedCaptionCustomization,
        }
        setSettings(newSettings)
        mediaCaptionsManager?.updateSettings(newSettings)
    }

    const handleSubtitleCustomizationChange = <K extends keyof VideoCoreSettings["subtitleCustomization"]>(
        key: K,
        value: VideoCoreSettings["subtitleCustomization"][K],
    ): void => {
        const newCustomization = {
            ...editedSubCustomization,
            [key]: value,
        }
        setEditedSubCustomization(newCustomization)
        React.startTransition(() => {
            handleSaveSettings(newCustomization)
        })
    }

    const handleCaptionCustomizationChange = <K extends keyof VideoCoreSettings["captionCustomization"]>(
        key: K,
        value: VideoCoreSettings["captionCustomization"][K],
    ): void => {
        const newCustomization = {
            ...editedCaptionCustomization,
            [key]: value,
        }
        setEditedCaptionCustomization(newCustomization)
        React.startTransition(() => {
            handleSaveCaptionSettings(newCustomization)
        })
    }

    const handleSubtitleDelayChange = (delay: number): void => {
        setEditedSubtitleDelay(delay)
        const newSettings = {
            ...settings,
            subtitleDelay: delay,
        }
        setSettings(newSettings)
        subtitleManager?.updateSettings(newSettings)
        mediaCaptionsManager?.updateSettings(newSettings)
    }

    if (isMiniPlayer) return null

    return (
        <>
            {playbackRate !== 1 && (
                <p
                    className="text-sm text-[--muted] cursor-pointer" onClick={() => {
                    setMenuOpen("settings")
                    React.startTransition(() => {
                        setOpenMenuSection(PLAYER_MENU_SECTION_IDS.playbackSpeed)
                    })
                }}
                >
                    {`${(playbackRate).toFixed(2)}x`}
                </p>
            )}
            <VideoCoreMenu
                name="settings"
                trigger={<VideoCoreControlButtonIcon
                    icons={[
                        ["default", isMobile ? LuSettings : LuChevronUp],
                    ]}
                    state="default"
                    className={isMobile ? "text-xl" : ""}
                    onClick={() => {
                    }}
                />}
            >
                <VideoCoreMenuSectionBody>
                    <VideoCoreMenuTitle>{t("player.menus.settings")}</VideoCoreMenuTitle>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.playbackSpeed} title={t("player.settings.playbackSpeed")} icon={MdSpeed} value={`${(playbackRate).toFixed(2)}x`} />
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.autoPlay} title={t("player.settings.autoPlay")} icon={IoCaretForwardCircleOutline} value={autoPlay ? t("player.common.on") : t("player.common.off")} />
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.autoNext} title={t("player.settings.autoNext")} icon={HiFastForward} value={autoNext ? t("player.common.on") : t("player.common.off")} />
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.skipOpEd} title={t("player.settings.skipOpEd")} icon={TbArrowForwardUp} value={autoSkipOPED ? t("player.common.on") : t("player.common.off")} />
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.anime4k} title="Anime4K" icon={LuSparkles} value={getAnime4KOptionLabel(t, currentAnime4kOption)} />
                    {(subtitleManager || mediaCaptionsManager) && <VideoCoreMenuOption
                        id={PLAYER_MENU_SECTION_IDS.subtitleDelay}
                        title={t("player.settings.subtitleDelay")}
                        icon={MdOutlineAccessTime}
                        value={`${settings.subtitleDelay.toFixed(1)}s`}
                    />}
                    {subtitleManager && <VideoCoreMenuOption
                        id={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                        title={t("player.settings.subtitleStyles")}
                        icon={MdOutlineSubtitles}
                        value={editedSubCustomization?.enabled
                            ? (!!editedSubCustomization?.fontName ? t("player.settings.values.onWithFont") : t("player.common.on"))
                            : t("player.common.off")}
                    />}
                    {mediaCaptionsManager && <VideoCoreMenuOption
                        id={PLAYER_MENU_SECTION_IDS.captionStyles}
                        title={t("player.settings.captionStyles")}
                        icon={MdOutlineSubtitles}
                    />}
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.playerAppearance} title={t("player.settings.playerAppearance")} icon={LuTvMinimalPlay} />
                    <VideoCoreMenuOption title={t("player.settings.preferences")} icon={LuSettings2} onClick={() => setKeybindingsModelOpen(true)} />
                </VideoCoreMenuSectionBody>
                <VideoCoreMenuSubmenuBody>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.subtitleStyles} title={t("player.settings.subtitleStyles")} icon={MdOutlineSubtitles}>
                        <p className="text-sm text-[--muted] mb-2">{t("player.settings.subtitleCustomizationHelp")}</p>
                        <VideoCoreSettingSelect
                            options={[
                                { label: t("player.common.on"), value: 1 },
                                { label: t("player.common.off"), value: 0 },
                            ]}
                            onValueChange={(v: number) => handleSubtitleCustomizationChange("enabled", v === 1)}
                            value={editedSubCustomization.enabled ? 1 : 0}
                        />
                        {editedSubCustomization.enabled && <>
                            <p className="text-[--muted] text-sm my-2">{t("player.common.options")}</p>
                            <VideoCoreMenuSubOption
                                id="font"
                                title={t("player.settings.font")}
                                icon={LuHeading}
                                parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                                value={!editedSubCustomization.fontName ? t("player.common.default") : editedSubCustomization.fontName?.slice(0,
                                    11) + (!!editedSubCustomization.fontName?.length && editedSubCustomization.fontName?.length > 10
                                    ? "..."
                                    : "")}
                            />
                            <VideoCoreMenuSubOption
                                id="font-size"
                                title={t("player.settings.fontSize")}
                                icon={VscTextSize}
                                parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                                value={vc_getSubtitleStyleLabel(settings.subtitleCustomization, "fontSize", t)}
                            />
                            <VideoCoreMenuSubOption
                                id="text-color"
                                title={t("player.settings.textColor")}
                                icon={LuPalette}
                                parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                                value={vc_getSubtitleStyleLabel(settings.subtitleCustomization, "primaryColor", t)}
                            />
                            <VideoCoreMenuSubOption
                                id="outline"
                                title={t("player.settings.outline")}
                                icon={ImFileText}
                                parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                                value={`${vc_getSubtitleStyleLabel(settings.subtitleCustomization,
                                    "outline", t)}, ${vc_getSubtitleStyleLabel(settings.subtitleCustomization, "outlineColor", t)}`}
                            />
                            <VideoCoreMenuSubOption
                                id="shadow"
                                title={t("player.settings.shadow")}
                                icon={RiShadowLine}
                                parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}
                                value={`${vc_getSubtitleStyleLabel(settings.subtitleCustomization,
                                    "shadow", t)}, ${vc_getSubtitleStyleLabel(settings.subtitleCustomization, "backColor", t)}`}
                            />
                        </>}
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.captionStyles} title={t("player.settings.captionStyles")} icon={MdOutlineSubtitles}>
                        <p className="text-sm text-[--muted] mb-2">{t("player.settings.captionStylesHelp")}</p>
                        {/*<VideoCoreSettingSelect*/}
                        {/*    options={[*/}
                        {/*        { label: "On", value: 1 },*/}
                        {/*        { label: "Off", value: 0 },*/}
                        {/*    ]}*/}
                        {/*    onValueChange={(v: number) => handleCaptionCustomizationChange("enabled", v === 1)}*/}
                        {/*    value={editedCaptionCustomization.enabled ? 1 : 0}*/}
                        {/*/>*/}
                        {/*{editedCaptionCustomization.enabled && <>*/}
                        <p className="text-[--muted] text-sm my-2">{t("player.common.options")}</p>
                        <VideoCoreMenuSubOption
                            id="font-size"
                            title={t("player.settings.fontSize")}
                            icon={VscTextSize}
                            parentId={PLAYER_MENU_SECTION_IDS.captionStyles}
                            value={vc_getCaptionStyleLabel(settings.captionCustomization, "fontSize", t)}
                        />
                        {/*<VideoCoreMenuSubOption title="Font Family" icon={LuHeading} parentId="Caption Styles" />*/}
                        <VideoCoreMenuSubOption
                            id="text-color"
                            title={t("player.settings.textColor")}
                            icon={LuPalette}
                            parentId={PLAYER_MENU_SECTION_IDS.captionStyles}
                            value={vc_getCaptionStyleLabel(settings.captionCustomization, "textColor", t)}
                        />
                        <VideoCoreMenuSubOption
                            id="background"
                            title={t("player.settings.background")}
                            icon={LuPaintbrush}
                            parentId={PLAYER_MENU_SECTION_IDS.captionStyles}
                            value={`${vc_getCaptionStyleLabel(settings.captionCustomization,
                                "backgroundOpacity", t)}, ${vc_getCaptionStyleLabel(settings.captionCustomization, "backgroundColor", t)}`}
                        />
                        {/*<VideoCoreMenuSubOption title="Outline" icon={ImFileText} parentId="Caption Styles" />*/}
                        <VideoCoreMenuSubOption
                            id="shadow"
                            title={t("player.settings.shadow")}
                            icon={RiShadowLine}
                            parentId={PLAYER_MENU_SECTION_IDS.captionStyles}
                            value={`${vc_getCaptionStyleLabel(settings.captionCustomization,
                                "textShadow", t)}, ${vc_getCaptionStyleLabel(settings.captionCustomization, "textShadowColor", t)}`}
                        />
                        {/*</>}*/}
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.subtitleDelay} title={t("player.settings.subtitleDelay")} icon={MdOutlineAccessTime}>
                        <p className="text-sm text-[--muted] mb-2">{t("player.settings.subtitleDelayHelp")}</p>
                        <div className="flex gap-1.5 items-center mt-3">
                            <Button
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => handleSubtitleDelayChange(parseFloat((editedSubtitleDelay - 0.5).toFixed(1)))}
                            >
                                −0.5
                            </Button>
                            <Button
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => handleSubtitleDelayChange(parseFloat((editedSubtitleDelay - 0.1).toFixed(1)))}
                            >
                                −0.1
                            </Button>
                            <span className="text-sm text-center text-[--muted] px-1 flex-1">
                                {editedSubtitleDelay.toFixed(1)}s
                            </span>
                            <Button
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => handleSubtitleDelayChange(parseFloat((editedSubtitleDelay + 0.1).toFixed(1)))}
                            >
                                +0.1
                            </Button>
                            <Button
                                className="px-1 !text-xs flex-1"
                                intent="gray-subtle"
                                size="sm"
                                onClick={() => handleSubtitleDelayChange(parseFloat((editedSubtitleDelay + 0.5).toFixed(1)))}
                            >
                                +0.5
                            </Button>
                        </div>
                        <VideoCoreSettingSelect
                            options={[
                                { label: "-2.0s", value: -2.0 },
                                { label: "-1.0s", value: -1.0 },
                                { label: "-0.5s", value: -0.5 },
                                { label: "0s", value: 0 },
                                { label: "0.5s", value: 0.5 },
                                { label: "1.0s", value: 1.0 },
                                { label: "2.0s", value: 2.0 },
                            ]}
                            onValueChange={(v: number) => {
                                handleSubtitleDelayChange(v)
                            }}
                            value={[-2.0, -1.0, -0.5, 0, 0.5, 0.1, 2.0].includes(editedSubtitleDelay) ? editedSubtitleDelay : null}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.playbackSpeed} title={t("player.settings.playbackSpeed")} icon={MdSpeed}>
                        <VideoCoreSettingSelect
                            options={[
                                { label: "0.5x", value: 0.5 },
                                { label: "0.9x", value: 0.9 },
                                { label: "1x", value: 1 },
                                { label: "1.1x", value: 1.1 },
                                { label: "1.5x", value: 1.5 },
                                { label: "2x", value: 2 },
                            ]}
                            onValueChange={(v: number) => {
                                setPlaybackRate(v)
                            }}
                            value={playbackRate}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.autoPlay} title={t("player.settings.autoPlay")} icon={IoCaretForwardCircleOutline}>
                        <VideoCoreSettingSelect
                            options={[
                                { label: t("player.common.on"), value: 1 },
                                { label: t("player.common.off"), value: 0 },
                            ]}
                            onValueChange={(v: number) => {
                                setAutoPlay(!!v)
                            }}
                            value={autoPlay ? 1 : 0}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.autoNext} title={t("player.settings.autoNext")} icon={HiFastForward}>
                        <VideoCoreSettingSelect
                            options={[
                                { label: t("player.common.on"), value: 1 },
                                { label: t("player.common.off"), value: 0 },
                            ]}
                            onValueChange={(v: number) => {
                                setAutoNext(!!v)
                            }}
                            value={autoNext ? 1 : 0}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.skipOpEd} title={t("player.settings.skipOpEd")} icon={TbArrowForwardUp}>
                        <VideoCoreSettingSelect
                            options={[
                                { label: t("player.common.on"), value: 1 },
                                { label: t("player.common.off"), value: 0 },
                            ]}
                            onValueChange={(v: number) => {
                                setAutoSkipOPED(!!v)
                            }}
                            value={autoSkipOPED ? 1 : 0}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.anime4k} title="Anime4K" icon={LuSparkles}>
                        <p className="text-[--muted] text-sm mb-2">
                            {t("player.settings.anime4kHelp")}
                        </p>
                        <VideoCoreSettingSelect
                            isFullscreen={isFullscreen}
                            containerElement={containerElement}
                            options={anime4kOptions.map(option => ({
                                label: getAnime4KOptionLabel(t, option),
                                value: option.value,
                                moreInfo: option.performance === "heavy" ? t("player.common.heavy") : undefined,
                                description: getAnime4KOptionDescription(t, option),
                            }))}
                            onValueChange={(value: Anime4KOption) => {
                                setAnime4kOption(value)
                            }}
                            value={anime4kOption}
                        />
                    </VideoCoreMenuOption>
                    <VideoCoreMenuOption id={PLAYER_MENU_SECTION_IDS.playerAppearance} title={t("player.settings.playerAppearance")} icon={LuPaintbrush}>
                        <Switch
                            label={t("player.settings.showChapterMarkers")}
                            side="right"
                            fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                            size="sm"
                            value={showChapterMarkers}
                            onValueChange={setShowChapterMarkers}
                        />
                        <Switch
                            label={t("player.settings.highlightOpEdChapters")}
                            side="right"
                            fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                            size="sm"
                            value={highlightOPEDChapters}
                            onValueChange={setHighlightOPEDChapters}
                        />
                        <Switch
                            label={t("player.settings.increaseSaturation")}
                            side="right"
                            fieldClass="hover:bg-transparent hover:border-transparent px-0 ml-0 w-full"
                            size="sm"
                            value={beautifyImage}
                            onValueChange={setBeautifyImage}
                        />
                    </VideoCoreMenuOption>
                </VideoCoreMenuSubmenuBody>
                <VideoCoreMenuSubSubmenuBody>
                    <VideoCoreMenuSubOption id="font" title={t("player.settings.font")} icon={VscTextSize} parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}>
                        <div className="">
                            <p className="text-sm mb-2">{t("player.settings.customFont")}</p>
                            <p className="text-sm text-[--muted] mb-2">
                                {t("player.settings.customFontDescriptionBefore")} <span
                                className="text-indigo-300 cursor-pointer underline underline-offset-2"
                                onClick={() => {
                                    openInExplorer({ path: upath.normalize(`${serverStatus?.dataDir}/assets`) })
                                }}
                            >{t("player.settings.seanimeAssetsDirectory")}</span>. {t("player.settings.customFontDescriptionAfter")}
                            </p>
                            <div className="space-y-2">
                                <VideoCoreSettingTextInput
                                    label={t("player.settings.fileName")}
                                    value={subFontName ?? ""}
                                    onValueChange={(v: string) => setSubFontName(v)}
                                    help={t("player.settings.fileNameHelp")}
                                />
                                <div className="flex w-full">
                                    <Button
                                        size="sm" intent="gray-glass" onClick={() => {
                                        handleSubtitleCustomizationChange("fontName", subFontName)
                                    }}
                                    >
                                        {t("common.buttons.save")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="font-size" title={t("player.settings.fontSize")} icon={LuHeading} parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}>
                        <p className="text-[--muted] text-sm mb-2">{t("player.settings.fontSize")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_FONT_SIZE_OPTIONS)}
                            onValueChange={(v: number) => handleSubtitleCustomizationChange("fontSize", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "fontSize")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="text-color" title={t("player.settings.textColor")} icon={LuPalette} parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleSubtitleCustomizationChange("primaryColor", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "primaryColor")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="outline" title={t("player.settings.outline")} icon={LuPalette} parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}>
                        <p className="text-[--muted] text-sm mb-2">{t("player.settings.outlineWidth")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_OUTLINE_WIDTH_OPTIONS)}
                            onValueChange={(v: number) => handleSubtitleCustomizationChange("outline", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "outline")}
                        />
                        <p className="text-[--muted] text-sm my-2">{t("player.settings.outlineColor")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleSubtitleCustomizationChange("outlineColor", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "outlineColor")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="shadow" title={t("player.settings.shadow")} icon={LuPalette} parentId={PLAYER_MENU_SECTION_IDS.subtitleStyles}>
                        <p className="text-[--muted] text-sm mb-2">{t("player.settings.shadowDepth")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_SHADOW_DEPTH_OPTIONS)}
                            onValueChange={(v: number) => handleSubtitleCustomizationChange("shadow", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "shadow")}
                        />
                        <p className="text-[--muted] text-sm my-2">{t("player.settings.shadowOpacity")}</p>
                        <VideoCoreSettingSelect
                            options={SUBTITLE_STYLES_BACK_COLOR_OPACITY_OPTIONS}
                            onValueChange={(v: number) => handleSubtitleCustomizationChange("backColorOpacity", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "backColorOpacity")}
                        />
                        <p className="text-[--muted] text-sm my-2">{t("player.settings.shadowColor")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, SUBTITLE_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleSubtitleCustomizationChange("backColor", v)}
                            value={vc_getSubtitleStyle(editedSubCustomization, "backColor")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="font-size" title={t("player.settings.fontSize")} icon={VscTextSize} parentId={PLAYER_MENU_SECTION_IDS.captionStyles}>
                        {/*<p className="text-[--muted] text-sm mb-2">Font size as percentage of video height</p>*/}
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, CAPTION_STYLES_FONT_SIZE_OPTIONS)}
                            onValueChange={(v: number) => handleCaptionCustomizationChange("fontSize", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "fontSize")}
                        />
                    </VideoCoreMenuSubOption>
                    {/*<VideoCoreMenuSubOption title="Font Family" icon={LuHeading} parentId="Caption Styles">*/}
                    {/*    /!*<p className="text-[--muted] text-sm mb-2">Font family for captions</p>*!/*/}
                    {/*    <VideoCoreSettingSelect*/}
                    {/*        options={[*/}
                    {/*            { label: "Inter", value: "Inter, Arial, sans-serif" },*/}
                    {/*            { label: "Arial", value: "Arial, sans-serif" },*/}
                    {/*            { label: "Courier", value: "Courier New, monospace" },*/}
                    {/*            { label: "Georgia", value: "Georgia, serif" },*/}
                    {/*            { label: "Times", value: "Times New Roman, serif" },*/}
                    {/*        ]}*/}
                    {/*        onValueChange={(v: string) => handleCaptionCustomizationChange("fontFamily", v)}*/}
                    {/*        value={editedCaptionCustomization.fontFamily ?? "Inter, Arial, sans-serif"}*/}
                    {/*    />*/}
                    {/*</VideoCoreMenuSubOption>*/}
                    <VideoCoreMenuSubOption id="text-color" title={t("player.settings.textColor")} icon={LuPalette} parentId={PLAYER_MENU_SECTION_IDS.captionStyles}>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, CAPTION_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleCaptionCustomizationChange("textColor", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "textColor")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="background" title={t("player.settings.background")} icon={LuPaintbrush} parentId={PLAYER_MENU_SECTION_IDS.captionStyles}>
                        <p className="text-[--muted] text-sm my-2">{t("player.settings.backgroundOpacity")}</p>
                        <VideoCoreSettingSelect
                            options={CAPTION_STYLES_BACKGROUND_OPACITY_OPTIONS}
                            onValueChange={(v: number) => handleCaptionCustomizationChange("backgroundOpacity", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "backgroundOpacity")}
                        />
                        <p className="text-[--muted] text-sm mb-2">{t("player.settings.backgroundColor")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, CAPTION_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleCaptionCustomizationChange("backgroundColor", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "backgroundColor")}
                        />
                    </VideoCoreMenuSubOption>
                    <VideoCoreMenuSubOption id="shadow" title={t("player.settings.shadow")} icon={RiShadowLine} parentId={PLAYER_MENU_SECTION_IDS.captionStyles}>
                        <p className="text-[--muted] text-sm mb-2">{t("player.settings.textShadow")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, CAPTION_STYLES_TEXT_SHADOW_OPTIONS)}
                            onValueChange={(v: number) => handleCaptionCustomizationChange("textShadow", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "textShadow")}
                        />
                        <p className="text-[--muted] text-sm my-2">{t("player.settings.shadowColor")}</p>
                        <VideoCoreSettingSelect
                            options={translateSelectOptions(t, CAPTION_STYLES_COLOR_OPTIONS)}
                            onValueChange={(v: string) => handleCaptionCustomizationChange("textShadowColor", v)}
                            value={vc_getCaptionStyle(editedCaptionCustomization, "textShadowColor")}
                        />
                    </VideoCoreMenuSubOption>
                </VideoCoreMenuSubSubmenuBody>
            </VideoCoreMenu>
        </>
    )
}
