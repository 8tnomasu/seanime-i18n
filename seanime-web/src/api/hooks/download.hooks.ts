import { useServerMutation } from "@/api/client/requests"
import { DownloadMacDenshiUpdate_Variables, DownloadRelease_Variables, DownloadTorrentFile_Variables } from "@/api/generated/endpoint.types"
import { API_ENDPOINTS } from "@/api/generated/endpoints"
import { DownloadReleaseResponse } from "@/api/generated/types"
import { useOpenInExplorer } from "@/api/hooks/explorer.hooks"
import i18n from "@/i18n"
import { toast } from "sonner"

export function useDownloadTorrentFile(onSuccess?: () => void) {
    return useServerMutation<boolean, DownloadTorrentFile_Variables>({
        endpoint: API_ENDPOINTS.DOWNLOAD.DownloadTorrentFile.endpoint,
        method: API_ENDPOINTS.DOWNLOAD.DownloadTorrentFile.methods[0],
        mutationKey: [API_ENDPOINTS.DOWNLOAD.DownloadTorrentFile.key],
        onSuccess: async () => {
            toast.success(i18n.t("toasts.downloads.filesDownloaded"))
            onSuccess?.()
        },
    })
}

export function useDownloadRelease() {
    const { mutate: openInExplorer } = useOpenInExplorer()

    return useServerMutation<DownloadReleaseResponse, DownloadRelease_Variables>({
        endpoint: API_ENDPOINTS.DOWNLOAD.DownloadRelease.endpoint,
        method: API_ENDPOINTS.DOWNLOAD.DownloadRelease.methods[0],
        mutationKey: [API_ENDPOINTS.DOWNLOAD.DownloadRelease.key],
        onSuccess: async data => {
            toast.success(i18n.t("toasts.downloads.updateDownloaded"))
            if (data?.error) {
                toast.error(data.error)
            }
            if (data?.destination) {
                openInExplorer({
                    path: data.destination,
                })
            }
        },
    })
}

export function useDownloadMacDenshiUpdate() {
    return useServerMutation<DownloadReleaseResponse, DownloadMacDenshiUpdate_Variables>({
        endpoint: API_ENDPOINTS.DOWNLOAD.DownloadMacDenshiUpdate.endpoint,
        method: API_ENDPOINTS.DOWNLOAD.DownloadMacDenshiUpdate.methods[0],
        mutationKey: [API_ENDPOINTS.DOWNLOAD.DownloadMacDenshiUpdate.key],
        onSuccess: async () => {
            toast.success(i18n.t("toasts.downloads.updateInstalledRestart"))
        },
    })
}

