"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle2, MessageSquare, Camera, Square, Activity, Heart, Pill, FileText } from "lucide-react"

interface TimelineEvent {
  id: string
  timestamp: string
  type: "start" | "completion" | "note" | "photo" | "end"
  title: string
  description?: string
  category?: string
}

interface ServiceTimelineProps {
  events: TimelineEvent[]
  serviceStatus: "not_started" | "in_progress" | "completed"
}

export function ServiceTimeline({ events, serviceStatus }: ServiceTimelineProps) {
  const getEventIcon = (type: string, category?: string) => {
    switch (type) {
      case "start":
        return <Play className="w-4 h-4 text-green-600" />
      case "end":
        return <Square className="w-4 h-4 text-red-600" />
      case "completion":
        switch (category) {
          case "medical":
            return <Pill className="w-4 h-4 text-red-600" />
          case "exercise":
            return <Activity className="w-4 h-4 text-blue-600" />
          case "comfort":
            return <Heart className="w-4 h-4 text-purple-600" />
          case "documentation":
            return <FileText className="w-4 h-4 text-green-600" />
          default:
            return <CheckCircle2 className="w-4 h-4 text-green-600" />
        }
      case "note":
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case "photo":
        return <Camera className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getEventColor = (type: string, category?: string) => {
    switch (type) {
      case "start":
        return "border-green-200 bg-green-50"
      case "end":
        return "border-red-200 bg-red-50"
      case "completion":
        switch (category) {
          case "medical":
            return "border-red-200 bg-red-50"
          case "exercise":
            return "border-blue-200 bg-blue-50"
          case "comfort":
            return "border-purple-200 bg-purple-50"
          case "documentation":
            return "border-green-200 bg-green-50"
          default:
            return "border-green-200 bg-green-50"
        }
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg header-font text-[#E75837] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Live Service Timeline
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={serviceStatus === "in_progress" ? "default" : "secondary"} className="body-font">
            {serviceStatus === "not_started" && "Ready to Start"}
            {serviceStatus === "in_progress" && "In Progress"}
            {serviceStatus === "completed" && "Completed"}
          </Badge>
          {serviceStatus === "in_progress" && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 body-font">Live</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 body-font">Timeline will appear when service starts</div>
        ) : (
          <div className="space-y-4">
            {events
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={event.id} className="relative">
                  {index < events.length - 1 && <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-200"></div>}

                  <div className={`flex gap-3 p-3 rounded-lg border ${getEventColor(event.type, event.category)}`}>
                    <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.type, event.category)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 body-font text-sm">{event.title}</h4>
                        <span className="text-xs text-gray-500 body-font">{formatTime(event.timestamp)}</span>
                      </div>

                      {event.description && <p className="text-xs text-gray-600 body-font">{event.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {serviceStatus === "in_progress" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium body-font">Real-time updates</span>
            </div>
            <p className="text-blue-700 text-xs mt-1 body-font">
              Customer receives live notifications as care plan items are completed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
