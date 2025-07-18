import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"

import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"

config.autoAddCss = false

export const metadata: Metadata = {
  title: "KeyCoder",
  description: "KeyCoder - โปรแกรม คีย์โค้ดเดอร์ คือเว็บแอปพลิเคชันเพื่อการศึกษาที่พัฒนาขึ้นเพื่อส่งเสริมการเรียนรู้ภาษา Python สำหรับเยาวชนและผู้เริ่มต้น โดยเน้นกระบวนการเรียนรู้แบบเป็นขั้นตอน ภายใต้แนวคิด “เรียนรู้ก่อน และฝึกฝนผ่านการแข่งขัน” เพื่อให้ผู้ใช้สามารถพัฒนาทักษะอย่างเป็นระบบ มีความเข้าใจที่ถูกต้อง และสามารถนำไปประยุกต์ใช้ได้จริง",
  icons: {
     icon: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fira-code@6.2.0/distr/fira_code.css" />
      </head>
      <body className="min-h-screen bg-background font-['LINE_Seed_Sans_TH']">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
