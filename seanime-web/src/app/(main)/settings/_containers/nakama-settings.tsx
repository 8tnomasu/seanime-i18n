import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { SettingsCard, SettingsPageHeader } from "@/app/(main)/settings/_components/settings-card"
import { SettingsSubmitButton } from "@/app/(main)/settings/_components/settings-submit-button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/components/ui/core/styling"
import { Field } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useState } from "react"
import { useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MdOutlineConnectWithoutContact } from "react-icons/md"

type Props = {
    isPending: boolean
    children?: React.ReactNode
}

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

export function NakamaSettings(props: Props) {
    const { t } = useTranslation()

    const {
        isPending,
        children,
        ...rest
    } = props

    const serverStatus = useServerStatus()
    const nakamaIsHost = useWatch({ name: "nakamaIsHost" })

    const [tab, setTab] = useState("peer")

    React.useLayoutEffect(() => {
        setTab(serverStatus?.settings?.nakama?.isHost ? "host" : "peer")
    }, [serverStatus?.settings?.nakama?.isHost])


    return (
        <div className="space-y-4">

            <SettingsPageHeader
                title={t("settings.pages.nakama.title")}
                description={t("settings.pages.nakama.description")}
                icon={MdOutlineConnectWithoutContact}
            />

            <SettingsCard>
                <Field.Switch
                    side="right"
                    name="nakamaEnabled"
                    label={t("settings.nakama.enableNakama")}
                />

                <Field.Text
                    label={t("settings.fields.username")}
                    name="nakamaUsername"
                    placeholder={t("settings.fields.username")}
                    help={t("settings.nakama.usernameHelp")}
                />
            </SettingsCard>

            <Tabs
                value={tab}
                onValueChange={setTab}
                className={tabsRootClass}
                triggerClass={tabsTriggerClass}
                listClass={tabsListClass}
            >
                <TabsList className="flex-wrap max-w-full bg-[--paper] p-2 border rounded-xl">
                    <TabsTrigger value="peer">{t("settings.nakama.connectAsPeer")}</TabsTrigger>
                    <TabsTrigger value="host">{t("settings.nakama.hosting")} {serverStatus?.settings?.nakama?.isHost &&
                        <Badge intent="info" className="ml-3">{t("settings.nakama.currentlyHosting")}</Badge>}</TabsTrigger>
                    {/*<TabsTrigger value="browser-client">Rendering</TabsTrigger>*/}
                </TabsList>

                <TabsContent value="host" className={tabContentClass}>

                    {!serverStatus?.serverHasPassword &&
                        <Alert
                            intent="warning"
                            title={t("settings.nakama.reminderTitle")}
                            description={t("settings.nakama.reminderDescription")}
                        />}

                    <SettingsCard className="!bg-gray-900 text-sm">
                        <div>
                            <p>
                                {t("settings.nakama.hostModeDescription")}
                            </p>
                            <p>
                                {t("settings.nakama.cloudRoomsPrefix")} <strong>{t("settings.nakama.cloudRoomsName")}</strong> {t("settings.nakama.cloudRoomsSuffix")}
                            </p>
                        </div>
                    </SettingsCard>

                    <SettingsCard>

                        <Field.Switch
                            side="right"
                            name="nakamaIsHost"
                            label={t("settings.nakama.enableHostMode")}
                            // moreHelp="Password must be set in the config file"
                            help={t("settings.nakama.enableHostModeHelp")}
                        />

                        <Field.Text
                            label={t("settings.fields.passcode")}
                            name="nakamaHostPassword"
                            placeholder={t("settings.fields.passcode")}
                            type="password"
                            help={t("settings.nakama.hostPasscodeHelp")}
                        />

                        {/*<Field.Switch*/}
                        {/*    side="right"*/}
                        {/*    name="nakamaHostEnablePortForwarding"*/}
                        {/*    label="Enable port forwarding"*/}
                        {/*    moreHelp="This might not work for all networks."*/}
                        {/*    help="If enabled, this server will expose its port to the internet. This might be required for other clients to connect to this server."*/}
                        {/*/>*/}
                    </SettingsCard>

                    {nakamaIsHost && <SettingsCard title={t("settings.common.settings")}>

                        <Field.Switch
                            side="right"
                            name="nakamaHostShareLocalAnimeLibrary"
                            label={t("settings.nakama.shareLocalAnimeLibrary")}
                            help={t("settings.nakama.shareLocalAnimeLibraryHelp")}
                        />

                        <Field.MediaExclusionSelector
                            name="nakamaHostUnsharedAnimeIds"
                            label={t("settings.nakama.excludeAnimeFromSharing")}
                            help={t("settings.nakama.excludeAnimeFromSharingHelp")}
                        />
                    </SettingsCard>}
                </TabsContent>

                <TabsContent value="peer" className={tabContentClass}>
                    <SettingsCard>
                        {serverStatus?.settings?.nakama?.isHost && <Alert intent="info" description={t("settings.nakama.cannotConnectWhileHosting")} />}

                        <div
                            className={cn(
                                "space-y-4",
                                serverStatus?.settings?.nakama?.isHost ? "hidden" : "",
                            )}
                        >

                            <Field.Text
                                label={t("settings.nakama.serverUrl")}
                                name="nakamaRemoteServerURL"
                                placeholder={t("settings.nakama.serverUrlPlaceholder")}
                                help={t("settings.nakama.serverUrlHelp")}
                            />

                            <Field.Text
                                label={t("settings.nakama.remotePasscode")}
                                name="nakamaRemoteServerPassword"
                                placeholder={t("settings.fields.passcode")}
                                help={t("settings.nakama.remotePasscodeHelp")}
                                type="password"
                            />
                        </div>
                    </SettingsCard>

                    {!serverStatus?.settings?.nakama?.isHost && <SettingsCard title={t("settings.common.settings")}>
                        <Field.Switch
                            side="right"
                            name="includeNakamaAnimeLibrary"
                            label={t("settings.nakama.useSharedAnimeLibrary")}
                            help={t("settings.nakama.useSharedAnimeLibraryHelp")}
                        />
                    </SettingsCard>}
                </TabsContent>

            </Tabs>

            <SettingsSubmitButton isPending={isPending} />

        </div>
    )
}
