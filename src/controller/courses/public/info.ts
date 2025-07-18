import { Elysia } from "elysia"
import fs from "fs"
import path from "path"

export default (app: Elysia) => {
    // @ts-ignore
    const infoDir = path.resolve(process.cwd(), 'src', 'courses', 'info')
    const infoDatas = fs.readdirSync(infoDir)
    for (let file of infoDatas) {
        const info = require(path.join(infoDir,file))
        const fileName = path.basename(file, path.extname(file))
        app.get("info/"+fileName, async () => {
            return info
        })
    }
}