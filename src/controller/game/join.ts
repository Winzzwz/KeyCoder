import gameManager from "@classes/gameManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/:id/join", async ({ params, set, identity }) => {
        const response = await gameManager.joinRoom( params.id, identity )
        if (!response.success) return handleError(set, response.status, response.error)
        return (response.data).toJSON()
    })
}