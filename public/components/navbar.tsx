"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faTimes,
  faCode,
  faHome,
  faBook,
  faGamepad,
  faCog,
  faTrophy,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons"
import { getUserProfile } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  username: string
  elo: number
  win: number
  loss: number
  level: number
  course: number
  rank: number
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserProfile()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("https://keycoder.college/api/user/logout", {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        toast({
          title: "ออกจากระบบสำเร็จ",
          description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
        })


        setUser(null)
        router.push("/login")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { href: "/", label: "หน้าหลัก", icon: faHome },
    { href: "/docs", label: "คอร์ส", icon: faBook },
    { href: "/lobby", label: "ห้องเกม", icon: faGamepad },
    { href: "/leaderboard", label: "อันดับ", icon: faTrophy },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCode} className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">
            <span className="text-primary">Key</span>Coder
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground">({user.elo} ELO)</span>
              </div>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">สมัครสมาชิก</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/40 bg-background overflow-hidden"
          >
            <div className="container py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-border/40">
                {isLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm">
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.username}</span>
                      <span className="text-muted-foreground">({user.elo} ELO)</span>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
                      <span>การตั้งค่า</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setIsOpen(false)}
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}