import Image from "next/image"
import { cn } from "@/lib/utils"

type RankTier = "rookie" | "normie" | "intermediate" | "expert" | "master" | "grandmaster" | "superior" | "champion"

interface RankBadgeProps {
  elo: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function getRankTier(elo: number): RankTier {
  if (elo <= 100) return "rookie"
  if (elo <= 250) return "normie"
  if (elo <= 500) return "intermediate"
  if (elo <= 1200) return "expert"
  if (elo <= 1500) return "master"
  if (elo <= 1700) return "grandmaster"
  if (elo <= 1900) return "superior"
  return "champion"
}

export function getRankName(tier: RankTier): string {
  switch (tier) {
    case "rookie":
      return "มือใหม่"
    case "normie":
      return "ธรรมดา"
    case "intermediate":
      return "ปานกลาง"
    case "expert":
      return "ผู้เชี่ยวชาญ"
    case "master":
      return "มาสเตอร์"
    case "grandmaster":
      return "แกรนด์มาสเตอร์"
    case "superior":
      return "ซูพีเรียร์ แกรนด์มาสเตอร์"
    case "champion":
      return "แกรนด์มาสเตอร์ แชมเปี้ยน"
    default:
      return "-"
  }
}

export function RankBadge({ elo, showLabel = true, size = "md", className }: RankBadgeProps) {
  const tier = getRankTier(elo)
  const rankName = getRankName(tier)

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <Image src={`/rank-icons/${tier}.png`} alt={rankName} fill className="object-contain" />
      </div>
      {showLabel && (
        <span className="font-medium">
          {rankName} ({elo})
        </span>
      )}
    </div>
  )
}
