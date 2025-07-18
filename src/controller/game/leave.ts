import gameManager from "@classes/gameManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/leave", async ({ set, identity }) => {
        const response = await gameManager.leaveRoom( identity )
        if (!response.success) return handleError(set, response.status, response.error)
        return response
    })
}