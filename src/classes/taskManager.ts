import compilerManager from "@classes/compilerManager"
import { handleModuleError, handleModuleSuccess } from "@classes/requestHandler"
import { errors } from "@classes/constants"
import { taskType } from "@classes/enums"
import { createHash } from "crypto"
import fs from "fs"
import path from "path"

export interface Testcases {
    input: string,
    output: string
}

export interface Task {
    name: string
    type: Array<number>
    tag: Array<string>
    difficultyElo: number
    solution_size: number
    description: Object
    example_testcases: Array<Testcases>
    testcases: Array<Testcases>
}

const allTasks = new Map<string, Task>()

function hash(input: string): string {
    return createHash("md5").update(input, "utf8").digest("hex");
}

const tasksDir = path.resolve(__dirname, '../tasks/')
const allTasksData = fs.readdirSync(tasksDir)
for (let taskName of allTasksData) {
    let task = require(path.resolve(tasksDir, taskName))
    let taskId = hash(JSON.stringify(task))
    allTasks.set(taskId, task)
}

const taskManager = {
    async createTask( taskType: taskType ): Promise<any> {
        let availableTasks = []
        for (let [taskId, data] of allTasks) {
            if (!data.type.includes(taskType)) continue
            availableTasks.push(taskId)
        }
        let taskId = availableTasks[Math.floor(Math.random()*availableTasks.length)]
        return taskId
    },

    async getTask( taskId: string ): Promise<any> {
        let task = allTasks.get(taskId)
        if (!task) return handleModuleError( 404, errors.taskNotFound )
        const { testcases, ...publicTask } = task
        return handleModuleSuccess( publicTask )
    },

    async getTaskElo( taskId: string ): Promise<any> {
        let task = allTasks.get(taskId)
        if (!task) return handleModuleError( 404, errors.taskNotFound )
        return handleModuleSuccess(task.difficultyElo)
    },

    async getTaskSolutionSize( taskId: string ): Promise<any> {
        let task = allTasks.get(taskId)
        if (!task) return handleModuleError( 404, errors.taskNotFound )
        return handleModuleSuccess(task.solution_size)
    },

    async checkCode( taskId: string, code: string ): Promise<any> {
        let task = allTasks.get(taskId)
        if (!task) return handleModuleError( 404, errors.taskNotFound )
        let passed = 0, total = task.testcases.length
        for (let testcase of task.testcases) {
            const result = await compilerManager.compileCode( code, testcase.input )
            if (result.success) {
                const normalizedExpected = testcase.output.replace(/\s+/g, '')
                const normalizedActual = result.data.stdout.replace(/\s+/g, '')
                
                if (normalizedExpected === normalizedActual) {
                    passed += 1
                }
            }
        }
        return handleModuleSuccess({
            score: Math.floor(passed/total*100),
            taskElo: task.difficultyElo
        })
    }
}

export default taskManager