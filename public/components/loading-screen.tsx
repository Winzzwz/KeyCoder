"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Code2 } from "lucide-react"

const phrases = [
  "เธอคือ syntax ที่ถูกต้องที่สุดในใจ...",
  "อยากเป็นตัวแปรในชีวิตเธอ ถึงจะเป็นแค่ local ก็ยอม...",
  "ตั้งแต่เจอเธอ `print('เขิน')` ไม่หยุดเลย...",
  "ถ้าเธอคือ error ฉันก็ยอมไม่ debug...",
  "ถ้าใจเธอเป็น boolean ขอให้มันเป็น True ตลอดไป...",
  "เธอคือ class ที่ไม่มีใครสามารถสืบทอดได้...",
  "เธอคือ global variable ที่ฉันไม่อยาก reset...",
  "ความรู้สึกที่มีให้เธอ ไม่มี if ไม่มี else มีแต่ always...",
  "รู้ไหม เวลาเธอยิ้ม ใจฉันขึ้น warning ว่า 'หัวใจ overload'...",
  "ถ้าใจเธอมีค่าเป็น None ก็ขอให้เป็น None ที่ฉันได้ครอบครอง...",
  "return รักเธอ แบบไม่มี condition...",
  "อยากเป็น Python ที่ได้อยู่ในทุกบรรทัดชีวิตเธอ...",
  "ขอ compile รอยยิ้มเธอไว้ใน memory ตลอดไปได้ไหม...",
  "รักเราจะไม่มี break มีแต่ continue...",
  "แม้จะเจอ error มากมาย แต่เจอเธอทีไรก็พร้อม try ใหม่เสมอ...",
  "เธอคือ input ที่ทำให้หัวใจฉันมี output เป็นรอยยิ้ม...",
  "ไม่รู้ว่าเธอใช่ไหม แต่ใจมัน import มาไว้ก่อนแล้ว...",
]

const LoadingMessage = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * phrases.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.p
      key={phrases[index]}
      className="text-muted-foreground mt-4 text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {phrases[index]}
    </motion.p>
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="hero-icon"
      >
        <Code2 className="h-20 w-20 text-primary" />
      </motion.div>

      <motion.h1
        className="text-2xl md:text-3xl font-bold mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="text-primary">Key</span>Coder
      </motion.h1>

      <motion.div
        className="mt-8 h-1 w-48 bg-secondary overflow-hidden rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <LoadingMessage />
    </div>
  )
}
