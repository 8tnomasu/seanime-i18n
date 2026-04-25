import { API_ENDPOINTS } from "@/api/generated/endpoints"
import { Models_HomeItem } from "@/api/generated/types"
import { useSaveDebridSettings } from "@/api/hooks/debrid.hooks"
import { useSaveSettings } from "@/api/hooks/settings.hooks"
import { useGetHomeItems, useUpdateHomeItems } from "@/api/hooks/status.hooks"
import { useSaveTorrentstreamSettings } from "@/api/hooks/torrentstream.hooks"
import { DEFAULT_HOME_ITEMS, HOME_ITEM_IDS, HOME_ITEMS } from "@/app/(main)/_features/home/home-items.utils"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { uuidv4 } from "@/app/websocket-provider"
import { Button, IconButton } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"
import { NumberInput } from "@/components/ui/number-input"
import { RadioGroup } from "@/components/ui/radio-group"
import { Select } from "@/components/ui/select"
import { TextInput } from "@/components/ui/text-input"
import {
    getAdvancedSearchSortingLabel,
    getAniListGenreLabel,
    getCollectionStatusLabel,
    getCountryLabel,
    getMediaFormatLabel,
    getMediaSeasonLabel,
    getMediaStatusLabel,
    getMediaTypeLabel,
} from "@/i18n/labels"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useQueryClient } from "@tanstack/react-query"
import { TFunction } from "i18next"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { BiCog, BiPlus, BiStats, BiTrash } from "react-icons/bi"
import { IoHomeOutline, IoLibraryOutline } from "react-icons/io5"
import {
    LuBookOpen,
    LuCalendar,
    LuCalendarClock,
    LuCirclePlay,
    LuClock,
    LuCompass,
    LuHeading,
    LuLayoutPanelLeft,
    LuListTodo,
    LuMilestone,
} from "react-icons/lu"
import { MdOutlineVideoLibrary } from "react-icons/md"
import { TbCarouselHorizontal } from "react-icons/tb"
import { toast } from "sonner"

export const __home_settingsModalOpen = atom(false)

const HOME_ITEM_ICONS = {
    "anime-continue-watching": LuCirclePlay,
    "anime-continue-watching-header": LuCirclePlay,
    "anime-library": MdOutlineVideoLibrary,
    "local-anime-library": IoLibraryOutline,
    "library-upcoming-episodes": LuClock,
    "aired-recently": LuCalendarClock,
    "anime-schedule-calendar": LuCalendar,
    "local-anime-library-stats": BiStats,
    "discover-header": LuCompass,
    "anime-carousel": TbCarouselHorizontal,
    "manga-carousel": TbCarouselHorizontal,
    "manga-continue-reading": LuBookOpen,
    "manga-library": LuBookOpen,
    "centered-title": LuHeading,
    "missed-sequels": LuMilestone,
    "my-lists": LuListTodo,
} as const

const HOME_ITEM_NAME_KEYS: Record<string, string> = {
    "centered-title": "home.items.centeredTitle.name",
    "anime-continue-watching": "home.items.animeContinueWatching.name",
    "anime-continue-watching-header": "home.items.animeContinueWatchingHeader.name",
    "anime-library": "home.items.animeLibrary.name",
    "my-lists": "home.items.myLists.name",
    "local-anime-library": "home.items.localAnimeLibrary.name",
    "library-upcoming-episodes": "home.items.libraryUpcomingEpisodes.name",
    "aired-recently": "home.items.airedRecently.name",
    "missed-sequels": "home.items.missedSequels.name",
    "anime-schedule-calendar": "home.items.animeScheduleCalendar.name",
    "local-anime-library-stats": "home.items.localAnimeLibraryStats.name",
    "discover-header": "home.items.discoverHeader.name",
    "anime-carousel": "home.items.animeCarousel.name",
    "manga-carousel": "home.items.mangaCarousel.name",
    "manga-library": "home.items.mangaLibrary.name",
}

