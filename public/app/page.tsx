"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode, faArrowRight, faBook } from "@fortawesome/free-solid-svg-icons"
import { Code2 } from "lucide-react"

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
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
                className="hero-icon"
              >
                <Code2 className="h-56 w-56 text-primary" />
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold tracking-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="text-primary">Key</span>Coder
              </motion.h1>

              <motion.p
                className="max-w-2xl text-xl text-muted-foreground"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                พัฒนาทักษะการเขียนโค้ดของคุณด้วยเกมแข่งขันเขียนโค้ด ไต่แรงก์และกลายเป็นแชมป์ 👑
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/signup" className="w-full">
                  <Button size="lg" className="w-full">
                    เริ่มต้นใช้งาน
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/docs" className="w-full">
                  <Button size="lg" variant="outline" className="w-full">
                    <FontAwesomeIcon icon={faBook} className="mr-2 h-4 w-4" />
                    เริ่มต้นเรียนรู้
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
              </Link>
              ,
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
