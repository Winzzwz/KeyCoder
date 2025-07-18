"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { updateTheme } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = async () => {
    // Explicitly set the theme based on current state
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Update theme in API
    const themeValue = newTheme === "light" ? 0 : 1
    try {
      const result = await updateTheme(themeValue)

      if (!result.success) {
        toast({
          title: "ข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating theme:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตธีมได้",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
    >
      {theme === "dark" ? (
        <FontAwesomeIcon icon={faSun} className="h-5 w-5" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="h-5 w-5" />
      )}
      <span className="sr-only">{theme === "dark" ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}</span>
    </Button>
  )
}
