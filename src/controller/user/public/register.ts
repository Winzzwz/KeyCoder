import userManager from "@classes/userManager";
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia";

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/register", async ({ body, set }) => {
        const response = await userManager.createUser(
            body.email,
            body.username,
            body.password
        )
        if (!response) return handleError(set, 422, errors.usernameoremailTaken)
        return response
    }, {
        body: t.Object({
            email: t.String({
                format: "email",
                error: errors.invalidRequest
            }),
            username: t.String({
                minLength: 4,
                maxLength: 20,
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
            password: t.String({
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
        })
    });
}