const HOME_ITEM_DESCRIPTION_KEYS: Record<string, string> = {
    "centered-title": "home.items.centeredTitle.description",
    "anime-continue-watching": "home.items.animeContinueWatching.description",
    "anime-continue-watching-header": "home.items.animeContinueWatchingHeader.description",
    "anime-library": "home.items.animeLibrary.description",
    "my-lists": "home.items.myLists.description",
    "local-anime-library": "home.items.localAnimeLibrary.description",
    "library-upcoming-episodes": "home.items.libraryUpcomingEpisodes.description",
    "aired-recently": "home.items.airedRecently.description",
    "missed-sequels": "home.items.missedSequels.description",
    "anime-schedule-calendar": "home.items.animeScheduleCalendar.description",
    "local-anime-library-stats": "home.items.localAnimeLibraryStats.description",
    "discover-header": "home.items.discoverHeader.description",
    "anime-carousel": "home.items.animeCarousel.description",
    "manga-carousel": "home.items.mangaCarousel.description",
    "manga-library": "home.items.mangaLibrary.description",
}

function getHomeItemName(t: TFunction, type: string) {
    return t(HOME_ITEM_NAME_KEYS[type] ?? type)
}

function getHomeItemDescription(t: TFunction, type: string) {
    const key = HOME_ITEM_DESCRIPTION_KEYS[type]
    return key ? t(key) : ""
}

function getHomeItemKindLabel(t: TFunction, kind: "row" | "header") {
    return t(`home.settings.kinds.${kind}`)
}

function getHomeOptionLabel(t: TFunction, optionName: string, fallbackLabel?: string) {
    switch (optionName) {
        case "name":
            return t("home.settings.options.name")
        case "text":
            return t("home.settings.options.text")
        case "sorting":
            return t("mediaFilters.sorting")
        case "status":
            return t("mediaFilters.status")
        case "format":
            return t("mediaFilters.format")
        case "genres":
            return t("mediaFilters.genre")
        case "season":
            return t("mediaFilters.season")
        case "year":
            return t("mediaFilters.year")
        case "countryOfOrigin":
            return t("home.settings.options.countryOfOrigin")
        case "statuses":
            return t("home.settings.options.statuses")
        case "layout":
            return t("home.settings.options.layout")
        case "type":
            return t("home.settings.options.type")
        case "customListName":
            return t("home.settings.options.customListName")
        default:
            return fallbackLabel ?? optionName
    }
}

function getHomeOptionValueLabel(
    t: TFunction,
    itemType: string,
    optionName: string,
    option: { value?: string, label?: string },
) {
    const value = option.value

    switch (optionName) {
        case "sorting":
            return getAdvancedSearchSortingLabel(t, value) || option.label || value || ""
        case "status":
            return getMediaStatusLabel(t, value) || option.label || value || ""
        case "format":
            return getMediaFormatLabel(t, value) || option.label || value || ""
        case "genres":
            return getAniListGenreLabel(t, value || option.label) || option.label || value || ""
        case "season":
            return getMediaSeasonLabel(t, value) || option.label || value || ""
        case "countryOfOrigin":
            return getCountryLabel(t, value) || option.label || value || ""
        case "statuses":
            if (itemType === "anime-library") return getCollectionStatusLabel(t, value, "anime")
            if (itemType === "manga-library") return getCollectionStatusLabel(t, value, "manga")
            return getCollectionStatusLabel(t, value, "generic")
        case "layout": {
            if (value === "grid" || value === "carousel") {
                return t(`home.settings.options.layoutValues.${value}`)
            }
            return option.label || value || ""
        }
        case "type":
            if (itemType === "anime-schedule-calendar") {
                if (value === "my-lists" || value === "global") {
                    return t(`home.settings.options.scheduleTypes.${value === "my-lists" ? "myLists" : "global"}`)
                }
                return option.label || value || ""
            }
            return getMediaTypeLabel(t, value) || option.label || value || ""
        default:
            return option.label || value || ""
    }
}

