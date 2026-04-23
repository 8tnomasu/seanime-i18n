import { getServerBaseUrl } from "@/api/client/server-url"
import { serverAuthTokenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { isUpdateInstalledAtom, isUpdatingAtom } from "@/app/(main)/_electron/electron-update-modal"
import { websocketConnectedAtom, websocketConnectionErrorCountAtom } from "@/app/websocket-provider"
import { LuffyError } from "@/components/shared/luffy-error"
import { Button } from "@/components/ui/button"
import { LoadingOverlay } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"
import { useAtom, useAtomValue } from "jotai/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export function ElectronRestartServerPrompt() {
    const { t } = useTranslation()

    const [hasRendered, setHasRendered] = React.useState(false)

    const [isConnected, setIsConnected] = useAtom(websocketConnectedAtom)
    const connectionErrorCount = useAtomValue(websocketConnectionErrorCountAtom)
    const [hasClickedRestarted, setHasClickedRestarted] = React.useState(false)
    const isUpdatedInstalled = useAtomValue(isUpdateInstalledAtom)
    const isUpdating = useAtomValue(isUpdatingAtom)

    // Check if the server requires a password (no router dependency)
    const [serverHasPassword, setServerHasPassword] = React.useState(false)
    const serverAuthToken = useAtomValue(serverAuthTokenAtom)

    React.useEffect(() => {
        let cancelled = false
        const checkStatus = async () => {
            try {
                const res = await fetch(`${getServerBaseUrl()}/api/v1/status`)
                if (res.ok) {
                    const json = await res.json() as any
                    if (!cancelled) {
                        setServerHasPassword(!!json?.data?.serverHasPassword)
                    }
                }
            }
            catch {
                // Server unreachable, leave as false
            }
        }
        checkStatus()
        return () => { cancelled = true }
    }, [])

    const threshold = 8

    React.useEffect(() => {
        (async () => {
            if (window.electron) {
                // await window.electron.window.getCurrentWindow() // TODO: Isn't called
                setHasRendered(true)
            }
        })()
    }, [])

    const handleRestart = async () => {
        if (import.meta.env.MODE === "development") return toast.warning(t("toasts.denshi.devModeNotRestartingServer"))

        setHasClickedRestarted(true)
        toast.info(t("toasts.denshi.restartingServer"))
        if (window.electron) {
            window.electron.emit("restart-server")
            React.startTransition(() => {
                setTimeout(() => {
                    setHasClickedRestarted(false)
                }, 5000)
            })
        }
    }

    // Server is reachable but user hasn't logged in yet
    const isUnauthenticated = (serverHasPassword && !serverAuthToken) || import.meta.env.MODE === "development"

    // Try to reconnect automatically
    const tryAutoReconnectRef = React.useRef(true)
    React.useEffect(() => {
        if (!isConnected && connectionErrorCount >= threshold && tryAutoReconnectRef.current && !isUpdatedInstalled && !isUnauthenticated) {
            tryAutoReconnectRef.current = false
            console.log("Connection error count reached 10, restarting server automatically")
            handleRestart()
        }
    }, [connectionErrorCount, isUnauthenticated])

    React.useEffect(() => {
        if (isConnected) {
            setHasClickedRestarted(false)
            tryAutoReconnectRef.current = true
        }
    }, [isConnected])

    if (!hasRendered || isUnauthenticated) return null

    // Not connected for 10 seconds
    return (
        <>
            {(!isConnected && connectionErrorCount > 2 && connectionErrorCount < threshold && !isUpdating && !isUpdatedInstalled) && (
                <LoadingOverlay className="fixed left-0 top-0 z-[9999]">
                    <p>
                        {t("denshi.server.connectionLostReconnecting")}
                    </p>
                </LoadingOverlay>
            )}

            <Modal
                open={!isConnected && connectionErrorCount >= threshold && !isUpdatedInstalled}
                onOpenChange={() => {}}
                hideCloseButton
                contentClass="max-w-2xl"
            >
                <LuffyError>
                    <div className="space-y-4 flex flex-col items-center">
                        <p className="text-lg max-w-sm">
                            {t("denshi.server.stoppedResponding")}
                        </p>

                        <Button
                            onClick={handleRestart}
                            loading={hasClickedRestarted}
                            intent="white-outline"
                            size="lg"
                            className="rounded-full"
                        >
                            {t("denshi.server.restartServer")}
                        </Button>
                        <p className="text-[--muted] text-sm max-w-xl">
                            {t("denshi.server.relaunchIfPersists")}
                        </p>
                    </div>
                </LuffyError>
            </Modal>
        </>
    )
}
