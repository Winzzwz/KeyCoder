import gameManager from "@classes/gameManager"
import taskManager from "@classes/taskManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/forfeit", async ({ set, identity }) => {
        const response = await gameManager.submitCode(identity, "")
        if (!response.success) return handleError(set, response.status, response.error)
        return response
    })
}