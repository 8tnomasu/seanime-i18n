import { Models_TorrentstreamSettings } from "@/api/generated/types"
import { useSaveTorrentstreamSettings, useTorrentstreamDropTorrent } from "@/api/hooks/torrentstream.hooks"
import { AutoSelectProfileButton } from "@/app/(main)/settings/_components/autoselect-profile-form"
import { SettingsCard } from "@/app/(main)/settings/_components/settings-card"
import { SettingsIsDirty, SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { defineSchema, Field, Form } from "@/components/ui/form"
import React from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FcFolder } from "react-icons/fc"
import { SiBittorrent } from "react-icons/si"
import { toast } from "sonner"

const torrentstreamSchema = defineSchema(({ z }) => z.object({
    enabled: z.boolean(),
    downloadDir: z.string(),
    autoSelect: z.boolean(),
    disableIPv6: z.boolean(),
    addToLibrary: z.boolean(),
    // streamingServerPort: z.number(),
    // streamingServerHost: z.string(),
    torrentClientHost: z.string().optional().default(""),
    torrentClientPort: z.number(),
    preferredResolution: z.string(),
    includeInLibrary: z.boolean(),
    streamUrlAddress: z.string().optional().default(""),
    slowSeeding: z.boolean().optional().default(false),
    preloadNextStream: z.boolean().optional().default(false),
}))


type TorrentstreamSettingsProps = {
    children?: React.ReactNode
    settings: Models_TorrentstreamSettings | undefined
}

