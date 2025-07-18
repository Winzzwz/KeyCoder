import gameManager from "@classes/gameManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/create", async ({ body, set, identity }) => {
        const response = await gameManager.createRoom( body, identity )
        if (!response.success) return handleError(set, response.status, response.error)
        return (response.data).toJSON()
    }, {
        body: t.Object({
            name: t.String({maxLength: 20}),
            mode: t.Union([t.Literal(0), t.Literal(1)]),
            taskType: t.Union([t.Literal(0), t.Literal(1)]),
            maxPlayers: t.Integer({
                minimum: 2,
                maximum: 10,
                multipleOf: 2
            }),
            isPrivate: t.Boolean()
        })
    })
}