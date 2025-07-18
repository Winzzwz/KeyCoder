import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/top", async ({ }) => {
        const users = userManager.getTopUsers()
        return users
    })
}