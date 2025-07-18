"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile, keycoderGetTaskInfo, getGameInfo, testCourseCode, keycoderCompileCode, keycoderSubmit, keycoderForfeit } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingScreen } from "@/components/loading-screen"
import { CodeMirrorEditorV2 } from "@/components/code-mirror-editor-v2"
import { RichTextRenderer } from "@/components/rich-text-renderer"
import { EditorContent } from "@tiptap/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay,
  faCircleCheck,
  faCircleXmark,
  faUsers,
  faClock,
  faFlag,
  faCode,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons"

interface TestCase {
  input: string
  output: string
  status: "idle" | "running" | "passed" | "failed"
  errorMessage?: string
  actualOutput?: string
}

interface GameInfo {
  task: string
  startedAt: number
  endedAt: number
  expiredAt: number
  state: number
  players: Record<string, any>
}

interface GameProblem {
  name: string
  type: number[]
  description: any[]
  difficulty: number
  example_testcases: {
    input: string
    output: string
  }[]
}

export default function CompetitionPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [code, setCode] = useState(`print("Hello World")`)
  const [timeLeft, setTimeLeft] = useState(0)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [showForfeitDialog, setShowForfeitDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [problem, setProblem] = useState<GameProblem | null>(null)
  
  const lobbyCode = params.id

  const calculateTimeLeft = (gameData: GameInfo): number => {
    if (!gameData || !gameData.endedAt) return 0
    
    const now = Date.now()
    const endTime = gameData.endedAt
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
    
    return remaining
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let isMounted = true

    const checkAuth = async () => {
      try {
        const user = await getUserProfile()
        if (!user) {
          router.push("/login")
          return
        }


        try {
          const gameData = await getGameInfo(lobbyCode)
          if (isMounted) {
            setGameInfo(gameData)
            const hasSubmitted = Object.values(gameData.players || {}).some(player => player.submitted)

            if (hasSubmitted) {
              router.push(`/competitions/${gameData.code}/results`)
              return
            }

            const initialTimeLeft = calculateTimeLeft(gameData)
            setTimeLeft(initialTimeLeft)
            
            if (gameData?.task) {
              const problemData = await keycoderGetTaskInfo(gameData.task)
              if (isMounted) {
                setProblem(problemData.info)
              }
            }
          }
        } catch (error) {
          console.error("Error fetching initial game info:", error)
        }
        
        const updateGameInfo = async () => {
          if (!isMounted) return
          
          try {
            const gameData = await getGameInfo(lobbyCode)
            
            if (!isMounted) return
            
            setGameInfo(gameData)
            
            const newTimeLeft = calculateTimeLeft(gameData)
            setTimeLeft(newTimeLeft)
            
            if (!gameData) router.push("/lobby")
          } catch (error) {
            console.error("Error fetching game info:", error)
          }
        }

        if (isMounted) {
          interval = setInterval(updateGameInfo, 3000)
        }
        
        if (isMounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        router.push("/login")
      }
    }

    checkAuth()

    return () => {
      isMounted = false
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
  }, [router, lobbyCode])

  useEffect(() => {
    if (problem?.example_testcases) {
      setTestCases(
        problem.example_testcases.map((tc) => ({
          input: tc.input,
          output: tc.output,
          status: "idle",
        }))
      )
    }
  }, [problem])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleTimeUp = () => {
    toast({
      title: "หมดเวลา!",
      description: "เวลาในการทำโจทย์หมดลงแล้ว กำลังส่งคำตอบของคุณ...",
      variant: "destructive",
    })

    keycoderSubmit(code)
    
    setTimeout(() => {
      router.push(`/competitions/${params.id}/results`)
    }, 1500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const runTest = async (testIndex: number, input: string, output: string) => {
    setTestCases((prev) =>
      prev.map((test, idx) =>
        idx === testIndex ? { ...test, status: "running" } : test
      )
    )

    const result = await keycoderCompileCode(code, input, output)
    console.log(result)

    if (!result) return

    let newTestCase: any

    if (result.success) {
      toast({
        title: "ทดสอบผ่าน",
        description: `เคสทดสอบที่ ${testIndex + 1} ผ่านแล้ว`,
        variant: "default",
      })
      newTestCase = {
        status: "passed",
        actualOutput: result.output,
      }
    } else {
      toast({
        title: "ทดสอบไม่ผ่าน",
        description: `เคสทดสอบที่ ${testIndex + 1} ได้ผลลัพธ์ไม่ตรงกับที่คาดหวัง`,
        variant: "destructive",
      })
      newTestCase = result.output !== ""
        ? {
            status: "failed",
            errorMessage: result.output,
          }
        : {
            status: "failed",
            output: result.expected,
            actualOutput: result.found,
          }
    }

    setTestCases((prev) =>
      prev.map((test, idx) =>
        idx === testIndex ? { ...test, ...newTestCase } : test
      )
    )
  }

  const runAllTests = async () => {
    for (let i = 0; i < testCases.length; i++) {
      setTestCases(prev =>
        prev.map((t, idx) => (idx === i ? { ...t, status: "running" } : t))
      )

      const test = testCases[i]
      const result = await keycoderCompileCode(code, test.input, test.output)

      if (!result) continue

      let newTestCase: any

      if (result.success) {
        toast({
          title: "ทดสอบผ่าน",
          description: `เคสทดสอบที่ ${i + 1} ผ่านแล้ว`,
          variant: "default",
        })
        newTestCase = {
          status: "passed",
          actualOutput: result.output,
        }
      } else {
        toast({
          title: "ทดสอบไม่ผ่าน",
          description: `เคสทดสอบที่ ${i + 1} ได้ผลลัพธ์ไม่ตรงกับที่คาดหวัง`,
          variant: "destructive",
        })
        newTestCase = result.output !== ""
          ? {
              status: "failed",
              errorMessage: result.output,
            }
          : {
              status: "failed",
              output: result.expected,
              actualOutput: result.found,
            }
      }

      setTestCases(prev =>
        prev.map((t, idx) => (idx === i ? { ...t, ...newTestCase } : t))
      )
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const handleForfeit = () => {
    setShowForfeitDialog(false)

    toast({
      title: "ยอมแพ้การแข่งขัน",
      description: "คุณได้ยอมแพ้การแข่งขันนี้",
      variant: "destructive",
    })

    keycoderForfeit()

    setTimeout(() => {
      router.push(`/competitions/${params.id}/results`)
    }, 1500)
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmit = () => {
    setShowSubmitDialog(false)
    
    keycoderSubmit(code)

    toast({
      title: "ส่งคำตอบสำเร็จ",
      description: "กำลังประมวลผลคำตอบของคุณ...",
      variant: "default",
    })
    
    setTimeout(() => {
      router.push(`/competitions/${params.id}/results`)
    }, 1500)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูลโจทย์</h2>
          <p className="text-muted-foreground">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-6">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div>
                <h1 className="text-2xl font-bold">📌 โจทย์ปัญหา</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUsers} className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {gameInfo?.players ? Object.keys(gameInfo.players).length : 0} ผู้เข้าร่วม
                </span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="h-4 w-4 mr-1 text-primary" />
                <span className={`text-sm font-mono ${timeLeft < 90 ? "text-red-500" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => setShowForfeitDialog(true)}
              >
                <FontAwesomeIcon icon={faFlag} className="mr-2 h-4 w-4" />
                ยอมแพ้
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{problem.name}</CardTitle>
                  <CardDescription>อ่านโจทย์ให้เข้าใจก่อนเริ่มทำ จุ้ฟ ๆ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <RichTextRenderer content={problem.description} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>💻 โค้ดเอดิเตอร์</CardTitle>
                  <CardDescription>เขียนโค้ดแก้ปัญหาด้วย Python</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeMirrorEditorV2 initialCode={code} onChange={handleCodeChange} height="400px" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>เคสทดสอบ</CardTitle>
                  <CardDescription>รันเทสต์เพื่อตรวจสอบโค้ดของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={runAllTests} 
                    className="w-full mb-4"
                    disabled={testCases.some(test => test.status === "running")}
                  >
                    รันทุกเคส
                  </Button>
                  
                  {testCases.map((test, index) => (
                    <div key={index} className="border border-border/50 rounded-md p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">เคสทดสอบ {index + 1}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => runTest(index, test.input, test.output)}
                          disabled={test.status === "running"}
                        >
                          {test.status === "running" ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FontAwesomeIcon icon={faPlay} className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">อินพุต:</p>
                        <pre className="bg-secondary/30 p-2 rounded-md overflow-x-auto">
                          <code>{test.input}</code>
                        </pre>
                      </div>

                      {test.status === "passed" && (
                        <div className="flex items-center text-green-500 mt-2">
                          <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 mr-1" />
                          <span>ผ่าน</span>
                        </div>
                      )}

                      {test.status === "failed" && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center text-red-500">
                            <FontAwesomeIcon icon={faCircleXmark} className="h-4 w-4 mr-1" />
                            <span>ไม่ผ่าน</span>
                          </div>

                          {test.errorMessage ? (
                            <div className="text-sm">
                              <p className="text-red-400 mb-1">ข้อผิดพลาด:</p>
                              <pre className="bg-red-500/10 border border-red-500/30 p-2 rounded-md overflow-x-auto text-red-400">
                                <code>{test.errorMessage}</code>
                              </pre>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">ผลลัพธ์ที่คาดหวัง:</p>
                                <pre className="bg-secondary/30 p-2 rounded-md overflow-x-auto">
                                  <code>{test.output}</code>
                                </pre>
                              </div>
                              <div>
                                <p className="text-red-400 mb-1">ได้รับ:</p>
                                <pre className="bg-red-500/10 border border-red-500/30 p-2 rounded-md overflow-x-auto">
                                  <code>{test.actualOutput}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>ส่งคำตอบ</CardTitle>
                  <CardDescription>ตรวจสอบให้แน่ใจว่าเคสทดสอบทั้งหมดผ่านก่อนส่งคำตอบของคุณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg" onClick={handleSubmitClick}>
                    <span className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCode} className="mr-2 h-4 w-4" />
                      ส่งคำตอบ
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Forfeit Confirmation Dialog */}
      <Dialog open={showForfeitDialog} onOpenChange={setShowForfeitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-500 mr-2" />
              ยืนยันการยอมแพ้
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการยอมแพ้การแข่งขันนี้? การยอมแพ้จะถูกบันทึกเป็นการแพ้ในประวัติของคุณและคุณจะเสีย Elo
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button variant="outline" onClick={() => setShowForfeitDialog(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleForfeit}>
              ยืนยันการยอมแพ้
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Answer Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการส่งคำตอบ</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการส่งคำตอบนี้? หลังจากส่งคำตอบแล้ว คุณจะไม่สามารถแก้ไขได้อีก</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>ส่งคำตอบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}