"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { Code2 } from "lucide-react"

export default function NotFound() {
  const [isLoading, setIsLoading] = useState(true)
  const [randomMessage, setRandomMessage] = useState("")

  const funnyMessages = [
    "หน้าเว็ป อยู่ในอากาศ อยู่ที่ว่าคุณจะคว้ามันมาได้รึเปล่า 🫰",
    "หน้าเว็ป หนีไปเล่น เกมปลูกผัก🥬",
    "พี่จ๋า ไม่ไหวแล้ว หน้าเว็ปไม่โหลด 😨",
    "หน้าเว็ป เผลอหลับ 🛏️",
    "หน้าเว็ป โดนไซเบ่า 💔",
    "เเต่ถ้า หน้าเว็ป ทุกหน้าเป็นของผม 😈",
    "AI ทำให้ หน้าเว็ป สมองฝ่อ 😭",
    "ลืม prompt ให้ AI เขียน หน้าเว็ป นี้ให้ 😭",
    "ผมน่าจะลืมเขียน หน้าเว็ป นี้ครับ 🙏",
    "เลิกแงะ เว็ป ผมเถอะครับ 🙏",
    "Ctrl + S เพื่อก็อปหน้าเว็ป 🤩"
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    setRandomMessage(
      funnyMessages[Math.floor(Math.random() * funnyMessages.length)]
    )

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background z-0"></div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container relative z-10"
          >
            <div className="flex flex-col items-center text-center space-y-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* <Code2 className="h-56 w-56 text-primary" /> */}
                <div className = "text-primary text-9xl font-bold">
                    &lt;/404&gt;
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-4xl tracking-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <b>เคล็ด(ไม่)ลับ:</b> <span dangerouslySetInnerHTML={{ __html: randomMessage }} />
              </motion.h1>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/" className="w-full">
                  <Button size="lg" className="w-full">
                    กลับไปหน้าหลัก
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FontAwesomeIcon icon={faCode} className="h-5 w-5 text-primary" />
              <span className="font-semibold">KeyCoder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <Link href="https://www.nstda.or.th/nsc/" target="_blank" className="hover:text-primary transition-colors ml-1">
                <b>NSC2025</b>
              </Link> •
              <Link href="https://thomasu.tech/" target="_blank" className="hover:text-primary transition-colors ml-1">
                Front-End by Thomas
              </Link>,
              <Link href="https://github.com/Winzzwz" target="_blank" className="hover:text-primary transition-colors ml-1">
                Back-End by Win
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