export function TorrentstreamSettings(props: TorrentstreamSettingsProps) {
    const { t } = useTranslation()

    const {
        children,
        settings,
        ...rest
    } = props

    const { mutate, isPending } = useSaveTorrentstreamSettings()

    const { mutate: dropTorrent, isPending: droppingTorrent } = useTorrentstreamDropTorrent()

    const formRef = React.useRef<UseFormReturn<any>>(null)

    if (!settings) return null

    return (
        <>
            <Form
                schema={torrentstreamSchema}
                mRef={formRef}
                onSubmit={data => {
                    if (settings) {
                        mutate({
                                settings: {
                                    ...settings,
                                    ...data,
                                    preferredResolution: data.preferredResolution === "-" ? "" : data.preferredResolution,
                                },
                            },
                            {
                                onSuccess: () => {
                                    formRef.current?.reset(formRef.current.getValues())
                                    toast.success(t("toasts.settingsSaved"))
                                },
                            },
                        )
                    }
                }}
                defaultValues={{
                    enabled: settings.enabled,
                    autoSelect: settings.autoSelect,
                    downloadDir: settings.downloadDir || "",
                    disableIPv6: settings.disableIPV6,
                    addToLibrary: settings.addToLibrary,
                    // streamingServerPort: settings.streamingServerPort,
                    // streamingServerHost: settings.streamingServerHost || "",
                    torrentClientHost: settings.torrentClientHost || "",
                    torrentClientPort: settings.torrentClientPort,
                    preferredResolution: settings.preferredResolution || "-",
                    includeInLibrary: settings.includeInLibrary,
                    streamUrlAddress: settings.streamUrlAddress || "",
                    slowSeeding: settings.slowSeeding,
                    preloadNextStream: settings.preloadNextStream,
                }}
                stackClass="space-y-4"
            >
                {(f) => (
                    <>
                        <SettingsIsDirty />
                        <SettingsCard>
                            <Field.Switch
                                side="right"
                                name="enabled"
                                label={t("settings.fields.enable")}
                            />
                        </SettingsCard>

                        <SettingsCard title={t("settings.common.homeScreen")}>
                            <Field.Switch
                                side="right"
                                name="includeInLibrary"
                                label={t("settings.common.includeInAnimeLibrary")}
                                help={t("settings.common.includeInAnimeLibraryHelp")}
                            />
                        </SettingsCard>

                        {/*<SettingsCard title="Preloading">*/}
                        {/*    <Field.Switch*/}
                        {/*        side="right"*/}
                        {/*        name="preloadNextStream"*/}
                        {/*        label="Preload next stream"*/}
                        {/*        help="Starts downloading the next episode in the background."*/}
                        {/*    />*/}
                        {/*</SettingsCard>*/}

                        <SettingsCard title={t("settings.common.autoSelect")}>
                            <Field.Switch
                                side="right"
                                name="autoSelect"
                                label={t("settings.fields.enable")}
                                help={t("settings.torrentStreaming.autoSelectHelp")}
                            />

                            <Field.Select
                                name="preferredResolution"
                                label={t("settings.fields.preferredResolution")}
                                help={t("settings.torrentStreaming.preferredResolutionHelp")}
                                options={[
                                    { label: t("common.words.highest"), value: "-" },
                                    { label: "480p", value: "480" },
                                    { label: "720p", value: "720" },
                                    { label: "1080p", value: "1080" },
                                ]}
                            />

                            <div className="pt-2">
                                <AutoSelectProfileButton />
                            </div>
                        </SettingsCard>


                        {/*<Field.Switch
                         side="right"*/}
                        {/*    name="addToLibrary"*/}
                        {/*    label="Add to library"*/}
                        {/*    help="Keep completely downloaded files in corresponding library entries."*/}
                        {/*/>*/}

                        {/* <SettingsCard title="Torrent Client" description="Seanime uses a built-in torrent client to download torrents.">

                         </SettingsCard> */}

                        <Accordion
                            type="single"
                            collapsible
                            className="border rounded-[--radius-md]"
                            triggerClass="dark:bg-[--paper]"
                            contentClass="!pt-2 dark:bg-[--paper]"
                        >
                            <AccordionItem value="more">
                                <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">
                                    {t("settings.common.torrentClient")}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <div className="flex items-center gap-3">

                                        <Field.Text
                                            name="torrentClientHost"
                                            label={t("settings.fields.host")}
                                            help={t("settings.torrentStreaming.torrentClientHostHelp")}
                                        />

                                        <Field.Number
                                            name="torrentClientPort"
                                            label={t("settings.fields.port")}
                                            formatOptions={{
                                                useGrouping: false,
                                            }}
                                            help={t("settings.torrentStreaming.torrentClientPortHelp")}
                                        />

                                    </div>

                                    <Field.Switch
                                        side="right"
                                        name="disableIPv6"
                                        label={t("settings.torrentStreaming.disableIpv6")}
                                    />

                                    <Field.Switch
                                        side="right"
                                        name="slowSeeding"
                                        label={t("settings.torrentStreaming.slowSeeding")}
                                        moreHelp={t("settings.torrentStreaming.slowSeedingHelp")}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion
                            type="single"
                            collapsible
                            className="border rounded-[--radius-md]"
                            triggerClass="dark:bg-[--paper]"
                            contentClass="!pt-2 dark:bg-[--paper]"
                        >
                            <AccordionItem value="more">
                                <AccordionTrigger className="bg-gray-900 rounded-[--radius-md]">
                                    {t("settings.common.advanced")}
                                </AccordionTrigger>
                                <AccordionContent className="pt-6 space-y-4">
                                    <Field.Text
                                        name="streamUrlAddress"
                                        label={t("settings.fields.streamUrlAddress")}
                                        placeholder={t("settings.torrentStreaming.streamUrlAddressPlaceholder")}
                                        help={t("settings.torrentStreaming.streamUrlAddressHelp")}
                                    />

                                    <Field.DirectorySelector
                                        name="downloadDir"
                                        label={t("settings.fields.cacheDirectory")}
                                        leftIcon={<FcFolder />}
                                        help={t("settings.torrentStreaming.cacheDirectoryHelp")}
                                        shouldExist
                                    />
                                    <Alert
                                        intent="warning"
                                        description={t("settings.torrentStreaming.emptyDirectoryWarning")}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>


                        <div className="flex w-full items-center">
                            <SettingsSubmitButton isPending={isPending} />
                            <div className="flex flex-1"></div>
                            <Button
                                leftIcon={<SiBittorrent />} intent="alert-subtle" onClick={() => dropTorrent()}
                                disabled={droppingTorrent}
                            >
                                {t("settings.torrentStreaming.dropTorrent")}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    )
}
