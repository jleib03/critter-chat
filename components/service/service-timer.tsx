"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Square, Clock } from "lucide-react"

type ServiceStatus = "not_started" | "in_progress" | "completed"

interface ServiceTimerProps {
  status: ServiceStatus
  startTime: Date | null
  onStart: () => void
  onEnd: () => void
}

export function ServiceTimer({ status, startTime, onStart, onEnd }: ServiceTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (status === "in_progress" && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#E75837]" />
            <span className="font-semibold header-font">Service Timer</span>
          </div>

          <div className="text-3xl font-mono font-bold text-gray-900 mb-4">
            {status === "in_progress" ? formatTime(elapsedTime) : "00:00"}
          </div>

          {status === "not_started" && (
            <Button onClick={onStart} className="w-full bg-green-600 hover:bg-green-700 text-white body-font">
              <Play className="w-4 h-4 mr-2" />
              Start Service
            </Button>
          )}

          {status === "in_progress" && (
            <Button onClick={onEnd} className="w-full bg-red-600 hover:bg-red-700 text-white body-font">
              <Square className="w-4 h-4 mr-2" />
              End Service
            </Button>
          )}

          {status === "completed" && <div className="text-green-600 font-medium body-font">Service Completed</div>}
        </div>
      </CardContent>
    </Card>
  )
}
