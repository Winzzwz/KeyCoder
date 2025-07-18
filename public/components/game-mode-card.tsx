"use client"

import { motion } from "framer-motion"
import { ArrowRight, Clock, Code } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface GameModeCardProps {
  title: string
  description: string
  type: "casual" | "ranked" | "practice"
  mode?: "fastest" | "shortest"
  href: string
  delay?: number
}

export function GameModeCard({ title, description, type, mode, href, delay = 0 }: GameModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{title}</CardTitle>
            <Badge
              variant={type === "ranked" ? "default" : "secondary"}
              className={type === "ranked" ? "bg-primary" : ""}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {mode && (
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <span className="flex items-center">
                {mode === "fastest" ? (
                  <>
                    <Clock className="mr-1 h-4 w-4 text-primary" />
                    Fastest Solution
                  </>
                ) : (
                  <>
                    <Code className="mr-1 h-4 w-4 text-primary" />
                    Shortest Solution
                  </>
                )}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link href={href} className="w-full">
            <Button className="w-full group">
              <span className="mr-2">Start Coding</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
