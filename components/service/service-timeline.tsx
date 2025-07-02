"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, Play, Square, Camera, FileText, Stethoscope, Activity, Heart } from "lucide-react"

type TimelineEvent = {
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

const eventIcons = {
  start: Play,
  completion: CheckCircle2,
  note: FileText,
  photo: Camera,
  end: Square,
}

const categoryIcons = {
  medical: Stethoscope,
  exercise: Activity,
  feeding: Heart,
  comfort: Heart,
  documentation: FileText,
}

const eventColors = {
  start: "bg-green-50 border-green-200 text-green-800",
  completion: "bg-blue-50 border-blue-200 text-blue-800",
  note: "bg-gray-50 border-gray-200 text-gray-800",
  photo: "bg-purple-50 border-purple-200 text-purple-800",
  end: "bg-red-50 border-red-200 text-red-800",
}

export function ServiceTimeline({ events, serviceStatus }: ServiceTimelineProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 header-font">
          <Clock className="w-5 h-5 text-[#E75837]" />
          Service Timeline
        </CardTitle>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              serviceStatus === "not_started"
                ? "bg-gray-400"
                : serviceStatus === "in_progress"
                  ? "bg-green-500 animate-pulse"
                  : "bg-blue-500"
            }`}
          />
          <span className="text-sm text-gray-600 body-font">
            {serviceStatus === "not_started"
              ? "Ready to Start"
              : serviceStatus === "in_progress"
                ? "Service Active"
                : "Service Complete"}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm body-font">Timeline will appear when service starts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              const Icon = eventIcons[event.type]
              const CategoryIcon = event.category ? categoryIcons[event.category as keyof typeof categoryIcons] : null

              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < events.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200" />}

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${eventColors[event.type]} flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 header-font">{event.title}</span>
                        {CategoryIcon && <CategoryIcon className="w-3 h-3 text-gray-500" />}
                        <span className="text-xs text-gray-500 body-font">{formatTime(event.timestamp)}</span>
                      </div>

                      {event.description && <p className="text-sm text-gray-600 body-font">{event.description}</p>}

                      {event.category && (
                        <Badge variant="outline" className="mt-1 text-xs body-font">
                          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Live updates indicator */}
        {serviceStatus === "in_progress" && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-800 font-medium body-font">Live Updates Active</span>
            </div>
            <p className="text-xs text-green-700 mt-1 body-font">
              Customer receives real-time notifications as tasks are completed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
