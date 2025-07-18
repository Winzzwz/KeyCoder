"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { RankBadge } from "@/components/rank-badge"
import { LoadingScreen } from "@/components/loading-screen"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { PlayerList } from "@/components/player-list"
import { getCourseInfo, getUserProfile, startGame, createParty, leaveParty, getGameInfo, joinGame, getAvailableParties } from "@/lib/api"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
  faUsers,
  faBolt,
  faClock,
  faCode,
  faPlus,
  faEye,
  faEyeSlash,
  faCopy,
  faPlay,
  faRightToBracket,
  faTriangleExclamation,
  faQuestion,
  faRefresh
} from "@fortawesome/free-solid-svg-icons"
import { PageLockNotice } from "@/components/locked-page"
import { RichTextRenderer } from "@/components/rich-text-renderer"

export default function LobbyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMatchmaking, setIsMatchmaking] = useState(false)
  const [matchmakingTime, setMatchmakingTime] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isStartGameDialogOpen, setIsStartGameDialogOpen] = useState(false)
  const [lobbyCreated, setLobbyCreated] = useState(false)
  const [showLobbyCode, setShowLobbyCode] = useState(false)
  const [isLobbyLeader, setIsLobbyLeader] = useState(true)
  const [showELOinfo, setShowELOinfo] = useState(false)
  const [lobbyInfo, setLobbyInfo] = useState([])
  const [availableParties, setAvailableParties] = useState([])
  const { toast } = useToast()
  const router = useRouter()

  const [lobbyForm, setLobbyForm] = useState({
    name: "",
    maxPlayers: "4",
    visibility: "public",
    gameMode: "casual",
    competitionMode: "fastest",
  })

  const [joinLobbyCode, setJoinLobbyCode] = useState("")

  const [lobbyCode, setLobbyCode] = useState("")
  const [lock, setLock] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const [userInfo, setUserInfo] = useState<{
    rank: number,
    win: number,
    loss: number,
    elo: number,
    id: string
  } | null>(null)

  useEffect(() => {
    if (lobbyForm.visibility === "private" && lobbyForm.gameMode === "ranked") {
      setLobbyForm((prev) => ({ ...prev, gameMode: "casual" }))
      toast({
        title: "โหมดแรงก์ไม่สามารถใช้ได้",
        description: "โหมดแรงก์ไม่สามารถใช้ได้ในห้องส่วนตัว",
        variant: "destructive",
      })
    }
  }, [lobbyForm.visibility, lobbyForm.gameMode, toast])

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserProfile()
      if (!user) {
        router.push("/login")
        return
      }

      const courseInfo = await getCourseInfo("basics")
      
      setUserInfo({
        "rank": user.rank,
        "elo": user.elo,
        "win": user.win,
        "loss": user.loss,
        "id": user.id
      })
      
      if (user.courseProgress.basics < Object.keys(courseInfo).length) {
        console.log("Your basic course is not complete!")
        setLock(true)
      } else {
        console.log("Your basic course is completed!")
      }

      fetchAvailableParties()
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchAvailableParties = async () => {
    if (isCooldown) return;

    setIsCooldown(true)
    try {
      const parties = await getAvailableParties();
      setAvailableParties(parties);
    } catch (error) {
      console.error("Failed to fetch available parties:", error);
    } finally {
      setTimeout(() => {
        setIsCooldown(false)
      }, 3000);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isMatchmaking) {
      timer = setInterval(() => {
        setMatchmakingTime((prev) => prev + 1)

        if (matchmakingTime > 5 && Math.random() > 0.3) {
          setIsMatchmaking(false)
          setMatchmakingTime(0)
          toast({
            title: "พบการแข่งขัน!",
            description: "กำลังเข้าสู่ปาร์ตี้...",
            variant: "success",
          })
          setTimeout(() => {
            router.push("/competitions/1")
          }, 1500)
        }
      }, 1000)
    } else {
      setMatchmakingTime(0)
    }

    return () => clearInterval(timer)
  }, [isMatchmaking, matchmakingTime, toast, router])

  useEffect(() => {
    if (lobbyInfo && userInfo) {
      setIsLobbyLeader(lobbyInfo.host === userInfo.id)
    }
  }, [lobbyInfo, userInfo])

  const formatMatchmakingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleFindMatch = async () => {
    setIsRefreshing(true)
    try {
      await fetchAvailableParties()
      toast({
        title: "รีเฟรชรายการปาร์ตี้สำเร็จ",
        description: "รีเฟรชได้ในอีก 3 วินาที",
        variant: "success"
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "เกิดปัญหาระหว่างรีเฟรชรายการปาร์ตี้",
        description: "",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCancelMatchmaking = () => {
    setIsMatchmaking(false)
    toast({
      title: "ยกเลิกการค้นหา",
      description: "คุณได้ยกเลิกการค้นหาการแข่งขัน",
    })
  }

  const handleCreateLobby = async () => {
    try {

      const newLobbyForm = {
        name: lobbyForm.name,
        mode: lobbyForm.gameMode === "casual" ? 0 : 1,
        taskType: lobbyForm.competitionMode === "fastest" ? 0 : 1,
        isPrivate: lobbyForm.visibility === "private",
        maxPlayers: Number(lobbyForm.maxPlayers)
      }


      const response = await createParty(
        newLobbyForm.name,
        newLobbyForm.mode,
        newLobbyForm.taskType,
        newLobbyForm.maxPlayers,
        newLobbyForm.isPrivate
      )

      setIsCreateDialogOpen(false)

      if (!response.success) {
        if (response.message === "คุณอยู่ในปาร์ตี้อยู่แล้ว! | Error 409") {
          const gameInfo = await getGameInfo(response.info)
          setLobbyInfo(gameInfo)
          setIsLobbyLeader(gameInfo.host === userInfo.id)
          setLobbyCode(response.info)
          setLobbyCreated(true)
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `คุณอยู่ในปาร์ตี้อยู่แล้ว! | Error 409`,
            variant: "destructive",
          })
        } else {
          throw new Error(`error`)
        }
      } else {
        setLobbyInfo(response.info)
        setIsLobbyLeader(response.info.host === userInfo.id)
        setLobbyCode(response.info.code)
        setLobbyCreated(true)
        toast({
          title: "สร้างปาร์ตี้สำเร็จ",
          description: `ห้อง "${newLobbyForm.name}" พร้อมให้เข้าร่วมแล้ว`,
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Failed to create party:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างห้องได้ โปรดลองใหม่ภายหลัง",
        variant: "destructive",
      })
    }
  }

  const handleJoinLobbyThroughList = async (code:string) => {
    if (!code) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกรหัสปาร์ตี้",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await joinGame(code);

      const gameInfo = await getGameInfo(code);
      
      if (!gameInfo) {
        throw new Error("Failed to fetch lobby information");
      }

      setLobbyInfo(gameInfo);
      setIsLobbyLeader(gameInfo.host === userInfo?.id);
      setLobbyCode(code);
      setLobbyCreated(true);

      toast({
        title: "เข้าปาร์ตี้สำเร็จ!",
        description: `คุณเข้าร่วมปาร์ตี้ ${gameInfo.name || joinLobbyCode} เรียบร้อยแล้ว`,
        variant: "success",
      });

    } catch (error) {
      console.error("Failed to join lobby:", error);
      
      toast({
        title: "เข้าปาร์ตี้ไม่สำเร็จ!",
        description: error instanceof Error 
          ? error.message 
          : "ไม่พบปาร์ตี้ที่ใช้โค้ดนี้หรือเกิดข้อผิดพลาด",
        variant: "destructive",
      });
    }
  }

  const handleJoinLobby = async () => {
    setIsJoinDialogOpen(false)
    const response = await joinGame(joinLobbyCode)
    
    if (response) {
      const gameInfo = await getGameInfo(joinLobbyCode)
      setLobbyInfo(gameInfo)
      setIsLobbyLeader(gameInfo.host === userInfo.id)
      setLobbyCode(joinLobbyCode)
      setLobbyCreated(true)
      toast({
        title: "เข้าปาร์ตี้สำเร็จ!",
        description: `คุณอยู่ในปาร์ตี้อยู่แล้ว!`,
        variant: "success",
      })
    } else {
      toast({
        title: "เข้าปาร์ตี้ไม่สำเร็จ!",
        description: `ไม่มีปาร์ตี้ ที่ใช้โค้ดนี้`,
        variant: "destructive",
      })
    }
  }

  const handleLeaveLobby = () => {
    setIsLeaveDialogOpen(true)
  }

  const confirmLeaveLobby = () => {
    setIsLeaveDialogOpen(false)
    setLobbyCreated(false)
    leaveParty()
    toast({
      title: "ออกจากปาร์ตี้",
      description: "คุณได้ออกจากปาร์ตี้แล้ว",
    })
  }

  const handleStartGameClick = () => {
    setIsStartGameDialogOpen(true)
  }

  const handleStartGame = async () => {
    setIsStartGameDialogOpen(false);

    try {
      const result = await startGame(lobbyCode);

      if (result && result.status === 400) {
        toast({
          title: "คนไม่พอสำหรับเริ่มเล่นเกม!",
          description: "ต้องมีผู้คน 2 คนขึ้นไปถึงจะเล่นโหมดแรงก์ได้",
          variant: "destructive",
        });
      } else {
        toast({
          title: "กำลังเริ่มเกม...",
          description: "กรุณารอสักครู่...",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error starting game:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการเริ่มเกม",
        variant: "destructive",
      });
    }
  };

  const copyLobbyCode = () => {
    navigator.clipboard.writeText(lobbyCode)
    toast({
      title: "คัดลอกรหัสห้องแล้ว",
      description: "รหัสห้องถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      variant: "success",
    })
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageLockNotice open={lock} onBypass={() => setLock(false)} />

      <main className="flex-grow py-12 flex items-center">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">ปาร์ตี้</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
                    <CardHeader className="pb-2 text-center">
                      <CardTitle className="flex items-center text-2xl justify-center">
                        <FontAwesomeIcon icon={faGamepad} className="mr-2 h-6 w-6 text-primary" />
                        {lobbyCreated ? "ปาร์ตี้ของคุณ" : "เข้าร่วมการแข่งขัน"}
                      </CardTitle>
                      <CardDescription>
                        {lobbyCreated
                          ? `ห้อง: ${lobbyInfo.name}`
                          : ""}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="space-y-6 pt-6">
                    {lobbyCreated ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">รหัสห้อง</p>
                            <div className="flex items-center space-x-2">
                              <div className="bg-secondary/50 px-3 py-1.5 rounded-md font-mono">
                                {showLobbyCode ? lobbyCode : "••••••"}
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setShowLobbyCode(!showLobbyCode)}>
                                <FontAwesomeIcon icon={showLobbyCode ? faEyeSlash : faEye} className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={copyLobbyCode}>
                                <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Badge variant={lobbyInfo.isPrivate === false ? "default" : "secondary"}>
                            {lobbyInfo.isPrivate === false ? "สาธารณะ" : "ส่วนตัว"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">โหมดเกม</p>
                            <p className="text-sm bg-secondary/30 px-3 py-1.5 rounded-md">
                              {lobbyInfo.mode === 0 ? "ปกติ" : "แรงก์"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">โหมดการแข่งขัน</p>
                            <p className="text-sm bg-secondary/30 px-3 py-1.5 rounded-md">
                              {lobbyInfo.taskType === 0 ? "เร็วที่สุด" : "สั้นที่สุด"}
                            </p>
                          </div>
                        </div>

                        <PlayerList gameId={lobbyInfo.code} currentUserId={userInfo.id} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground">รายการปาร์ตี้</label>
                          <div className="max-h-64 overflow-y-auto rounded-xl border border-muted/50 p-2 space-y-2">
                            {availableParties.length > 0 ? (
                              availableParties.map((party) => (
                                <div
                                  key={party.code}
                                  className="bg-background border rounded-lg p-3 hover:shadow-md hover:border-primary transition-all cursor-pointer"
                                  onClick={() => {
                                    setJoinLobbyCode(party.code)
                                    setIsJoinDialogOpen(true)
                                  }}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                      <p className="text-base font-semibold">{party.name}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        ผู้เล่น {party.playersCount}/{party.maxPlayer}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                      <Badge variant={party.mode === 0 ? "secondary" : "destructive"}>
                                        {party.mode === 0 ? "ปกติ" : "แรงก์"}
                                      </Badge>
                                      <Badge variant={party.taskType === 0 ? "secondary" : "default"}>
                                        {party.taskType === 0 ? "เร็วที่สุด" : "สั้นที่สุด"}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                ไม่มีห้องที่พร้อมใช้งาน
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {lobbyCreated ? (
                      <div className="w-full space-y-2">
                        {isLobbyLeader && lobbyInfo && userInfo && (
                          <Button className="w-full" onClick={handleStartGameClick}>
                            <FontAwesomeIcon icon={faPlay} className="mr-2 h-4 w-4" />
                            เริ่มเกม
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={handleLeaveLobby}
                        >
                          ออกจากห้อง
                        </Button>
                      </div>
                    ) : isMatchmaking ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">กำลังค้นหาการแข่งขัน...</span>
                          <span className="text-sm font-mono">{formatMatchmakingTime(matchmakingTime)}</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full mb-4 overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            animate={{
                              width: ["0%", "100%", "0%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "anticipate",
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={handleCancelMatchmaking}
                        >
                          ยกเลิกการค้นหา
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <Button className="w-full" onClick={handleFindMatch} disabled={isCooldown}>
                          <FontAwesomeIcon
                            icon={faRefresh}
                            className={`mr-2 h-4 w-4 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
                          />
                          รีเฟรช
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setIsCreateDialogOpen(true)}>
                          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                          สร้างห้อง
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setIsJoinDialogOpen(true)}>
                          <FontAwesomeIcon icon={faRightToBracket} className="mr-2 h-4 w-4" />
                          ใส่รหัสห้อง
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 h-5 w-5 text-primary" />
                        สถิติของคุณ
                      </CardTitle>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowELOinfo(true)}
                        className="flex items-center"
                      >
                        <FontAwesomeIcon icon={faQuestion} className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardDescription>อันดับและสถิติปัจจุบันของคุณ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center py-2">
                      <RankBadge elo={userInfo.elo} size="lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{userInfo.win}</p>
                        <p className="text-xs text-muted-foreground">ชนะ</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{userInfo.loss}</p>
                        <p className="text-xs text-muted-foreground">แพ้</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{userInfo.elo}</p>
                        <p className="text-xs text-muted-foreground">Elo</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{userInfo.rank}</p>
                        <p className="text-xs text-muted-foreground">อันดับ</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/leaderboard" className="w-full">
                      <Button variant="outline" className="w-full">
                        ดูอันดับ
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Create Lobby Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>สร้างปาร์ตี้</DialogTitle>
            <DialogDescription>สร้างปาร์ตี้ใหม่และเชิญเพื่อนของคุณเข้าร่วม</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อห้อง</Label>
              <Input
                id="name"
                value={lobbyForm.name}
                onChange={(e) => setLobbyForm({ ...lobbyForm, name: e.target.value })}
                placeholder="ใส่ชื่อห้องของคุณ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">จำนวนผู้เล่นสูงสุด</Label>
              <Select
                value={lobbyForm.maxPlayers}
                onValueChange={(value) => setLobbyForm({ ...lobbyForm, maxPlayers: value })}
              >
                <SelectTrigger id="maxPlayers">
                  <SelectValue placeholder="เลือกจำนวนผู้เล่น" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 คน</SelectItem>
                  <SelectItem value="4">4 คน</SelectItem>
                  <SelectItem value="6">6 คน</SelectItem>
                  <SelectItem value="8">8 คน</SelectItem>
                  <SelectItem value="10">10 คน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>การมองเห็น</Label>
              <RadioGroup
                value={lobbyForm.visibility}
                onValueChange={(value) => setLobbyForm({ ...lobbyForm, visibility: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">สาธารณะ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">ส่วนตัว</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>โหมดเกม</Label>
              <RadioGroup
                value={lobbyForm.gameMode}
                onValueChange={(value) =>
                  setLobbyForm({
                    ...lobbyForm,
                    gameMode: value
                  })
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual">ปกติ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="ranked"
                    id="ranked"
                    disabled={lobbyForm.visibility === "private"}
                  />
                  <Label
                    htmlFor="ranked"
                    className={
                      lobbyForm.visibility === "private"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  >
                    แรงก์{" "}
                    {lobbyForm.visibility === "private" && "(ไม่สามารถใช้ได้ในห้องส่วนตัว)"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>โหมดการแข่งขัน</Label>
              <RadioGroup
                value={lobbyForm.competitionMode}
                onValueChange={(value) => setLobbyForm({ ...lobbyForm, competitionMode: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fastest" id="fastest" />
                  <Label htmlFor="fastest">เร็วที่สุด</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shortest" id="shortest" />
                  <Label htmlFor="shortest">สั้นที่สุด</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreateLobby} disabled={!lobbyForm.name}>
              สร้างห้อง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Lobby Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>เข้าร่วมปาร์ตี้</DialogTitle>
            <DialogDescription>ใส่รหัสห้องเพื่อเข้าร่วมปาร์ตี้</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lobbyCode">รหัสห้อง</Label>
              <Input
                id="lobbyCode"
                type="password"
                value={joinLobbyCode}
                onChange={(e) => setJoinLobbyCode(e.target.value.toUpperCase())}
                placeholder="EX. A1B2C3"
                className="font-mono uppercase"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleJoinLobby} disabled={!joinLobbyCode.trim()}>
              เข้าร่วม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Lobby Confirmation Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-500 mr-2" />
              ยืนยันการออกจากห้อง
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการออกจากปาร์ตี้นี้?
              {isLobbyLeader && " การออกจากห้องจะทำให้ห้องถูกยกเลิกและผู้เล่นทั้งหมดจะถูกนำออกจากห้อง"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmLeaveLobby}>
              ออกจากห้อง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Game Confirmation Dialog */}
      <Dialog open={isStartGameDialogOpen} onOpenChange={setIsStartGameDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการเริ่มเกม</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการเริ่มเกมตอนนี้? เกมจะเริ่มทันทีสำหรับผู้เล่นทุกคนในห้อง</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartGameDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleStartGame}>เริ่มเกม</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showELOinfo} onOpenChange={setShowELOinfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เกณฑ์การคำนวณ ELO</DialogTitle>
          </DialogHeader>
            <div className="mb-2 space-y-10">
              <p className="text-sm text-muted-foreground">
                คะแนน ELO จะได้จากการเล่น <b>โหมดแรงก์</b> เท่านั้น โดยจะมีการให้คะแนนแตกต่างกันตามหมวดโจทย์:
              </p>

              <div>
                <h2 className="font-bold text-lg mb-1">⚡ หมวดเร็วที่สุด</h2>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>ต้องได้คะแนนเต็มและทำเสร็จก่อนถึงจะได้ ELO</li>
                  <li>ถ้าได้คะแนนไม่เต็ม จะลด ELO</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-lg mb-1">📏 หมวดสั้นที่สุด</h2>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>ต้องได้คะแนนอย่างน้อย 50%</li>
                  <li>ถ้าเขียนโค้ดสั้นกว่าเกณฑ์ จะได้ ELO เพิ่มขึ้น</li>
                  <li>ถ้าโค้ดยาวกว่าเกณฑ์ จะลด ELO ปกติ</li>
                  <li>ถ้าคะแนนต่ำกว่า 50% จะลด ELO</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-lg mb-1">🟢 หมวดปกติ</h2>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li>เล่นชิว ๆ ไม่มีผลกับ ELO</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bold text-lg mb-1">✅ ความถูกต้อง</h2>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>ตอบผิด: ลด ELO</li>
                  <li>ตอบถูก: ได้ ELO ตามโหมดที่เล่น</li>
                </ul>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}