export function HomeSettingsModal({ emptyLibrary, isNakamaLibrary }: { emptyLibrary?: boolean, isNakamaLibrary: boolean }) {
    const { t } = useTranslation()
    const serverStatus = useServerStatus()
    const ts = useThemeSettings()
    const [isModalOpen, setIsModalOpen] = useAtom(__home_settingsModalOpen)
    const [optionsModalOpen, setOptionsModalOpen] = React.useState<string | null>(null)

    const { data: _homeItems, isLoading: isLoadingHomeItems } = useGetHomeItems()
    const { mutate: updateHomeItems, isPending: isUpdatingHomeItems } = useUpdateHomeItems()

    const [currentItems, setCurrentItems] = React.useState<Models_HomeItem[]>(_homeItems || DEFAULT_HOME_ITEMS)
    const availableItems = HOME_ITEM_IDS.filter(type => {
        if (type === "anime-carousel" || type === "manga-carousel" || type === "centered-title" || type === "my-lists") {
            return true
        }
        return !currentItems.some(item => item.type === type)
    })

    const checkTimeRef = React.useRef<NodeJS.Timeout | null>(null)
    React.useEffect(() => {
        const homeItems = _homeItems || DEFAULT_HOME_ITEMS
        setCurrentItems(homeItems)

        if (checkTimeRef.current) {
            clearTimeout(checkTimeRef.current)
            checkTimeRef.current = null
        }

        // Check if an item doesn't exist anymore and remove it
        checkTimeRef.current = setTimeout(() => {
            const newItems = normalizeHomeItems(currentItems)

            if (newItems.length !== homeItems.length) {
                setCurrentItems(newItems)
                updateHomeItems({ items: newItems }, {
                    onSuccess: () => {
                        console.log("Home items updated")
                    },
                })
            }
        }, 500)

        return () => {
            if (checkTimeRef.current) {
                clearTimeout(checkTimeRef.current)
                checkTimeRef.current = null
            }
        }
    }, [_homeItems])

    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = currentItems.findIndex(item => item.id === active.id)
            const newIndex = currentItems.findIndex(item => item.id === over?.id)

            const newItems = normalizeHomeItems(arrayMove(currentItems, oldIndex, newIndex))
            setCurrentItems(newItems)
            updateHomeItems({ items: newItems }, {
                onSuccess: () => {
                    // toast.success("Home items reordered")
                },
            })
        }
    }, [currentItems, updateHomeItems])

    function normalizeHomeItems(items: Models_HomeItem[]) {
        let newItems = items.filter(item => !!HOME_ITEMS[item.type])
        newItems = newItems.map(item => ({
            ...item,
            schemaVersion: HOME_ITEMS[item.type].schemaVersion,
        }))
        return newItems
    }

    const handleAddItem = (type: string) => {
        const newItem: Models_HomeItem = {
            id: uuidv4(),
            type,
            schemaVersion: HOME_ITEMS[type].schemaVersion,
        }

        const newItems = normalizeHomeItems([...currentItems, newItem])
        setCurrentItems(newItems)
        updateHomeItems({ items: newItems }, {
            onSuccess: () => {
                toast.success(t("toasts.home.itemAdded"))
            },
        })
    }

    const handleRemoveItem = (id: string) => {
        const newItems = normalizeHomeItems(currentItems.filter(item => item.id !== id))
        setCurrentItems(newItems)
        updateHomeItems({ items: newItems }, {
            onSuccess: () => {
                toast.success(t("toasts.home.itemRemoved"))
            },
        })
    }

    const handleUpdateItemOptions = (id: string, options: any) => {
        const newItems = normalizeHomeItems(currentItems.map(item =>
            item.id === id
                ? { ...item, options }
                : item,
        ))
        setCurrentItems(newItems)
        updateHomeItems({ items: newItems }, {
            onSuccess: () => {
                toast.success(t("toasts.home.layoutUpdated"))
                setOptionsModalOpen(null)
            },
        })
    }

    const animeLibraryType = (serverStatus?.torrentstreamSettings?.includeInLibrary || serverStatus?.debridSettings?.includeDebridStreamInLibrary || serverStatus?.settings?.library?.includeOnlineStreamingInLibrary)
        ?
        "stream"
        : "local"

    const { mutateAsync: updateSettings, isPending: isSavingSettings } = useSaveSettings()
    const { mutateAsync: updateTorrentstreamSettings, isPending: isSavingTorrentstreamSettings } = useSaveTorrentstreamSettings()
    const { mutateAsync: updateDebridSettings, isPending: isSavingDebridSettings } = useSaveDebridSettings()
    const queryClient = useQueryClient()

    return (
        <>
            <Modal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                title={<div className="flex items-center gap-2 w-full justify-center">
                    <IoHomeOutline className="size-5" />
                    {t("home.settings.title")}
                </div>}
                contentClass={cn(
                    "max-w-5xl bg-gray-950 bg-opacity-90 sm:rounded-3xl",
                    ts.enableBlurringEffects && "bg-gray-950 bg-opacity-80 backdrop-blur-sm firefox:bg-opacity-100 firefox:backdrop-blur-none",
                )}
                overlayClass={cn(ts.enableBlurringEffects && "bg-gray-950/70 backdrop-blur-sm")}
            >
                {/*<GlowingEffect*/}
                {/*    variant="classic"*/}
                {/*    spread={40}*/}
                {/*    glow={true}*/}
                {/*    disabled={false}*/}
                {/*    proximity={64}*/}
                {/*    inactiveZone={0.01}*/}
                {/*    className="opacity-50 !mt-0"*/}
                {/*/>*/}

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <LuCirclePlay className="size-5" />
                            <h4 className="text-lg font-semibold">{t("home.settings.animeLibrary.title")}</h4>
                        </div>

                        <RadioGroup
                            value={animeLibraryType}
                            onValueChange={value => {
                                (async () => {
                                    await Promise.all([
                                        updateSettings({
                                            ...(serverStatus?.settings as any),
                                            library: {
                                                ...(serverStatus?.settings?.library as any)!,
                                                includeOnlineStreamingInLibrary: value === "stream",
                                            },
                                        }),
                                        updateTorrentstreamSettings({
                                            settings: {
                                                ...(serverStatus?.torrentstreamSettings as any),
                                                includeInLibrary: value === "stream",
                                            },
                                        }),
                                        updateDebridSettings({
                                            settings: {
                                                ...(serverStatus?.debridSettings as any),
                                                includeDebridStreamInLibrary: value === "stream",
                                            },
                                        }),
                                    ])
                                    await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ANIME_COLLECTION.GetLibraryCollection.key] })
                                    await queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ANIME_ENTRIES.GetMissingEpisodes.key] })
                                })()
                            }}
                            disabled={isSavingSettings || isSavingTorrentstreamSettings || isSavingDebridSettings}
                            options={[
                                { label: t("home.settings.animeLibrary.localOnly"), value: "local" },
                                { label: t("home.settings.animeLibrary.localAndStreaming"), value: "stream" },
                            ]}

                            {...{
                                itemClass: cn(
                                    "border-transparent absolute top-2 right-2 bg-transparent dark:bg-transparent dark:data-[state=unchecked]:bg-transparent",
                                    "data-[state=unchecked]:bg-transparent data-[state=unchecked]:hover:bg-transparent dark:data-[state=unchecked]:hover:bg-transparent",
                                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
                                ),
                                stackClass: "space-y-0 flex flex-row gap-2",
                                itemIndicatorClass: "hidden",
                                itemLabelClass: "font-normal tracking-wide line-clamp-1 truncate flex flex-col items-center data-[state=checked]:text-[--gray] cursor-pointer",
                                itemContainerClass: cn(
                                    "items-start cursor-pointer transition border-transparent rounded-[--radius] py-1.5 px-3 w-full",
                                    "hover:bg-[--subtle] dark:bg-gray-900",
                                    "data-[state=checked]:bg-white dark:data-[state=unchecked]:hover:bg-gray-800 dark:data-[state=checked]:bg-gray-900",
                                    "focus:ring-2 ring-transparent dark:ring-transparent outline-none ring-offset-1 ring-offset-[--background] focus-within:ring-2 transition",
                                    "border border-transparent data-[state=checked]:border-gray-500 data-[state=checked]:ring-offset-0",
                                ),
                            }}
                            // value={pageFit}
                            // onValueChange={(value) => setPageFit(value)}
                            // help={<>
                            //     <p>'Contain': Fit Height</p>
                            //     <p>'Overflow': Height overflow</p>
                            //     <p>'Cover': Fit Width</p>
                            //     <p>'True Size': No scaling, raw sizes</p>
                            // </>}
                        />

                        <p className="text-sm text-[--muted] pt-4">
                            {animeLibraryType === "local"
                                ? t("home.settings.animeLibrary.localOnlyDescription")
                                : t("home.settings.animeLibrary.localAndStreamingDescription")}
                        </p>


                    </div>

                    <div
                        className={cn(
                            // isNakamaLibrary && "pointer-events-none opacity-30",
                            "hidden lg:block",
                        )}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <LuLayoutPanelLeft className="size-5" />
                            <h4 className="text-lg font-semibold">{t("home.settings.layout.title")}</h4>
                        </div>

                        {isLoadingHomeItems ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <DndContext
                                modifiers={[restrictToVerticalAxis]}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={currentItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2 bg-gray-900/30 rounded-xl p-4 border border-gray-800">
                                        {currentItems.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                {t("home.settings.layout.empty")}
                                            </div>
                                        ) : (
                                            currentItems.map((item, index) => (
                                                <SortableHomeItem
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    onRemove={handleRemoveItem}
                                                    onEditOptions={setOptionsModalOpen}
                                                    isUpdating={isUpdatingHomeItems}
                                                />
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>


                    <div
                        className={cn(
                            // isNakamaLibrary && "pointer-events-none opacity-30",
                            "hidden lg:block",
                        )}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BiPlus className="size-5" />
                            <h4 className="text-lg font-semibold">{t("home.settings.availableItems.title")}</h4>
                        </div>

                        {availableItems.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                {t("home.settings.availableItems.empty")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableItems.toSorted((a, b) => getHomeItemName(t, a).localeCompare(getHomeItemName(t, b))).map((itemType) => (
                                    <AvailableHomeItem
                                        key={itemType}
                                        id={itemType}
                                        type={itemType}
                                        onAdd={handleAddItem}
                                        isUpdating={isUpdatingHomeItems}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {optionsModalOpen && (
                <HomeItemOptionsModal
                    id={optionsModalOpen}
                    item={currentItems.find(item => item.id === optionsModalOpen)!}
                    isOpen={!!optionsModalOpen}
                    onClose={() => setOptionsModalOpen(null)}
                    onSave={handleUpdateItemOptions}
                    isUpdating={isUpdatingHomeItems}
                />
            )}
        </>
    )
}

interface SortableHomeItemProps {
    item: Models_HomeItem
    onRemove: (id: string) => void
    onEditOptions: (id: string) => void
    isUpdating: boolean
    index: number
}

function SortableHomeItem({ item, onRemove, onEditOptions, isUpdating, index }: SortableHomeItemProps) {
    const { t } = useTranslation()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform ? { ...transform, scaleY: 1 } : null),
        transition,
    }

    const homeItemConfig = HOME_ITEMS[item.type]
    const Icon = HOME_ITEM_ICONS[item.type as keyof typeof HOME_ITEM_ICONS] || IoHomeOutline

    if (!homeItemConfig) return null

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors cursor-move",
                homeItemConfig.kind.length === 1 && homeItemConfig.kind[0] === "header" && index !== 0 && "opacity-50",
            )}
        >

            <div className="p-2 bg-gray-700/50 rounded-lg">
                <Icon className="size-5 text-gray-300" />
            </div>

            <div className="flex-1">
                <div className="font-medium text-white">{getHomeItemName(t, item.type)}{!!item.options?.name && `: "${item.options.name}"`}
                    {(item.type === "centered-title" && item.options?.text) && `: "${item.options.text}"`}
                    {(item.type === "my-lists") && `: ${item.options?.type === "manga" ? t("mediaFilters.options.types.manga") : t("mediaFilters.options.types.anime")}`}
                </div>
                <p className="text-xs text-[--muted] line-clamp-1">
                    {getHomeItemDescription(t, item.type)}
                </p>
                <div className="text-sm text-gray-400">
                    {homeItemConfig.kind.map(k => getHomeItemKindLabel(t, k)).join(", ")}
                </div>
            </div>

            <div className="flex items-center gap-1">
                {homeItemConfig.options && (
                    <IconButton
                        intent="gray-subtle"
                        size="sm"
                        onClick={() => onEditOptions(item.id)}
                        disabled={isUpdating}
                        className={cn(
                            "hover:bg-blue-500/20 hover:text-blue-400",
                            homeItemConfig.options?.find(n => n.name === "name") && !item.options?.name?.length && "bg-fuchsia-600 animate-bounce",
                        )}
                        icon={<BiCog className="size-4" />}
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                )}

                <IconButton
                    intent="gray-subtle"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    disabled={isUpdating}
                    className="hover:bg-red-500/20 hover:text-red-400"
                    icon={<BiTrash className="size-4" />}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    )
}

interface AvailableHomeItemProps {
    id: string
    type: string
    onAdd: (id: string) => void
    isUpdating: boolean
}

function AvailableHomeItem({ id, type, onAdd, isUpdating }: AvailableHomeItemProps) {
    const { t } = useTranslation()
    const homeItemConfig = HOME_ITEMS[type]
    const Icon = HOME_ITEM_ICONS[type as keyof typeof HOME_ITEM_ICONS] || IoHomeOutline

    if (!homeItemConfig) return null

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                <Icon className="size-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>

            <div className="flex-1">
                <div className="font-medium text-white">{getHomeItemName(t, type)}</div>
                <p className="text-xs text-[--muted]">
                    {getHomeItemDescription(t, type)}
                </p>
                <div className="text-sm text-gray-400">
                    {homeItemConfig.kind.map(k => getHomeItemKindLabel(t, k)).join(", ")}
                </div>
            </div>

            <Button
                intent="primary-subtle"
                size="sm"
                onClick={() => onAdd(type)}
                disabled={isUpdating}
                leftIcon={<BiPlus />}
            >
                {t("common.buttons.add")}
            </Button>
        </div>
    )
}

interface HomeItemOptionsModalProps {
    id: string
    item: Models_HomeItem
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, options: any) => void
    isUpdating: boolean
}

