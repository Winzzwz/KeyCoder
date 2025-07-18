import gameManager from "@classes/gameManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/:id/info", async ({ params, set }) => {
        const response = await gameManager.getActiveRoomById( params.id )
        if (!response) return handleError(set, 404, errors.roomNotFound)
        return (response).toJSON()
    })
}