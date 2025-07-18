import taskManager from "@classes/taskManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/:id", async ({ params, set, identity }) => {
        const response = await taskManager.getTask( params.id )
        if (!response.success) return handleError(set, response.status, response.error)
        return response.data
    })
}