import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

const maxBasicProgress = require("@courses/info/basics.json")
export default (app: Elysia) => {
    // @ts-ignore
    app.post("/set-skill-level", async ({ body, set, identity, cookie: {auth} }) => {
        const response = await userManager.setSkillLevel(identity.id, body.level)
        if (!response) return handleError(set, 400, errors.setSkillFailed)
        if (body.level == 2) await userManager.setCourseProgress(identity.id, "basics", 5)
        if (body.level == 3) await userManager.setCourseProgress(identity.id, "basics", maxBasicProgress.length)
        return response
    }, {
        body: t.Object({
            level: t.Integer({
                minimum: 1,
                maximum: 3
            })
        })
    })
}