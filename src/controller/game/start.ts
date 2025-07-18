import gameManager from "@classes/gameManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/start", async ({ set, identity }) => {
        const response = await gameManager.startRoom( identity )
        if (!response.success) return handleError(set, response.status, response.error)
        return response
    })
}