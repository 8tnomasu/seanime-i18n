import { useScanLocalFiles } from "@/api/hooks/scan.hooks"
import { __anilist_userAnimeMediaAtom } from "@/app/(main)/_atoms/anilist.atoms"

import { useSeaCommandInject } from "@/app/(main)/_features/sea-command/use-inject"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { AppLayoutStack } from "@/components/ui/app-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/core/styling"
import { Modal } from "@/components/ui/modal"
import { RadioGroup } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useBoolean } from "@/hooks/use-disclosure"
import { useThemeSettings } from "@/lib/theme/theme-hooks"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { FiSearch } from "react-icons/fi"
import { Trans, useTranslation } from "react-i18next"

export const __scanner_modalIsOpen = atom(false)
export const __scanner_isScanningAtom = atom(false)


export function ScannerModal() {
    const { t } = useTranslation()
    const serverStatus = useServerStatus()
    const ts = useThemeSettings()
    const [isOpen, setOpen] = useAtom(__scanner_modalIsOpen)
    const [, setScannerIsScanning] = useAtom(__scanner_isScanningAtom)
    const [userMedia] = useAtom(__anilist_userAnimeMediaAtom)
    const anilistDataOnly = useBoolean(true)
    const skipLockedFiles = useBoolean(true)
    const skipIgnoredFiles = useBoolean(true)
    const enhanceWithOfflineDatabase = useBoolean(true)

    const { mutate: scanLibrary, isPending: isScanning } = useScanLocalFiles(() => {
        setOpen(false)
    })

    React.useEffect(() => {
        if (!userMedia?.length) anilistDataOnly.off()
        else anilistDataOnly.on()
    }, [userMedia])

    React.useEffect(() => {
        setScannerIsScanning(isScanning)
    }, [isScanning])

    function handleScan() {
        scanLibrary({
            enhanced: !anilistDataOnly.active,
            skipLockedFiles: skipLockedFiles.active,
            skipIgnoredFiles: skipIgnoredFiles.active,
            enhanceWithOfflineDatabase: enhanceWithOfflineDatabase.active,
        })
        setOpen(false)
    }

    const { inject, remove } = useSeaCommandInject()
    React.useEffect(() => {
        inject("scanner-controls", {
            priority: 1,
            items: [{
                id: "refresh",
                value: "refresh",
                heading: t("library.scanner.seaCommandGroup"),
                render: () => (
                    <p>{t("library.scanner.refreshLibrary")}</p>
                ),
                onSelect: ({ ctx }) => {
                    ctx.close()
                    setTimeout(() => {
                        handleScan()
                    }, 500)
                },
                showBasedOnInput: "startsWith",
            }],
            filter: ({ item, input }) => {
                if (!input) return true
                return item.value.toLowerCase().includes(input.toLowerCase())
            },
            shouldShow: ({ ctx }) => ctx.router.pathname === "/",
            showBasedOnInput: "startsWith",
        })

        return () => remove("scanner-controls")
    }, [inject, remove, t])

    return (
        <>
            <Modal
                data-scanner-modal
            open={isOpen}
                onOpenChange={o => {
                    // if (!isScanning) {
                    //     setOpen(o)
                    // }
                    setOpen(o)
                }}
                title={t("library.scanner.title")}
                titleClass="text-center"
                contentClass={cn(
                    "space-y-4 max-w-2xl bg-gray-950 bg-opacity-90 rounded-xl",
                    ts.enableBlurringEffects && "bg-gray-950 bg-opacity-80 backdrop-blur-sm firefox:bg-opacity-100 firefox:backdrop-blur-none",
                )}
                overlayClass={cn(ts.enableBlurringEffects && "bg-gray-950/70 backdrop-blur-sm")}
            >
                {/*<GlowingEffect*/}
                {/*    spread={50}*/}
                {/*    glow={true}*/}
                {/*    disabled={false}*/}
                {/*    proximity={100}*/}
                {/*    inactiveZone={0.01}*/}
                {/*    // movementDuration={4}*/}
                {/*    className="!mt-0 opacity-30"*/}
                {/*/>*/}



                {serverStatus?.user?.isSimulated && <div className="border border-dashed rounded-md py-2 px-4 !mt-5">
                    {t("library.scanner.guestWarning")}
                </div>}

                <div className="space-y-4" data-scanner-modal-content>

                    <AppLayoutStack className="space-y-2">
                        <h5 className="text-[--muted]">{t("library.scanner.sections.localFiles")}</h5>
                        <Switch
                            side="right"
                            label={t("library.scanner.options.skipLockedFiles")}
                            value={skipLockedFiles.active}
                            onValueChange={v => skipLockedFiles.set(v as boolean)}
                            // size="lg"
                        />
                        <Switch
                            side="right"
                            label={t("library.scanner.options.skipIgnoredFiles")}
                            value={skipIgnoredFiles.active}
                            onValueChange={v => skipIgnoredFiles.set(v as boolean)}
                            // size="lg"
                        />

                        <Separator />

                        <AppLayoutStack className="space-y-2">
                            <h5 className="text-[--muted]">{t("library.scanner.sections.matchingData")}</h5>
                            <Switch
                                side="right"
                                label={t("library.scanner.options.myAniListCollectionOnly")}
                                moreHelp={t("library.scanner.options.myAniListCollectionOnlyHelp")}
                                help={anilistDataOnly.active ? t("library.scanner.options.myAniListCollectionOnlyActiveHelp") : ""}
                                value={anilistDataOnly.active}
                                onValueChange={v => anilistDataOnly.set(v as boolean)}
                                // className="data-[state=checked]:bg-amber-700 dark:data-[state=checked]:bg-amber-700"
                                // size="lg"

                                disabled={!userMedia?.length}
                            />
                            {!anilistDataOnly.active && <RadioGroup
                                label={t("library.scanner.options.enhancedMatchingMethod")}
                                options={[
                                    { value: "database", label: t("library.scanner.options.useAnimeOfflineDatabase") },
                                    { value: "anilist", label: t("library.scanner.options.useAniListApi") },
                                ]}
                                size="lg"
                                stackClass="space-y-2 py-1"
                                value={enhanceWithOfflineDatabase.active ? "database" : "anilist"}
                                onValueChange={v => enhanceWithOfflineDatabase.set(v === "database")}
                                help={enhanceWithOfflineDatabase.active
                                    ? <span>{t("library.scanner.options.offlineDatabaseHelp")}</span>
                                    : (
                                        <Trans
                                            i18nKey="library.scanner.options.aniListApiHelp"
                                            components={{ 0: <span className="text-[--orange]" /> }}
                                        />
                                    )}
                            />}
                        </AppLayoutStack>

                    </AppLayoutStack>
                </div>
                <Button
                    onClick={handleScan}
                    intent="primary"
                    leftIcon={<FiSearch />}
                    loading={isScanning}
                    className="w-full"
                    disabled={!serverStatus?.settings?.library?.libraryPath}
                >
                    {t("common.buttons.scan")}
                </Button>
            </Modal>
        </>
    )

}
