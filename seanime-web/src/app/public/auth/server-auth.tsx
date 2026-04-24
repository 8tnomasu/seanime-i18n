import { serverAuthTokenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { defineSchema, Field, Form } from "@/components/ui/form"
import { Modal } from "@/components/ui/modal"
import { useAtom } from "jotai"
import { sha256 } from "js-sha256"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

export function ServerAuth() {
    const { t } = useTranslation()

    const [, setAuthToken] = useAtom(serverAuthTokenAtom)
    const [loading, setLoading] = useState(false)

    return (<>
        <Modal
            title={t("auth.server.title")}
            description={t("auth.server.description")}
            open={true}
            onOpenChange={(v) => {}}
            overlayClass="bg-opacity-100 bg-gray-900"
            contentClass="border focus:outline-none focus-visible:outline-none outline-none"
            hideCloseButton
        >
            <Form
                schema={defineSchema(({ z }) => z.object({
                    password: z.string().min(1, t("auth.server.passwordRequired")),
                }))}
                onSubmit={async data => {
                    setLoading(true)
                    const hash = sha256(data.password)
                    setAuthToken(hash)
                    React.startTransition(() => {
                        window.location.href = "/"
                        setLoading(false)
                    })
                }}
            >
                <Field.Text
                    type="password"
                    name="password"
                    label={t("auth.server.enterPassword")}
                    fieldClass=""
                />
                <Field.Submit showLoadingOverlayOnSuccess loading={loading}>{t("common.buttons.continue")}</Field.Submit>
            </Form>
        </Modal>
    </>)
}
