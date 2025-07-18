import { Elysia } from "elysia"
import fs from "fs"
import path from "path"

export default (app: Elysia) => {
    // @ts-ignore
    const coursesDir = path.resolve(process.cwd(), 'src', 'courses')
    const courses = fs.readdirSync(coursesDir)
    for (let course of courses) {
        if (path.extname(course).toLowerCase() != ".json") continue
        const data = require(path.join(coursesDir,course))
        const courseName = path.basename(course, path.extname(course))
        app.get(courseName, async () => {
            return data
        })
    }
}