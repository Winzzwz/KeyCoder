import gameManager from "@classes/gameManager"
import taskManager from "@classes/taskManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/submit", async ({ set, body, identity }) => {
        const decodedCode = decodeURIComponent(body.code)
        const response = await gameManager.submitCode(identity, decodedCode)
        if (!response.success) return handleError(set, response.status, response.error)
        return response
    }, {
        body: t.Object({
            code: t.String({
                maxLength: 2000
            }),
        })
    })
}