import userManager from "@classes/userManager"
import taskManager from "@classes/taskManager"
import { errors, successes, maxElo } from "@classes/constants"
import { handleModuleError, handleModuleSuccess } from "@classes/requestHandler"
import { gameMode, taskType, roomState } from "@classes/enums"
import { customAlphabet } from "nanoid"

const roomIdGenerator = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6)

export class Player {
    id: string
    username: string
    joinedAt: number
    submitted = false
    submitTime = -1
    codeSize = -1
    score = -1
    code = ""
    elo = -1
    changedElo = -1

    constructor( id: string, username: string, elo: number ) {
        this.id = id
        this.username = username
        this.joinedAt = Date.now()
        this.elo = elo
    }
}

export class Room {
    code: string
    name: string
    host: string
    isPrivate: boolean
    state = roomState.waiting
    maxPlayers: number
    createdAt: number
    startedAt = -1
    endedAt = -1
    expiredAt = -1
    mode: gameMode
    taskType: taskType
    task: string | undefined
    players: Map<string, Player>

    constructor(
        hostElo: number,
        identity: any,
        code: string,
        name: string,
        mode: gameMode,
        taskType: taskType,
        maxPlayers: number,
        isPrivate: boolean,
    ) {
        this.code = code
        this.name = name
        this.host = identity.id
        this.mode = mode
        this.taskType = taskType
        this.maxPlayers = maxPlayers
        this.isPrivate = isPrivate
        this.players = new Map([[identity.id, new Player(identity.id, identity.username, hostElo)]])
        this.createdAt = Date.now()
    }

    get playerCount(): number {
        return this.players.size
    }

    get isFull(): boolean {
        return this.playerCount >= this.maxPlayers
    }

    get isActive(): boolean {
        return this.state != roomState.finished
    }

    toJSON() {
        return {
            code: this.code,
            name: this.name,
            host: this.host,
            isPrivate: this.isPrivate,
            state: this.state,
            maxPlayers: this.maxPlayers,
            startedAt: this.startedAt,
            createdAt: this.createdAt,
            endedAt: this.endedAt,
            expiredAt: this.expiredAt,
            mode: this.mode,
            taskType: this.taskType,
            task: this.task,
            players: Object.fromEntries(
            Array.from(this.players.entries()).map(([id, player]) => [
                id,
                {
                    id: player.id,
                    username: player.username,
                    joinedAt: player.joinedAt,
                    submitted: player.submitted,
                    submitTime: player.submitTime,
                    codeSize: player.codeSize,
                    score: player.score,
                    elo: player.elo,
                    changedElo: player.changedElo
                }
            ]))
        }
    }
}

let rooms = new Map<string, Room>()

