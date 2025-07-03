"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Heart,
  CheckCircle2,
  Phone,
  MessageCircle,
  Camera,
  Stethoscope,
  Activity,
  FileText,
  Bell,
  Star,
} from "lucide-react"
import { DEMO_SERVICE_REQUEST } from "@/utils/demo-data"

type ServiceUpdate = {
  id: string
  timestamp: string
  type: "start" | "task_completed" | "note" | "photo" | "end"
  title: string
  description: string
  category?: "medical" | "exercise" | "comfort" | "documentation"
  professionalNote?: string
  photoUrl?: string
}

export default function CustomerServiceTrackingPage() {
  const params = useParams()
  const serviceId = params.serviceId as string

  const [serviceStatus, setServiceStatus] = useState<"scheduled" | "in_progress" | "completed">("scheduled")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [updates, setUpdates] = useState<ServiceUpdate[]>([])
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks] = useState(9)
  const [showNotification, setShowNotification] = useState(false)

  const pet = DEMO_SERVICE_REQUEST.pets[0]
  const customer = DEMO_SERVICE_REQUEST.contactInfo
  const professional = {
    name: "Dr. Sarah Mitchell",
    title: "Certified Pet Care Specialist",
    rating: 4.9,
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "(555) 123-4567",
    specialties: ["Post-Surgical Care", "Senior Pet Care", "Medication Management"],
  }

  // Simulate real-time updates
  useEffect(() => {
    const simulateService = async () => {
      // Start service after 2 seconds
      setTimeout(() => {
        const now = new Date()
        setServiceStatus("in_progress")
        setStartTime(now)
        addUpdate({
          id: "start",
          timestamp: now.toISOString(),
          type: "start",
          title: "Service Started",
          description: `Dr. Sarah has arrived and begun ${pet.name}'s care session`,
        })
      }, 2000)

      // Add updates every 30 seconds
      const updateSchedule = [
        {
          delay: 5000,
          update: {
            type: "task_completed" as const,
            title: "Medication Administered",
            description: "Carprofen 75mg given with food as prescribed",
            category: "medical" as const,
            professionalNote: "Luna took medication well, no resistance. Mixed with her favorite wet food.",
          },
        },
        {
          delay: 8000,
          update: {
            type: "photo" as const,
            title: "Progress Photo",
            description: "Luna resting comfortably after medication",
            photoUrl: "/placeholder.svg?height=200&width=300",
          },
        },
        {
          delay: 12000,
          update: {
            type: "task_completed" as const,
            title: "Joint Supplement Given",
            description: "Daily joint supplement administered",
            category: "medical" as const,
            professionalNote: "Mixed supplement with wet food as noted in profile. Luna ate everything.",
          },
        },
        {
          delay: 16000,
          update: {
            type: "task_completed" as const,
            title: "Surgical Site Inspection",
            description: "Hip surgery site checked for healing progress",
            category: "medical" as const,
            professionalNote:
              "Healing looks excellent. No swelling, discharge, or irritation. Incision site is clean and dry.",
          },
        },
        {
          delay: 20000,
          update: {
            type: "task_completed" as const,
            title: "Gentle Exercise Completed",
            description: "10-minute slow walk on flat surfaces",
            category: "exercise" as const,
            professionalNote: "Luna walked well with minimal limping. Good energy and enthusiasm for the walk.",
          },
        },
        {
          delay: 24000,
          update: {
            type: "photo" as const,
            title: "Exercise Photo",
            description: "Luna enjoying her gentle walk",
            photoUrl: "/placeholder.svg?height=200&width=300",
          },
        },
        {
          delay: 28000,
          update: {
            type: "task_completed" as const,
            title: "Mental Stimulation Activity",
            description: "Puzzle toy session completed",
            category: "exercise" as const,
            professionalNote:
              "Luna engaged well with the treat-dispensing puzzle toy. Great mental stimulation without physical strain.",
          },
        },
        {
          delay: 32000,
          update: {
            type: "task_completed" as const,
            title: "Comfort Assessment",
            description: "Pain and comfort levels evaluated",
            category: "comfort" as const,
            professionalNote: "Luna appears comfortable and pain-free. Good appetite, normal behavior, tail wagging.",
          },
        },
        {
          delay: 36000,
          update: {
            type: "task_completed" as const,
            title: "Documentation Complete",
            description: "Service notes and photos compiled",
            category: "documentation" as const,
            professionalNote: "Comprehensive care report prepared with photos and detailed observations.",
          },
        },
        {
          delay: 40000,
          update: {
            type: "end" as const,
            title: "Service Completed",
            description: "Care session finished successfully. Detailed report being prepared.",
          },
        },
      ]

      updateSchedule.forEach(({ delay, update }) => {
        setTimeout(() => {
          const now = new Date()
          addUpdate({
            id: `update_${Date.now()}`,
            timestamp: now.toISOString(),
            ...update,
          })

          if (update.type === "task_completed") {
            setCompletedTasks((prev) => prev + 1)
          }

          if (update.type === "end") {
            setServiceStatus("completed")
          }

          // Show notification
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 3000)
        }, delay)
      })
    }

    simulateService()
  }, [])

  const addUpdate = (update: ServiceUpdate) => {
    setUpdates((prev) => [update, ...prev])
  }

  const getUpdateIcon = (type: string, category?: string) => {
    switch (type) {
      case "start":
        return <Clock className="w-4 h-4 text-green-600" />
      case "end":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case "photo":
        return <Camera className="w-4 h-4 text-purple-600" />
      case "task_completed":
        switch (category) {
          case "medical":
            return <Stethoscope className="w-4 h-4 text-red-600" />
          case "exercise":
            return <Activity className="w-4 h-4 text-blue-600" />
          case "comfort":
            return <Heart className="w-4 h-4 text-purple-600" />
          case "documentation":
            return <FileText className="w-4 h-4 text-green-600" />
          default:
            return <CheckCircle2 className="w-4 h-4 text-green-600" />
        }
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getUpdateColor = (type: string, category?: string) => {
    switch (type) {
      case "start":
        return "bg-green-50 border-green-200"
      case "end":
        return "bg-blue-50 border-blue-200"
      case "photo":
        return "bg-purple-50 border-purple-200"
      case "task_completed":
        switch (category) {
          case "medical":
            return "bg-red-50 border-red-200"
          case "exercise":
            return "bg-blue-50 border-blue-200"
          case "comfort":
            return "bg-purple-50 border-purple-200"
          case "documentation":
            return "bg-green-50 border-green-200"
          default:
            return "bg-gray-50 border-gray-200"
        }
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getElapsedTime = () => {
    if (!startTime) return "Not started"
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60)
    return `${elapsed} minutes`
  }

  const progressPercentage = (completedTasks / totalTasks) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900 header-font">New Update</p>
              <p className="text-sm text-green-700 body-font">Care plan progress updated</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">{pet.name}'s Care Session</h1>
              <p className="text-gray-600 body-font">Post-surgical care with {professional.name}</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    serviceStatus === "scheduled"
                      ? "bg-gray-400"
                      : serviceStatus === "in_progress"
                        ? "bg-green-500 animate-pulse"
                        : "bg-blue-500"
                  }`}
                />
                <span className="font-medium header-font">
                  {serviceStatus === "scheduled" && "Scheduled"}
                  {serviceStatus === "in_progress" && "In Progress"}
                  {serviceStatus === "completed" && "Completed"}
                </span>
              </div>
              <p className="text-sm text-gray-600 body-font">Duration: {getElapsedTime()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 body-font">Care Plan Progress</span>
              <span className="text-gray-900 font-medium body-font">
                {completedTasks} of {totalTasks} tasks completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet & Professional Info */}
          <div className="space-y-6">
            {/* Pet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg header-font text-[#E75837]">{pet.name}'s Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium header-font">{pet.breed}</p>
                    <p className="text-sm text-gray-600 body-font">{pet.age} years old</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="outline" className="body-font">
                    Post-Op Day 14
                  </Badge>
                  <Badge variant="outline" className="body-font">
                    Hip Surgery Recovery
                  </Badge>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 body-font">
                    <strong>Special Care:</strong> {pet.specialNotes}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg header-font text-[#E75837]">Your Care Professional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={professional.avatar || "/placeholder.svg"} />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium header-font">{professional.name}</p>
                    <p className="text-sm text-gray-600 body-font">{professional.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium body-font">{professional.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {professional.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs body-font">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1 body-font bg-transparent">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 body-font bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Updates Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl header-font text-[#E75837] flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Live Care Updates
                  </CardTitle>
                  {serviceStatus === "in_progress" && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-600 body-font">Live</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {updates.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 body-font">Waiting for your care professional to arrive...</p>
                    <p className="text-sm text-gray-400 body-font mt-2">
                      You'll receive real-time updates once the service begins
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update, index) => (
                      <div key={update.id} className="relative">
                        {/* Timeline line */}
                        {index < updates.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />}

                        <div className={`p-4 rounded-lg border ${getUpdateColor(update.type, update.category)}`}>
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center">
                              {getUpdateIcon(update.type, update.category)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 header-font">{update.title}</h4>
                                <span className="text-sm text-gray-500 body-font">{formatTime(update.timestamp)}</span>
                              </div>

                              <p className="text-gray-700 body-font mb-2">{update.description}</p>

                              {update.professionalNote && (
                                <div className="bg-white bg-opacity-70 rounded p-3 border">
                                  <p className="text-sm text-gray-700 body-font">
                                    <strong>Professional Note:</strong> {update.professionalNote}
                                  </p>
                                </div>
                              )}

                              {update.photoUrl && (
                                <div className="mt-3">
                                  <img
                                    src={update.photoUrl || "/placeholder.svg"}
                                    alt="Care update photo"
                                    className="rounded-lg border max-w-xs"
                                  />
                                </div>
                              )}

                              {update.category && (
                                <Badge variant="outline" className="mt-2 text-xs body-font">
                                  {update.category.charAt(0).toUpperCase() + update.category.slice(1)} Care
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Real-time indicator */}
                {serviceStatus === "in_progress" && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-green-800 header-font">Real-Time Updates Active</span>
                    </div>
                    <p className="text-sm text-green-700 body-font">
                      You're receiving live updates as {professional.name} completes each care task for {pet.name}.
                      You'll get a detailed report when the session is complete.
                    </p>
                  </div>
                )}

                {serviceStatus === "completed" && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800 header-font">Service Completed Successfully</span>
                    </div>
                    <p className="text-sm text-blue-700 body-font">
                      {professional.name} has finished {pet.name}'s care session. A detailed after-action report will be
                      sent to your email shortly.
                    </p>
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white body-font">
                      View Full Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
