"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Code2, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { useToast } from "@/components/ui/use-toast"
import { loginUser, getUserProfile } from "@/lib/api"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserProfile()
      if (user) {
        router.push("/lobby")
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        const result = await loginUser(formData.username, formData.password)

        if (result.success) {
          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: "ยินดีต้อนรับกลับมา!",
            variant: "success",
          })

          router.push("/lobby")
        } else {
          setErrors((prev) => ({
            ...prev,
            general: result.message,
          }))

          toast({
            title: "เข้าสู่ระบบไม่สำเร็จ",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Login error:", error)
        setErrors((prev) => ({
          ...prev,
          general: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
        }))

        toast({
          title: "เกิดข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Code2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">ยินดีต้อนรับกลับ, นัก KeyCoder</h1>
            </div>

            <div className="space-y-4 border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="ชื่อผู้ใช้"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      กำลังเข้าสู่ระบบ...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      เข้าสู่ระบบ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">ยังไม่มีบัญชี?</span>{" "}
              <Link href="/signup" className="text-primary hover:underline">
                สมัครสมาชิก
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
