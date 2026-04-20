import { useListMangaProviderExtensions } from "@/api/hooks/extensions.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { useStoredMangaProviders } from "@/app/(main)/manga/_lib/handle-manga-selected-provider"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/form"
import { atom } from "jotai"
import { useAtom } from "jotai/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { LuBookOpen } from "react-icons/lu"
import { toast } from "sonner"

type MangaSettingsProps = {
    isPending: boolean
}

const __manga_storedProvidersHistoryAtom = atom<Record<string, string> | null>(null)

export function MangaSettings(props: MangaSettingsProps) {
    const { t } = useTranslation()

    const {
        isPending,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const f = useFormContext()

    const { data: extensions } = useListMangaProviderExtensions()

    const { storedProviders, overwriteStoredProviders, overwriteStoredProvidersWith } = useStoredMangaProviders(extensions)
    const [storedProvidersHistory, setStoredProvidersHistory] = useAtom(__manga_storedProvidersHistoryAtom)

    const options = React.useMemo(() => {
        return [
            { label: t("common.words.auto"), value: "-" },
            ...(extensions?.map(provider => ({
                label: provider.name,
                value: provider.id,
            })) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
        ]
    }, [extensions, t])

    const defaultProviderExt = extensions?.find(e => e.id === serverStatus?.settings?.manga?.defaultMangaProvider)

    const confirmDialog = useConfirmationDialog({
        title: t("settings.manga.overwriteAllSourcesTitle"),
        description: t("settings.manga.overwriteAllSourcesDescription"),
        actionText: t("common.buttons.overwrite"),
        actionIntent: "warning",
        onConfirm: async () => {
            if (!defaultProviderExt) return
            const oldProviders = structuredClone(storedProviders)
            overwriteStoredProvidersWith(defaultProviderExt.id)
            toast.success(t("toasts.settings.mangaSourcesOverwritten"))
            setTimeout(() => {
                setStoredProvidersHistory(oldProviders)
            }, 500)
        },
    })

    return (
        <>
            <SettingsPageHeader
                title={t("settings.pages.manga.title")}
                description={t("settings.pages.manga.description")}
                icon={LuBookOpen}
            />

            <SettingsCard>
                <Field.Switch
                    side="right"
                    name="enableManga"
                    label={<span className="flex gap-1 items-center">{t("settings.fields.enable")}</span>}
                    help={t("settings.manga.enableHelp")}
                />
            </SettingsCard>

            <SettingsCard>
                <Field.Select
                    name="defaultMangaProvider"
                    label={t("settings.fields.defaultProvider")}
                    help={t("settings.manga.defaultProviderHelp")}
                    options={options}
                />
                {(!!defaultProviderExt && f.watch("defaultMangaProvider") === serverStatus?.settings?.manga?.defaultMangaProvider) && (
                    <div className="flex w-full space-x-4 flex-wrap">
                        <Button className="px-0 py-1" intent="warning-link" onClick={() => confirmDialog.open()}>
                            {t("settings.manga.overwriteAllSourcesWithProvider", { provider: defaultProviderExt.name })}
                        </Button>
                        {!!storedProvidersHistory && (
                            <Button
                                className="px-0 py-1" intent="gray-link" onClick={() => {
                                overwriteStoredProviders(storedProvidersHistory)
                                toast.success(t("toasts.settings.mangaSourcesRestored"))
                                setStoredProvidersHistory(null)
                            }}
                            >
                                {t("common.buttons.undo")}
                            </Button>
                        )}
                    </div>
                )}
                <Field.Switch
                    side="right"
                    name="mangaAutoUpdateProgress"
                    label={t("settings.manga.autoUpdateProgress")}
                    help={t("settings.manga.autoUpdateProgressHelp")}
                />
            </SettingsCard>

            <SettingsCard title={t("settings.common.localProvider")} description={t("settings.manga.localProviderDescription")}>

                <Field.DirectorySelector
                    name="mangaLocalSourceDirectory"
                    label={t("settings.fields.localSourceDirectory")}
                    help={t("settings.manga.localSourceDirectoryHelp")}
                />
            </SettingsCard>

            <ConfirmationDialog {...confirmDialog} />

            <SettingsSubmitButton isPending={isPending} />
        </>
    )
}
