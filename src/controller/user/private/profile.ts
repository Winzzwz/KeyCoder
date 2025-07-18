import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/profile", async ({ identity }) => {
        const user = await userManager.findUser({id: identity.id})
        const rank = await userManager.getUserRank({ id: identity.id })
        // @ts-ignore
        user.rank = rank
        return user
    })
}