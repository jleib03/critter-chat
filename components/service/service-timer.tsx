"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Square, Clock } from "lucide-react"

interface ServiceTimerProps {
  status: "not_started" | "in_progress" | "completed"
  startTime: Date | null
  onStart: () => void
  onEnd: () => void
}

export function ServiceTimer({ status, startTime, onStart, onEnd }: ServiceTimerProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "in_progress" && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = now.getTime() - startTime.getTime()

        const hours = Math.floor(elapsed / (1000 * 60 * 60))
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        )
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, startTime])

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-[#E75837]" />
            <span className="font-medium header-font">Service Timer</span>
          </div>

          <div className="text-3xl font-mono font-bold text-gray-900">{elapsedTime}</div>

          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "not_started"
                  ? "bg-gray-400"
                  : status === "in_progress"
                    ? "bg-green-500 animate-pulse"
                    : "bg-blue-500"
              }`}
            />
            <span className="text-sm text-gray-600 body-font">
              {status === "not_started" && "Ready to Start"}
              {status === "in_progress" && "Service Active"}
              {status === "completed" && "Service Complete"}
            </span>
          </div>

          <div className="flex gap-2">
            {status === "not_started" && (
              <Button onClick={onStart} className="flex-1 bg-green-600 hover:bg-green-700 text-white body-font">
                <Play className="w-4 h-4 mr-2" />
                Start Service
              </Button>
            )}

            {status === "in_progress" && (
              <Button onClick={onEnd} className="flex-1 bg-red-600 hover:bg-red-700 text-white body-font">
                <Square className="w-4 h-4 mr-2" />
                End Service
              </Button>
            )}

            {status === "completed" && (
              <div className="flex-1 text-center py-2 text-green-600 font-medium body-font">Service Completed</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
