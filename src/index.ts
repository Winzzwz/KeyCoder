import { logger } from "@tqman/nice-logger"
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'
import { staticPlugin } from "@elysiajs/static"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import path from "path"
import fs from "fs"

const app = new Elysia()
    .use(logger({
        mode: "live",
        withTimestamp: true,
    }))
    .use(swagger())
    .use(cors({
        origin: true,
        credentials: true,
        allowedHeaders: true,
        methods: true
    }))

    .use(rateLimit({
        duration: 60000,
        max: 150,
    }))

    .group("/api", (app) => {
        const controllers = fs.readdirSync(path.join(__dirname, "./controller"))
        for (let controller of controllers) {
        if (path.extname(controller).toLowerCase() !== ".ts") continue;
            app.use(require(path.join(__dirname, "./controller", controller)).default)
        }
        
        return app
    })
  
    .all("*", ({ request }) => {
        const url = new URL(request.url)
        const proxyUrl = new URL(url.pathname + url.search, "http://localhost:3001")
        return fetch(proxyUrl, request)
    })

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, "ssl/origin.crt")),
    key: fs.readFileSync(path.join(__dirname, "ssl/origin.key"))
}

await app.listen({
    port: Bun.env.Port,
    // tls: httpsOptions
})

console.log(`🦊 Elysia running at ${app.server?.hostname}:${app.server?.port}`)