import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/theme", async ({ body, set, identity }) => {
        const response = await userManager.changeTheme(identity.id, body.theme)
        if (!response) return handleError(set, 422, errors.setThemeFailed)
        return response
    }, {
        body: t.Object({
            theme: t.Union(
                [t.Literal(0), t.Literal(1)],
                {
                    error: errors.invalidRequest
                }
            )
        })
    })
}