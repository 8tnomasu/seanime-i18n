import { useExternalPlayerLink } from "@/app/(main)/_atoms/playback.atoms"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert } from "@/components/ui/alert"
import { Field } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { TextInput } from "@/components/ui/text-input"
import { getDefaultIinaSocket, getDefaultMpvSocket } from "@/lib/server/settings"
import React from "react"
import { useWatch } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { FcClapperboard, FcVideoCall, FcVlc } from "react-icons/fc"
import { HiPlay } from "react-icons/hi"
import { IoPlayForwardCircleSharp } from "react-icons/io5"
import { LuCircleArrowOutUpRight, LuMonitorPlay } from "react-icons/lu"
import { RiSettings3Fill } from "react-icons/ri"

type MediaplayerSettingsProps = {
    isPending: boolean
}

export function MediaplayerSettings(props: MediaplayerSettingsProps) {
    const { t } = useTranslation()

    const {
        isPending,
    } = props

    const serverStatus = useServerStatus()
    const selectedPlayer = useWatch({ name: "defaultPlayer" })

    return (
        <>
            <SettingsPageHeader
                title={t("settings.pages.mediaPlayer.title")}
                description={t("settings.pages.mediaPlayer.description")}
                icon={LuMonitorPlay}
            />

            <SettingsCard>
                <Field.Select
                    name="defaultPlayer"
                    label={t("settings.fields.defaultPlayer")}
                    leftIcon={<FcVideoCall />}
                    options={[
                        { label: t("settings.mediaPlayer.playerOptions.mpv"), value: "mpv" },
                        { label: t("settings.mediaPlayer.playerOptions.vlc"), value: "vlc" },
                        { label: t("settings.mediaPlayer.playerOptions.mpcHcWindows"), value: "mpc-hc" },
                        { label: t("settings.mediaPlayer.playerOptions.iinaMacOs"), value: "iina" },
                    ]}
                    help={t("settings.mediaPlayer.defaultPlayerHelp")}
                />
                {selectedPlayer === "iina" && <Alert
                    intent="info-basic"
                    description={
                        <Trans
                            i18nKey="settings.mediaPlayer.iinaAlert"
                            components={[
                                <p />,
                                <strong />,
                                <span className="underline" />,
                                <strong />,
                                <span className="underline" />,
                            ]}
                        />
                    }
                />}
            </SettingsCard>

            <SettingsCard title={t("settings.common.playback")}>
                <Field.Switch
                    side="right"
                    name="autoPlayNextEpisode"
                    label={t("settings.mediaPlayer.automaticallyPlayNextEpisode")}
                    help={t("settings.mediaPlayer.automaticallyPlayNextEpisodeHelp")}
                />
            </SettingsCard>

            <SettingsCard title={t("settings.common.configuration")}>


                <Field.Text
                    name="mediaPlayerHost"
                    label={t("settings.fields.host")}
                    help={t("settings.mediaPlayer.hostHelp")}
                />

                <Accordion
                    type="single"
                    className=""
                    triggerClass="text-[--muted] dark:data-[state=open]:text-white px-0 dark:hover:bg-transparent hover:bg-transparent dark:hover:text-white hover:text-black"
                    itemClass=""
                    contentClass="p-4 border rounded-[--radius-md]"
                    collapsible
                    defaultValue={serverStatus?.settings?.mediaPlayer?.defaultPlayer}
                >
                    <AccordionItem value="vlc">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><FcVlc /> {t("settings.mediaPlayer.playerOptions.vlc")}</h4>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Field.Text
                                    name="vlcUsername"
                                    label={t("settings.fields.username")}
                                />
                                <Field.Text
                                    name="vlcPassword"
                                    label={t("settings.fields.password")}
                                    type="password"
                                />
                                <Field.Number
                                    name="vlcPort"
                                    label={t("settings.fields.port")}
                                    formatOptions={{
                                        useGrouping: false,
                                    }}
                                    hideControls
                                />
                            </div>
                            <Field.Text
                                name="vlcPath"
                                label={t("settings.fields.applicationPath")}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mpc-hc">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><FcClapperboard /> {t("settings.mediaPlayer.playerOptions.mpcHc")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Field.Number
                                    name="mpcPort"
                                    label={t("settings.fields.port")}
                                    formatOptions={{
                                        useGrouping: false,
                                    }}
                                    hideControls
                                />
                                <Field.Text
                                    name="mpcPath"
                                    label={t("settings.fields.applicationPath")}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mpv">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><HiPlay className="mr-1 text-purple-100" /> {t("settings.mediaPlayer.playerOptions.mpv")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex gap-4">
                                <Field.Text
                                    name="mpvSocket"
                                    label={t("settings.fields.socket")}
                                    placeholder={t("settings.mediaPlayer.defaultSocketPlaceholder", { value: getDefaultMpvSocket(serverStatus?.os ?? "") })}
                                />
                                <Field.Text
                                    name="mpvPath"
                                    label={t("settings.fields.applicationPath")}
                                    placeholder={serverStatus?.os === "windows" ? t("settings.mediaPlayer.examplePathPlaceholder", { value: "C:/Program Files/mpv/mpv.exe" }) : serverStatus?.os === "darwin"
                                        ? t("settings.mediaPlayer.examplePathPlaceholder", { value: "/Applications/mpv.app/Contents/MacOS/mpv" })
                                        : t("settings.mediaPlayer.defaultsToCli")}
                                    help={t("settings.mediaPlayer.leaveEmptyToUseCli")}
                                />
                            </div>
                            <div>
                                <Field.Text
                                    name="mpvArgs"
                                    label={t("settings.fields.options")}
                                    placeholder={t("settings.mediaPlayer.mpvOptionsPlaceholder")}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="iina">
                        <AccordionTrigger>
                            <h4 className="flex gap-2 items-center"><IoPlayForwardCircleSharp className="mr-1 text-purple-100" /> {t("settings.mediaPlayer.playerOptions.iina")}</h4>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex gap-4">
                                <Field.Text
                                    name="iinaSocket"
                                    label={t("settings.fields.socket")}
                                    placeholder={t("settings.mediaPlayer.defaultSocketPlaceholder", { value: getDefaultIinaSocket(serverStatus?.os ?? "") })}
                                />
                                <Field.Text
                                    name="iinaPath"
                                    label={t("settings.fields.cliPath")}
                                    placeholder={t("settings.mediaPlayer.iinaCliPathPlaceholder")}
                                    help={t("settings.mediaPlayer.leaveEmptyToUseCli")}
                                />
                            </div>
                            <div>
                                <Field.Text
                                    name="iinaArgs"
                                    label={t("settings.fields.options")}
                                    placeholder={t("settings.mediaPlayer.iinaOptionsPlaceholder")}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SettingsCard>

            <SettingsSubmitButton isPending={isPending} />

        </>
    )
}