function HomeItemOptionsModal({ id, item, isOpen, onClose, onSave, isUpdating }: HomeItemOptionsModalProps) {
    const { t } = useTranslation()
    const homeItemConfig = HOME_ITEMS[item.type]
    const [formData, setFormData] = React.useState<Record<string, any>>(item.options || {})

    React.useEffect(() => {
        if (!homeItemConfig || homeItemConfig.schemaVersion !== item.schemaVersion) {
            setFormData({})
            return
        }
        setFormData(item.options || {})
    }, [item.options, homeItemConfig])

    if (!homeItemConfig?.options) return null

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value,
        }))
    }

    const handleSave = () => {
        onSave(id, formData)
    }

    return (
        <Modal
            open={isOpen}
            onOpenChange={onClose}
            title={
                <div className="flex items-center gap-2">
                    <BiCog className="size-5" />
                    {t("home.settings.configure.title", { name: getHomeItemName(t, item.type) })}
                </div>
            }
            contentClass="max-w-2xl bg-gray-950 bg-opacity-90 firefox:bg-opacity-100 firefox:backdrop-blur-none sm:rounded-3xl"
            overlayClass="bg-black/80"
        >
            <div className="space-y-6">
                <div className="text-sm text-gray-400">
                    {t("home.settings.configure.description")}
                </div>

                <div className="space-y-4">
                    {(homeItemConfig.options || []).map((option: any) => (
                        <OptionField
                            key={option.name}
                            itemType={item.type}
                            option={option}
                            value={formData[option.name]}
                            onChange={(value) => handleFieldChange(option.name, value)}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                    <Button
                        intent="gray-subtle"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        {t("common.buttons.cancel")}
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleSave}
                        loading={isUpdating}
                    >
                        {t("common.buttons.save")}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

interface OptionFieldProps {
    itemType: string
    option: any
    value: any
    onChange: (value: any) => void
}

function OptionField({ itemType, option, value, onChange }: OptionFieldProps) {
    const { t } = useTranslation()
    const { label, type, name, options, min, max } = option
    const localizedLabel = getHomeOptionLabel(t, name, label)

    const handleMultiSelectChange = (selectedValue: string) => {
        const currentValues = Array.isArray(value) ? value : []
        const newValues = currentValues.includes(selectedValue)
            ? currentValues.filter((v: any) => v !== selectedValue)
            : [...currentValues, selectedValue]
        onChange(newValues)
    }

    switch (type) {
        case "text":
            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{localizedLabel}</label>
                    <TextInput
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={t("home.settings.placeholders.enter", { label: localizedLabel.toLowerCase() })}
                    />
                </div>
            )

        case "number":
            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{localizedLabel}</label>
                    <NumberInput
                        value={value || min || 0}
                        onValueChange={(valueAsNumber) => onChange(valueAsNumber)}
                        min={min}
                        max={max}
                        formatOptions={{ useGrouping: false }}
                    />
                </div>
            )

        case "select":
            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{localizedLabel}</label>
                    <Select
                        value={value || ""}
                        onValueChange={onChange}
                        placeholder={t("home.settings.placeholders.select", { label: localizedLabel.toLowerCase() })}
                        options={[
                            ...options.map((opt: any) => ({
                                ...opt,
                                label: getHomeOptionValueLabel(t, itemType, name, opt),
                            })),
                        ]}
                    />
                </div>
            )

        case "multi-select":
            const selectedValues = Array.isArray(value) ? value : []
            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">{localizedLabel}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleMultiSelectChange(opt.value)}
                                className={cn(
                                    "p-2 text-sm rounded-md border transition-colors text-left",
                                    selectedValues.includes(opt.value)
                                        ? "bg-brand-500/20 border-brand-500 text-brand-300"
                                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600",
                                )}
                            >
                                {getHomeOptionValueLabel(t, itemType, name, opt)}
                            </button>
                        ))}
                    </div>
                    {/*{selectedValues.length > 0 && (*/}
                    {/*    <div className="text-xs text-gray-400">*/}
                    {/*        {selectedValues.length} selected: {selectedValues.slice(0, 3).join(", ")}*/}
                    {/*        {selectedValues.length > 3 && ` +${selectedValues.length - 3} more`}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            )

        default:
            return (
                <div className="text-sm text-gray-400">
                    {t("home.settings.unsupportedFieldType", { type })}
                </div>
            )
    }
}
