import gameManager from "@classes/gameManager"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.get("/rooms-list", async ({ }) => {
        const response = await gameManager.getAllRooms()
        return JSON.stringify(response)
    })
}