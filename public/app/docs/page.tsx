"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBook,
  faCode,
  faLaptopCode,
  faListCheck,
  faArrowRight,
  faGamepad,
  faDatabase,
  faServer,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import {PythonSkillDialog} from "@/components/python-skill-dialog"
import {getUserProfile, setSkillLevel, setCourseTopicIndex} from "@/lib/api"


const categories = [
  {
    id: "basics",
    title: "พื้นฐาน Python",
    description: "เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Python",
    icon: faCode,
    color: "text-blue-500",
    topics: [
      { id: "intro", title: "แนะนำ Python", description: "ทำความรู้จักกับภาษา Python" },
      { id: "datatypes", title: "ประเภทของข้อมูล", description: "ชนิดข้อมูลต่างๆ ใน Python" },
      { id: "syntax", title: "ไวยากรณ์", description: "ไวยากรณ์พื้นฐานของ Python" },
      { id: "operators", title: "เครื่องหมายการดำเนินการ", description: "ตัวดำเนินการทางคณิตศาสตร์และตรรกะ" },
      { id: "numbers", title: "เลข", description: "การทำงานกับตัวเลข" },
      { id: "strings", title: "สตริง", description: "การจัดการข้อความ" },
      { id: "variables", title: "ตัวแปร", description: "การประกาศและใช้งานตัวแปร" },
      { id: "arrays", title: "อาร์เรย์", description: "การใช้งานลิสต์และอาร์เรย์" },
      { id: "conditionals", title: "เงื่อนไข", description: "การใช้ if, elif และ else" },
      { id: "loops", title: "ลูป", description: "การใช้ for และ while loops" },
    ],
  },
]

export default function DocsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [userData, setUserData] = useState([])
  const [showLevelDialog, setShowLevelDialog] = useState(false)

  const handleLevelSelection = (level: number) => {
    setSkillLevel(level)
    setShowLevelDialog(false)
  }
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserProfile()
        if (!user) {
          router.push("/login")
          return
        }
        setUserData(user)
        if (user.skillLevel === 0) {
          setShowLevelDialog(true)
        }

      } catch (err) {
        console.error("Error fetching userData:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Level Selection Dialog */}
      <PythonSkillDialog
        open={showLevelDialog}
        onOpenChange={setShowLevelDialog}
        onLevelSelected={handleLevelSelection}
      />

      <main className="flex-grow py-12">
        <div className="container max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">คอร์ส Python</h1>
              <p className="text-muted-foreground">เรียนรู้ Python ตั้งแต่พื้นฐานไปจนถึงขั้นสูง</p>
            </div>

            <div className="gap-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FontAwesomeIcon icon={faGamepad} className="mr-2 h-5 w-5 text-primary" />
                    เรียนรู้ผ่านการเล่น
                  </CardTitle>
                  <CardDescription>ทดสอบความรู้ของคุณผ่านเกมมินิและแบบฝึกหัดที่สนุกสนาน</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    ถ้าการเรียนมันน่าเบื่อจะเรียนไปทำไม? นั้นสิเพราะพวกเราไม่มีการเรียน มีแต่การเล่น ได้ทั้งประโยชน์ ความรู้ และ ความสนุก
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-secondary/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <FontAwesomeIcon icon={faListCheck} className="mr-2 h-4 w-4 text-green-500" />
                          อธิบายอย่างละเอียด
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-secondary/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <FontAwesomeIcon icon={faGamepad} className="mr-2 h-4 w-4 text-blue-500" />
                          เกม
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-secondary/30">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <FontAwesomeIcon icon={faCode} className="mr-2 h-4 w-4 text-purple-500" />
                          โค้ดตัวอย่าง
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => router.push("/docs/basics/intro")}>
                    เริ่มต้นเรียนรู้ตอนนี้
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-9">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FontAwesomeIcon icon={category.icon} className={`mr-2 h-5 w-5 ${category.color}`} />
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.topics.slice(0, 3).map((topic) => (
                          <li key={topic.id} className="flex items-center">
                            <FontAwesomeIcon icon={faBook} className="mr-2 h-3 w-3 text-muted-foreground" />
                            <Link
                              href={`/docs/${category.id}/${topic.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {topic.title}
                            </Link>
                          </li>
                        ))}
                        {category.topics.length > 3 && (
                          <li className="text-muted-foreground text-sm">และอีก {category.topics.length - 3} หัวข้อ</li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => router.push(`/docs/${category.id}/${category.topics[0].id}`)}
                      >
                        เริ่มเรียนรู้
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