export function ExternalPlayerLinkSettings() {
    const { t } = useTranslation()

    const { externalPlayerLink, setExternalPlayerLink, encodePath, setEncodePath } = useExternalPlayerLink()

    return (
        <>
            <SettingsPageHeader
                title={t("settings.pages.externalPlayerLink.title")}
                description={t("settings.pages.externalPlayerLink.description")}
                icon={LuCircleArrowOutUpRight}
            />

            <Alert
                intent="info" description={<>
                {t("settings.externalPlayerLink.onlyAppliesToThisDevice")}
            </>}
            />

            <SettingsCard>
                <div data-settings-external-player-link-scheme>
                    <TextInput
                        label={t("settings.fields.customScheme")}
                        placeholder={t("settings.externalPlayerLink.customSchemePlaceholder")}
                        value={externalPlayerLink}
                        onValueChange={setExternalPlayerLink}
                    />
                </div>
            </SettingsCard>

            <SettingsCard>
                <Switch
                    side="right"
                    name="encodePath"
                    label={t("settings.externalPlayerLink.encodeFilePathInUrl")}
                    help={t("settings.externalPlayerLink.encodeFilePathInUrlHelp")}
                    value={encodePath}
                    onValueChange={setEncodePath}
                />
            </SettingsCard>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-800 border-dashed">
                <RiSettings3Fill className="text-base" />
                <span>{t("settings.common.savedAutomatically")}</span>
            </div>
        </>
    )
}
