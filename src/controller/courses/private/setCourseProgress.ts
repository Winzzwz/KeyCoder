import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/set-course-progress", async ({ body, set, identity }) => {
        const response = await userManager.setCourseProgress(identity.id, body.course, body.progress)
        if (!response) return handleError(set, 400, errors.setCourseFailed)
        return response
    }, {
        body: t.Object({
            course: t.String(),
            progress: t.Integer({
                minimum: 0,
                maximum: 100
            })
        })
    })
}