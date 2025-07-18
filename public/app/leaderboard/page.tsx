"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { RankBadge } from "@/components/rank-badge"
import { LoadingScreen } from "@/components/loading-screen"
import { getTopUsers, getUserProfile } from "@/lib/api"
import type { TopUser } from "@/lib/api"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrophy, faMedal, faUser, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [currentUser, setCurrentUser] = useState<{
    username: string
    elo: number
    rank: number
    win: number
    loss: number
  } | null>(null)
  const [showRankInfoDialog, setShowRankInfoDialog] = useState(false)
  const router = useRouter()

  const fetchLeaderboardData = async () => {
    try {
      const user = await getUserProfile()
      if (!user) {
        router.push("/login")
        return
      }

      setCurrentUser({
        username: user.username,
        win: user.win,
        loss: user.loss,
        elo: user.elo,
        rank: user.rank,
      })

      const topUsersData = await getTopUsers()
      console.log(topUsersData)
      if (topUsersData) {
        setTopUsers(topUsersData)
      } else {
        console.warn("getTopUsers returned no data")
      }

    } catch (err) {
      console.error("Error fetching leaderboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboardData()
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  const rankInfo = [
    { name: "มือใหม่", elo: "0-100", color: "#9CA3AF" },
    { name: "ธรรมดา", elo: "101-250", color: "#10B981" },
    { name: "ปานกลาง", elo: "251-500", color: "#047857" },
    { name: "ผู้เชี่ยวชาญ", elo: "501-1200", color: "#3B82F6" },
    { name: "มาสเตอร์", elo: "1201-1500", color: "#8B5CF6" },
    { name: "แกรนด์มาสเตอร์", elo: "1501-1700", color: "#38BDF8" },
    { name: "ซูพีเรียร์", elo: "1701-1900", color: "#EF4444" },
    { name: "แชมเปี้ยน", elo: "1901+", color: "#FBBF24" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">อันดับ</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRankInfoDialog(true)}
                className="flex items-center"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 h-4 w-4" />
                ข้อมูลแรงค์
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FontAwesomeIcon icon={faTrophy} className="mr-2 h-5 w-5 text-primary" />
                    Global Top 10
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 text-xs uppercase text-muted-foreground font-medium py-2 border-b border-border/50">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-5 sm:col-span-4">ชื่อ</div>
                      <div className="col-span-2 text-center">Elo</div>
                      <div className="col-span-2 text-center hidden sm:block">ชนะ</div>
                      <div className="col-span-2 text-center hidden sm:block">แพ้</div>
                      <div className="col-span-2 sm:col-span-1 text-center">แรงก์</div>
                    </div>

                    {topUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`grid grid-cols-12 items-center py-3 ${
                          index < 3 ? "bg-secondary/30 rounded-md" : ""
                        } ${currentUser?.username === user.username ? "border border-primary/50 rounded-md" : ""}`}
                      >
                        <div className="col-span-1 text-center font-mono font-bold">
                          {index === 0 ? (
                            <FontAwesomeIcon icon={faTrophy} className="h-5 w-5 text-yellow-500 mx-auto" />
                          ) : index === 1 ? (
                            <FontAwesomeIcon icon={faMedal} className="h-5 w-5 text-gray-300 mx-auto" />
                          ) : index === 2 ? (
                            <FontAwesomeIcon icon={faMedal} className="h-5 w-5 text-amber-600 mx-auto" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="col-span-5 sm:col-span-4 flex items-center">
                          <span className="font-medium truncate">{user.username}</span>
                        </div>
                        <div className="col-span-2 text-center font-mono font-medium">{user.elo}</div>
                        <div className="col-span-2 text-center hidden sm:block text-green-500">{user.win}</div>
                        <div className="col-span-2 text-center hidden sm:block text-red-500">{user.loss}</div>
                        <div className="col-span-2 sm:col-span-1 flex justify-center">
                          <RankBadge elo={user.elo} showLabel={false} size="lg" />
                        </div>
                      </motion.div>
                    ))}

                    {/* Separator for current user */}
                    {currentUser && !topUsers.some((user) => user.username === currentUser.username) && (
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-background px-2 text-xs text-muted-foreground">อันดับของคุณ</span>
                        </div>
                      </div>
                    )}

                    {/* Current user row */}
                    {currentUser && !topUsers.some((user) => user.username === currentUser.username) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="grid grid-cols-12 items-center py-3 bg-primary/10 border border-primary/50 rounded-md"
                      >
                        <div className="col-span-1 text-center font-mono font-bold">{currentUser.rank}</div>
                        <div className="col-span-5 sm:col-span-4 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                            <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{currentUser.username}</span>
                        </div>
                        <div className="col-span-2 text-center font-mono font-medium">{currentUser.elo}</div>
                        <div className="col-span-2 text-center hidden sm:block text-green-500">{currentUser.win}</div>
                        <div className="col-span-2 text-center hidden sm:block text-red-500">{currentUser.loss}</div>
                        <div className="col-span-2 sm:col-span-1 flex justify-center">
                          <RankBadge elo={currentUser.elo} showLabel={false} size="sm" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Rank Information Dialog */}
      <Dialog open={showRankInfoDialog} onOpenChange={setShowRankInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ข้อมูลแรงค์</DialogTitle>
            <DialogDescription>ระดับแรงค์และช่วง ELO</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-12 text-xs uppercase text-muted-foreground font-medium py-2 border-b border-border/50">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">แรงค์</div>
              <div className="col-span-3 text-center">ช่วง ELO</div>
              <div className="col-span-4 text-center">ไอคอน</div>
            </div>

            {rankInfo.map((rank, index) => (
              <div key={index} className="grid grid-cols-12 items-center py-2">
                <div className="col-span-1 text-center font-medium">{index + 1}</div>
                <div className="col-span-4 font-medium">{rank.name}</div>
                <div className="col-span-3 text-center font-mono">{rank.elo}</div>
                <div className="col-span-4 flex justify-center">
                  <RankBadge elo={Number.parseInt(rank.elo.split("-")[0]) + 1} showLabel={false} size="lg" />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
