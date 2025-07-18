import gameManager from "@classes/gameManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/:id/code/:userId", async ({ params, set, identity }) => {
        const response = await gameManager.getCodeByUserId( identity, params.id, params.userId )
        if (!response.success) return handleError(set, response.status, response.error)
        return response
    })
}