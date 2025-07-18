"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { RankBadge } from "@/components/rank-badge"
import { LoadingScreen } from "@/components/loading-screen"
import { getUserProfile, getGameInfo, keycoderGetCode } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CodeMirrorEditorV2 } from "@/components/code-mirror-editor-v2"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faHome,
  faTrophy,
  faCode,
  faUser,
  faCircleCheck,
  faCircleXmark,
  faChartBar,
  faEye,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"

interface Player {
  id: string
  username: string
  joinedAt: number
  submitted: boolean
  submitTime: number
  codeSize: number
  score: number
  elo: number
  changedElo: number
  code?: string
}

interface LobbyInfo {
  code: string
  name: string
  host: string
  isPrivate: boolean
  state: number
  maxPlayers: number
  startedAt: number
  createdAt: number
  endedAt: number
  expiredAt: number
  mode: number
  taskType: number
  task: string
  players: { [key: string]: Player }
}

interface UserInfo {
  id: string
  email: string
  username: string
  elo: number
  win: number
  loss: number
  skillLevel: number
  createDate: string
  rank: number
}

interface Participant extends Player {
  isCurrentUser?: boolean
  rank: number
  displayTime: number
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loadingCode, setLoadingCode] = useState(false)
  const [participantCodes, setParticipantCodes] = useState<{ [key: string]: string }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const isForfeit = searchParams.get("forfeit") === "true"
  const lobbyCode = params.id

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserProfile()
      if (!user) {
        router.push("/login")
        return
      }
      setUserInfo(user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Function to sort and process participants
  const processParticipants = (lobbyData: LobbyInfo, currentUserId: string): Participant[] => {
    const playersArray = Object.values(lobbyData.players)
    
    // Sort by ranking criteria:
    // 1. Submitted players first (submitted: true)
    // 2. Then by changedElo (descending)
    // 3. Then by submit time (ascending - faster is better)
    // 4. Then by elo (descending)
    const sortedPlayers = playersArray.sort((a, b) => {
      // First, prioritize submitted players
      if (a.submitted && !b.submitted) return -1
      if (!a.submitted && b.submitted) return 1
      
      // If both submitted or both not submitted, sort by changedElo
      if (a.changedElo !== b.changedElo) {
        return b.changedElo - a.changedElo
      }
      
      // If changedElo is the same, sort by submit time (only for submitted players)
      if (a.submitted && b.submitted) {
        if (a.submitTime !== b.submitTime) {
          return a.submitTime - b.submitTime
        }
      }
      
      // Finally, sort by current elo
      return b.elo - a.elo
    })

    // Add rank and other display properties
    return sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
      isCurrentUser: player.id === currentUserId,
      displayTime: player.submitted ? 
        Math.floor((player.submitTime - lobbyData.startedAt) / 1000) : 
        Math.floor((lobbyData.endedAt - lobbyData.startedAt) / 1000)
    }))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    const pollGameInfo = async () => {
      if (!lobbyCode || !userInfo) return
      
      try {
        const latestInfo = await getGameInfo(lobbyCode)
        setLobbyInfo(latestInfo)
        
        // Process and sort participants
        const processedParticipants = processParticipants(latestInfo, userInfo.id)
        setParticipants(processedParticipants)
        
        // Fetch current user's code if not already cached and user submitted
        const currentUserData = processedParticipants.find(p => p.isCurrentUser)
        if (currentUserData && currentUserData.submitted && !participantCodes[currentUserData.id]) {
          try {
            const userCode = await keycoderGetCode(lobbyCode, currentUserData.id)
            setParticipantCodes(prev => ({
              ...prev,
              [currentUserData.id]: userCode
            }))
          } catch (error) {
            console.error("Failed to fetch current user code:", error)
          }
        }
        
        console.log('Updated lobby info:', latestInfo)
        console.log('Processed participants:', processedParticipants)
      } catch (err) {
        console.error("Failed to poll game info:", err)
      }
    }

    if (userInfo && lobbyCode) {
      pollGameInfo()
      interval = setInterval(pollGameInfo, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lobbyCode, userInfo, participantCodes])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleViewCode = async (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowCodeDialog(true)
    
    // If we already have the code cached, don't fetch again
    if (participantCodes[participant.id]) {
      return
    }
    
    setLoadingCode(true)
    try {
      const code = await keycoderGetCode(lobbyCode, participant.id)
      setParticipantCodes(prev => ({
        ...prev,
        [participant.id]: code
      }))
    } catch (error) {
      console.error("Failed to fetch code:", error)
      setParticipantCodes(prev => ({
        ...prev,
        [participant.id]: "// Error loading code"
      }))
    } finally {
      setLoadingCode(false)
    }
  }

  const currentUser = participants.find(p => p.isCurrentUser)
  const userRank = currentUser?.rank || 0

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!lobbyInfo || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">กำลังโหลดข้อมูลผลสรุปเกม</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <div>
                  <h1 className="text-2xl font-bold">ผลการแข่งขัน</h1>
                  <p className="text-sm text-muted-foreground">ห้อง: {lobbyInfo.name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FontAwesomeIcon icon={faTrophy} className="mr-2 h-5 w-5 text-primary" />
                      อันดับ
                    </CardTitle>
                    <CardDescription>ดูว่าคุณทำได้ดีแค่ไหนเมื่อเทียบกับผู้เข้าร่วมคนอื่น</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 text-xs uppercase text-muted-foreground font-medium py-2 border-b border-border/50">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-3">ผู้ใช้</div>
                        <div className="col-span-2 text-center">Elo</div>
                        <div className="col-span-2 text-center">การเปลี่ยนแปลง</div>
                        <div className="col-span-2 text-center">เวลา</div>
                        <div className="col-span-1 text-center">สถานะ</div>
                        <div className="col-span-1 text-center">โค้ด</div>
                      </div>

                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`grid grid-cols-12 items-center py-3 ${
                            index < 3 ? "bg-secondary/30 rounded-md" : ""
                          } ${participant.isCurrentUser ? "border border-primary/50 rounded-md" : ""}`}
                        >
                          <div className="col-span-1 text-center font-mono font-bold">
                            {index === 0 ? (
                              <FontAwesomeIcon icon={faTrophy} className="h-5 w-5 text-yellow-500 mx-auto" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="col-span-3 flex items-center">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mr-2">
                              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium truncate">{participant.username}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className="flex flex-col items-center">
                              <RankBadge elo={participant.elo} showLabel={false} size="sm" />
                              <span className="text-xs text-muted-foreground mt-1">{participant.elo}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={`font-mono text-sm ${
                              participant.changedElo >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {participant.changedElo >= 0 ? '+' : ''}{participant.changedElo}
                            </span>
                          </div>
                          <div className="col-span-2 text-center font-mono">
                            {participant.isCurrentUser && isForfeit ? "ยอมแพ้" : formatTime(participant.displayTime)}
                          </div>
                          <div className="col-span-1 text-center">
                            {participant.submitted ? (
                              !isForfeit && participant.score ? (
                                <div className="flex items-center justify-center text-green-500">
                                  {participant.score}%
                                </div>
                              ) : (
                                <div className="flex items-center justify-center text-red-500">
                                  {participant.score}%
                                </div>
                              )
                            ) : (
                              <div className="flex items-center justify-center text-yellow-500 animate-spin">
                                <FontAwesomeIcon icon={faSpinner} className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="col-span-1 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewCode(participant)}
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FontAwesomeIcon icon={faCode} className="mr-2 h-5 w-5 text-primary" />
                      คำตอบของคุณ
                    </CardTitle>
                    <CardDescription>คำตอบที่คุณส่งสำหรับโจทย์นี้</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isForfeit ? (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md">
                        <p className="font-medium">คุณได้ยอมแพ้การแข่งขันนี้</p>
                        <p className="text-sm mt-1">ไม่มีคำตอบที่ส่ง</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {currentUser && !participantCodes[currentUser.id] && currentUser.submitted && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                              <span>กำลังโหลดโค้ด...</span>
                            </div>
                          </div>
                        )}
                        <CodeMirrorEditorV2
                          initialCode={
                            currentUser 
                              ? (participantCodes[currentUser.id] || currentUser.code || `def solution(input_str):
    # Your solution
    return input_str[::-1]`)
                              : `def solution(input_str):
    # Your solution
    return input_str[::-1]`
                          }
                          readOnly={true}
                          showFooter={false}
                          height="200px"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FontAwesomeIcon icon={faChartBar} className="mr-2 h-5 w-5 text-primary" />
                      ผลสรุปของคุณ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isForfeit ? (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md">
                          <p className="font-medium">คุณได้ยอมแพ้การแข่งขันนี้</p>
                          <p className="text-sm mt-1">คุณเสีย 15 Elo จากการยอมแพ้</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="space-y-1 bg-secondary/30 p-3 rounded-md">
                              <p className="text-2xl font-bold">{userRank}</p>
                              <p className="text-xs text-muted-foreground">อันดับ</p>
                            </div>
                            <div className="space-y-1 bg-secondary/30 p-3 rounded-md">
                              <p className="text-2xl font-bold">{formatTime(currentUser?.displayTime || 0)}</p>
                              <p className="text-xs text-muted-foreground">เวลาที่ใช้</p>
                            </div>
                            <div className="space-y-1 bg-secondary/30 p-3 rounded-md">
                              <p className={`text-2xl font-bold ${(currentUser?.changedElo || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {(currentUser?.changedElo || 0) >= 0 ? '+' : ''}{currentUser?.changedElo || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Elo ที่ได้รับ</p>
                            </div>
                            <div className="space-y-1 bg-secondary/30 p-3 rounded-md">
                              <p className="text-2xl font-bold">{currentUser?.elo || 0}</p>
                              <p className="text-xs text-muted-foreground">Elo ปัจจุบัน</p>
                            </div>
                          </div>
                          <div className={`${(currentUser?.changedElo || 0) >= 0 ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'} border px-4 py-3 rounded-md`}>
                            <p className="font-medium">
                              {(currentUser?.changedElo || 0) >= 0 ? 'ยินดีด้วย!' : 'เสียใจด้วย!'}
                            </p>
                            <p className="text-sm mt-1">
                              {(currentUser?.changedElo || 0) >= 0 
                                ? `คุณได้แก้โจทย์นี้สำเร็จและได้รับ ${currentUser?.changedElo} Elo`
                                : `คุณไม่ได้แก้โจทย์นี้สำเร็จและเสีย ${Math.abs(currentUser?.changedElo || 0)} Elo`
                              }
                            </p>
                          </div>
                        </>
                      )}
                      <div className="pt-2">
                        <Link href="/lobby">
                          <Button className="w-full">
                            <FontAwesomeIcon icon={faHome} className="mr-2 h-4 w-4" />
                            กลับไปยังห้องแข่งขัน
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* View Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>โค้ดของ {selectedParticipant?.username}</DialogTitle>
            <DialogDescription>
              คำตอบที่ส่งโดย {selectedParticipant?.username}
              {selectedParticipant && (
                <div className="flex items-center gap-2 mt-2">
                  <RankBadge elo={selectedParticipant.elo} showLabel={true} size="sm" />
                  <span className="text-sm">
                    ({selectedParticipant.changedElo >= 0 ? '+' : ''}{selectedParticipant.changedElo} Elo)
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedParticipant && (
            <div className="relative">
              {loadingCode && !participantCodes[selectedParticipant.id] && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                    <span>กำลังโหลดโค้ด...</span>
                  </div>
                </div>
              )}
              <CodeMirrorEditorV2
                initialCode={
                  participantCodes[selectedParticipant.id] || 
                  selectedParticipant.code || 
                  "// กำลังโหลดโค้ด..."
                }
                readOnly={true}
                showFooter={false}
                height="400px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}