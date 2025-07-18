"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Key, Mail, Eye, EyeOff, Save, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Navbar } from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { useToast } from "@/components/ui/use-toast"
import { getUserProfile, changePassword, updateTheme } from "@/lib/api"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [userData, setUserData] = useState({
    email: "",
    username: "",
    theme: 1,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [usernameData, setUsernameData] = useState({
    newUsername: "",
  })

  const [isSaving, setIsSaving] = useState({
    password: false,
    username: false,
    theme: false,
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = await getUserProfile()
      if (user) {
        setUserData({
          email: user.email,
          username: user.username,
          theme: user.settings.theme,
        })

        setTheme(user.settings.theme === 0 ? "light" : "dark")

        setIsLoading(false)
      } else {
        router.push("/login")
      }
    }

    fetchUserProfile()
    setUserData(userData)
    setIsLoading(false)
  }, [router, setTheme])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameData({
      newUsername: e.target.value,
    })
  }

  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? 1 : 0
    setIsSaving((prev) => ({ ...prev, theme: true }))

    try {
      const result = await updateTheme(newTheme)

      if (result.success) {
        setUserData((prev) => ({
          ...prev,
          theme: newTheme,
        }))

        setTheme(newTheme === 0 ? "light" : "dark")

        toast({
          title: "บันทึกการตั้งค่าสำเร็จ",
          description: "ธีมของคุณได้รับการอัปเดตแล้ว",
          variant: "success",
        })
      } else {
        toast({
          title: "บันทึกการตั้งค่าไม่สำเร็จ",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating theme:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการอัปเดตธีม กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSaving((prev) => ({ ...prev, theme: false }))
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
        variant: "destructive",
      })
      return
    }

    setIsSaving((prev) => ({ ...prev, password: true }))

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)

      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        toast({
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          description: "รหัสผ่านของคุณได้รับการอัปเดตแล้ว",
          variant: "success",
        })
      } else {
        toast({
          title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSaving((prev) => ({ ...prev, password: false }))
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">การตั้งค่า</h1>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    ข้อมูลบัญชี
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>อีเมล</Label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{userData.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>ชื่อผู้ใช้</Label>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userData.username}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="mr-2 h-5 w-5 text-primary" />
                    ธีม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="theme-toggle">โหมดมืด</Label>
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Switch
                      id="theme-toggle"
                      checked={userData.theme === 1}
                      onCheckedChange={handleThemeChange}
                      disabled={isSaving.theme}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="mr-2 h-5 w-5 text-primary" />
                    เปลี่ยนรหัสผ่าน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        isSaving.password
                      }
                    >
                      {isSaving.password ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          กำลังบันทึก...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          บันทึกรหัสผ่าน
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