const gameManager = {
    async cleanupRooms(): Promise<void> {
        const now = Date.now()
        for (const [roomId, room] of rooms) {
            if (room.endedAt > 0 && room.state === roomState.inGame && now >= room.endedAt) {
                room.state = roomState.finished
                for (const [playerId, player] of room.players) {
                    if (player.submitted) continue
                    player.submitted = true
                    player.submitTime = Date.now()
                    player.score = 0
                    const taskElo = await taskManager.getTaskElo(room.task!)
                    const user = await userManager.findUser({ id: playerId })
                    if (!user) continue
                    await userManager.updateUser({ id: playerId }, {
                        elo: await this.calculateElo(playerId, 0, taskElo.data, user.elo, room),
                        loss: user.loss+1
                    })
                }
            }
            
            if (room.expiredAt > 0 && now >= room.expiredAt) {
                rooms.delete(roomId)
            }
        }
    },

    async calculateElo(playerId: string, score: number, taskElo: number, userElo: number, room: Room): Promise<number> {
        let mode = room.mode
        let task_Type = room.taskType
        
        if (mode == gameMode.casual) return userElo
        
        const player = room.players.get(playerId)
        if (!player) return userElo
        
        const K = 32 
        const eloDiff = Math.max(-400, Math.min(400, taskElo - userElo))
        const expectedScore = 1 / (1 + Math.pow(10, eloDiff / 400))
        let actualScore = 0
        let performanceMultiplier = 1
        
        if (task_Type == taskType.fastest) {
            if (score < 100) {
                actualScore = 0
            } else {
                let playersBefore = 0
                for (const [_playerId, _player] of room.players) {
                    if (_playerId !== playerId && _player.submitted && _player.score === 100 && _player.submitTime < player.submitTime) {
                        playersBefore += 1
                    }
                }
                
                const totalPlayers = room.players.size
                const positionRatio = 1 - (playersBefore / totalPlayers)
                actualScore = 0.5 + (0.5 * positionRatio)
                
                const timeTaken = player.submitTime - room.startedAt
                const maxTime = room.endedAt - room.startedAt
                const timeRatio = Math.max(0, Math.min(1, 1 - (timeTaken / maxTime)))
                performanceMultiplier = 0.8 + (0.4 * timeRatio)
            }
        } else if (task_Type === taskType.shortest) {
            if (score < 50) {
                actualScore = 0
            } else {
                const scoreRatio = (score - 50) / 50
                actualScore = 0.4 + (0.6 * scoreRatio)
                
                let codeSizes: number[] = [];
                for (const [_playerId, _player] of room.players) {
                    if (_player.submitted && _player.score >= 50 && _player.codeSize > 0) {
                        codeSizes.push(_player.codeSize)
                    }
                }
                
                if (codeSizes.length > 0) {
                    codeSizes.sort((a, b) => a - b)
                    const minSize = codeSizes[0]
                    const maxSize = codeSizes[codeSizes.length - 1]
                    
                    if (minSize == maxSize) {
                        performanceMultiplier = 1
                    } else {
                        const sizeRatio = 1 - ((player.codeSize - minSize) / (maxSize - minSize))
                        performanceMultiplier = 0.7 + (0.6 * sizeRatio)
                    }
                }
                
                const solutionSize = await taskManager.getTaskSolutionSize(room.task!)
                if (solutionSize > 0 && player.codeSize <= solutionSize * 1.3) {
                    performanceMultiplier *= 1.1
                }
            }
        }
        const scoreDiff = actualScore - expectedScore
        const rawEloChange = K * scoreDiff * performanceMultiplier
        const maxChange = 100
        const eloChange = Math.max(-maxChange, Math.min(maxChange, rawEloChange))
        let newElo = Math.round(userElo + eloChange)
        newElo = Math.max(0, Math.min(maxElo, newElo))
        return newElo
    },

    async getAllRooms(): Promise<any> {
        const allRooms = []
        for (const [roomId, room] of rooms) {
            if (room.isPrivate) continue
            if (room.state == roomState.waiting) {
                allRooms.push({
                    code: room.code,
                    name: room.name,
                    playersCount: room.playerCount,
                    maxPlayer: room.maxPlayers,
                    mode: room.mode,
                    taskType: room.taskType
                })
            }
        }
        return allRooms
    },

    async getActiveRoomByPlayer( identity: any ): Promise<Room | undefined> {
        for (const [roomId, room] of rooms) {
            if (room.players.has(identity.id) && !room.players.get(identity.id)?.submitted) {
                return room
            }
        }
        return undefined
    },

    async getActiveRoomById( roomId: string ): Promise<Room | undefined> {
        return rooms.get(roomId)
    },

    async getCodeByUserId( identity: any, roomId: string, playerId: string ): Promise<any> {
        const room = await this.getActiveRoomById(roomId)
        if (!room) return handleModuleError(404, errors.roomNotFound)
        const reqPlayer = room.players.get(identity.id)
        if (!reqPlayer) return handleModuleError(409, errors.playerNotFound)
        if (!reqPlayer.submitted) return handleModuleError(409, errors.playerNotSubmitted)
        const player = room.players.get(playerId)
        if (!player) return handleModuleError(404, errors.playerNotFound)
        return handleModuleSuccess(encodeURI(player.code))
    },


    async deleteRoom( roomId: string ): Promise<undefined> {
        const room = rooms.get(roomId)
        if (!room) return
        rooms.delete(roomId)
    },

    async createRoom( settings: any, identity: any ): Promise<any> {
        const inRoom = await this.getActiveRoomByPlayer(identity)
        if (inRoom) return handleModuleError( 409, inRoom.code )
        let roomId: string
        do {
            roomId = roomIdGenerator()
        } while (rooms.has(roomId))
        const userElo = await userManager.getUserElo({ id: identity.id })
        if (userElo === false) return handleModuleError( 400, errors.unknownError )
        const room = new Room(
            userElo,
            identity,
            roomId,
            settings.name,
            settings.mode,
            settings.taskType,
            settings.maxPlayers,
            settings.isPrivate
        )
        rooms.set(roomId, room)
        return handleModuleSuccess(room)
    },

    async joinRoom( roomId: string, identity: any ): Promise<any> {
        const inRoom = await this.getActiveRoomByPlayer(identity)
        if (inRoom) return handleModuleError( 409, inRoom.code )
        const room = await this.getActiveRoomById(roomId)
        if (!room) return handleModuleError( 404, errors.roomNotFound )
        if (room.state != roomState.waiting) return handleModuleError( 405, errors.roomStarted )
        if (room.isFull) return handleModuleError( 405, errors.roomFull )
        const elo = await userManager.getUserElo({ id: identity.id })
        if (elo === false) return handleModuleError( 400, errors.unknownError )
        const player = new Player(identity.id, identity.username, elo)
        room.players.set(identity.id, player)
        return handleModuleSuccess( room )
    },

    async leaveRoom( identity: any ): Promise<any> {
        const room = await this.getActiveRoomByPlayer(identity)
        if (!room) return handleModuleError( 404, errors.roomNotFound )
        if (room.state != roomState.waiting) return handleModuleError( 405, errors.roomStarted )
        const player = room.players.get(identity.id)
        if (!player) return handleModuleError( 409, errors.playerNotFound )
        room.players.delete(identity.id)
        if (room.playerCount == 0) {
            this.deleteRoom(room.code)
            return handleModuleSuccess(successes.roomDeleted)
        }
        if (room.host == identity.id) {
            const nextHost = room.players.values().next()
            if (!nextHost.done) {
                room.host = nextHost.value.id
            }
        }
        return handleModuleSuccess(successes.roomLeft)
    },

    async startRoom( identity: any ): Promise<any> {
        const room = await this.getActiveRoomByPlayer(identity)
        if (!room) return handleModuleError( 404, errors.roomNotFound )
        if (room.state != roomState.waiting) return handleModuleError( 405, errors.roomStarted )
        if (room.host != identity.id) return handleModuleError( 409, errors.notHost )
        if (room.mode == 1 && room.players.size <= 1) return handleModuleError( 400, errors.notEnoughPlayers )
        room.state = roomState.inGame
        room.startedAt = Date.now()
        room.endedAt = Date.now() + 15 * 60 * 1000
        room.expiredAt = Date.now() + 120 * 60 * 1000
        room.task = await taskManager.createTask(room.taskType)
        return handleModuleSuccess(successes.roomStarted)
    },

    async submitCode( identity: any, code: string ): Promise<any> {
        const room = await this.getActiveRoomByPlayer(identity)
        if (!room) return handleModuleError( 404, errors.roomNotFound )
        if (room.state != roomState.inGame || !room.task || Date.now() > room.endedAt) return handleModuleError( 405, errors.roomInvalidState )
        const player = room.players.get(identity.id)
        if (!player) return handleModuleError( 409, errors.playerNotFound )
        const user = await userManager.findUser({ id: identity.id })
        if (!user) return handleModuleError( 409, errors.playerNotFound )
        if (player.submitted) return handleModuleError( 409, errors.playerSubmitted )
        const response = await taskManager.checkCode( room.task, code )
        if (!response.success) return handleModuleError( 400, errors.unknownError )
        const data = response.data
        const oldElo = user.elo
        const newElo = await this.calculateElo(identity.id, data.score, data.taskElo, user.elo, room)
        const changeElo = newElo - oldElo
        player.submitted = true
        player.submitTime = Date.now()
        player.codeSize = code.length
        player.score = data.score
        player.code = code
        player.changedElo = changeElo
        player.elo = newElo
        let win = user.win
        let loss = user.loss
        if (changeElo > 0) {
            win += 1
        } else if (changeElo < 0) {
            loss += 1
        }
        await userManager.updateUser({ id: identity.id }, {
            elo: newElo,
            win: win,
            loss: loss
        })
        return handleModuleSuccess({
            elo: changeElo,
            win: win,
            loss: loss,
            score: data.score,
            time: player.submitTime - room.startedAt
        })
    },
}

setInterval(() => {
    gameManager.cleanupRooms()
}, 30 * 1000)

export default gameManager