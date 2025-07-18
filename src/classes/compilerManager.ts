import { handleModuleError, handleModuleSuccess } from "@classes/requestHandler"
import { spawnSync } from "child_process"
import { errors } from "@classes/constants"

const compilerManager = {
    async compileCode(code: string, input: string) {
        input = input.trim()

        const result = await spawnSync("py", ["-c", code], {
            input,
            encoding: "utf8",
            timeout: 1000,
            maxBuffer: 1024 * 10
        })

        const stdout = (result.stdout || "").trim()
        const stderr = (result.stderr || "").trim()

        if (stdout.length > 1000) return handleModuleSuccess({
            stdout: "",
            stderr: errors.outputTooLong
        })
        return handleModuleSuccess({
            stdout: stdout,
            stderr: stderr
        })
    }
}

export default compilerManager