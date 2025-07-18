import compilerManager from "@classes/compilerManager"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/submit", async ({ body }) => {
        body.output = (body.output || "").trim()
        const decodedCode = decodeURIComponent(body.code)
        const decodedInput = decodeURIComponent(body.input)
        const response = await compilerManager.compileCode(decodedCode, decodedInput)
        if (response.data.stdout != body.output) {
            response.success = false
        }
        return response
    }, {
        body: t.Object({
            code: t.String({
                maxLength: 2000
            }),
            input: t.String({
                maxLength: 1000
            }),
            output: t.String({
                maxLength: 1000
            })
        })
    })
}