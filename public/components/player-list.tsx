"use client"

import { useEffect, useState } from "react"
import { faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getGameInfo } from "@/lib/api"
import { useRouter } from "next/navigation"
import { RankBadge } from "./rank-badge"

interface PlayerInfo {
  id: string
  username: string
  joinedAt: number
  submitted: boolean
  submitTime: number
  codeSize: number
  score: number
  elo: number
  changedElo: number
}

interface PartyInfo {
  code: string
  name: string
  host: string
  players: Record<string, PlayerInfo>
  state: number
}

interface Props {
  gameId: string
  currentUserId: string
}

export function PlayerList({ gameId, currentUserId }: Props) {
  const [lobbyInfo, setlobbyInfo] = useState<PartyInfo | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const fetchInfo = async () => {
      try {
        const data = await getGameInfo(gameId)

        if (isMounted) {
          setlobbyInfo(data)
          console.log(data)

          if (data.state === 1 && !hasRedirected) {
            setHasRedirected(true)
            router.push(`/competitions/${gameId}`)
          }
        }
      } catch (err) {
        console.error("Failed to fetch game info:", err)
      }
    }

    fetchInfo()
    const interval = setInterval(fetchInfo, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [gameId, hasRedirected, router])

  if (!lobbyInfo || !lobbyInfo.players) return <div>Loading players...</div>

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">ผู้เล่น ({Object.values(lobbyInfo.players).length}/{lobbyInfo.maxPlayers})</p>
      <div className="bg-secondary/30 p-3 rounded-md space-y-6">
        <div className="space-y-2">
          {Object.values(lobbyInfo.players).map((player) => (
            <div
              key={player.id}
              className="flex items-center space-x-2 border rounded-md p-2 bg-muted/30"
            >
              <RankBadge elo={player.elo} showLabel={false} size="lg"/>
              <span>
                {player.username}
                {player.id === lobbyInfo.host && " (เจ้าของห้อง)"}
                {player.id === currentUserId && " (คุณ)"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}