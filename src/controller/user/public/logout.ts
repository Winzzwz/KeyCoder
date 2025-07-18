import cookieManager from "@classes/cookieManager"
import { Elysia } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/logout", async ({ cookie: {auth} }) => {
        cookieManager.resetCookie(auth)
    })
}