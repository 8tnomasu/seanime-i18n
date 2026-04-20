import { getServerBaseUrl } from "@/api/client/server-url"
import { useImportLocalFiles } from "@/api/hooks/localfiles.hooks"
import { useServerHMACAuth } from "@/app/(main)/_hooks/use-server-status"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { TextInput } from "@/components/ui/text-input"
import { openTab } from "@/lib/helpers/browser"
import React from "react"
import { useTranslation } from "react-i18next"
import { CgImport } from "react-icons/cg"
import { TbDatabaseExport } from "react-icons/tb"
import { toast } from "sonner"

type DataSettingsProps = {
    children?: React.ReactNode
}

export function DataSettings(props: DataSettingsProps) {
    const { t } = useTranslation()

    const {
        children,
        ...rest
    } = props

    const { mutate: importLocalFiles, isPending: isImportingLocalFiles } = useImportLocalFiles()
    const [localFileDataPath, setLocalFileDataPath] = React.useState("")

    function handleImportLocalFiles() {
        if (!localFileDataPath) return

        importLocalFiles({ dataFilePath: localFileDataPath }, {
            onSuccess: () => {
                setLocalFileDataPath("")
            },
        })
    }

    const { getHMACTokenQueryParam } = useServerHMACAuth()

    const handleExportLocalFiles = React.useCallback(async () => {
        try {
            const endpoint = "/api/v1/library/local-files/dump"
            const tokenQuery = await getHMACTokenQueryParam(endpoint)
            openTab(`${getServerBaseUrl()}${endpoint}${tokenQuery}`)
        }
        catch (error) {
            toast.error(t("toasts.settings.exportTokenFailed"))
        }
    }, [getHMACTokenQueryParam, t])

    return (
        <div className="space-y-4">

            <div>
                <h5>{t("settings.data.localFilesTitle")}</h5>

                <p className="text-[--muted]">
                    {t("settings.data.localFilesDescription")}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    intent="primary-subtle"
                    leftIcon={<TbDatabaseExport className="text-xl" />}
                    size="md"
                    disabled={isImportingLocalFiles}
                    onClick={handleExportLocalFiles}
                >
                    {t("settings.data.exportLocalFileData")}
                </Button>

                <Modal
                    title={t("settings.data.importLocalFiles")}
                    trigger={
                        <Button
                            intent="white-subtle"
                            leftIcon={<CgImport className="text-xl" />}
                            size="md"
                            disabled={isImportingLocalFiles}
                        >
                            {t("settings.data.importLocalFiles")}
                        </Button>
                    }
                >

                    <p>
                        {t("settings.data.importWarning")}
                    </p>

                    <TextInput
                        label={t("settings.fields.dataFilePath")}
                        help={t("settings.data.dataFilePathHelp")}
                        value={localFileDataPath}
                        onValueChange={setLocalFileDataPath}
                    />

                    <Button
                        intent="white"
                        rounded
                        onClick={handleImportLocalFiles}
                        disabled={isImportingLocalFiles}
                    >{t("common.buttons.import")}</Button>

                </Modal>
            </div>
        </div>
    )
}
