"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ServiceTimer } from "@/components/service/service-timer"
import { CarePlan } from "@/components/service/care-plan"
import { ServiceTimeline } from "@/components/service/service-timeline"
import { AfterActionReport } from "@/components/service/after-action-report"
import { DEMO_SERVICE_REQUEST } from "@/utils/demo-data"

type ServiceStatus = "not_started" | "in_progress" | "completed"
type CarePlanItem = {
  id: string
  category: "medical" | "exercise" | "feeding" | "comfort" | "documentation"
  title: string
  description: string
  completed: boolean
  completedAt?: string
  notes?: string
  autoCompleted?: boolean
  fromProfile?: boolean
}

export default function ServiceDeliveryPage() {
  const params = useParams()
  const serviceId = params.serviceId as string

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>("not_started")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [carePlanItems, setCarePlanItems] = useState<CarePlanItem[]>([
    {
      id: "med_1",
      category: "medical",
      title: "Administer Carprofen 75mg",
      description: "Give prescribed pain medication with food as directed by vet",
      completed: false,
      autoCompleted: true,
      fromProfile: true,
    },
    {
      id: "med_2",
      category: "medical",
      title: "Joint Supplement Administration",
      description: "Provide daily joint supplement - Luna takes it mixed with wet food",
      completed: false,
      autoCompleted: true,
      fromProfile: true,
    },
    {
      id: "med_3",
      category: "medical",
      title: "Hip Surgery Site Check",
      description: "Visual inspection of surgical site for swelling, discharge, or irritation",
      completed: false,
    },
    {
      id: "exercise_1",
      category: "exercise",
      title: "Gentle 10-Minute Walk",
      description: "Short, slow-paced walk on flat surfaces only - no stairs or inclines",
      completed: false,
      fromProfile: true,
    },
    {
      id: "exercise_2",
      category: "exercise",
      title: "Mental Stimulation Activity",
      description: "Puzzle toy or gentle training session - Luna enjoys treat-dispensing toys",
      completed: false,
      autoCompleted: true,
      fromProfile: true,
    },
    {
      id: "comfort_1",
      category: "comfort",
      title: "Comfort Assessment",
      description: "Monitor for signs of pain or discomfort, note any changes in behavior",
      completed: false,
    },
    {
      id: "comfort_2",
      category: "comfort",
      title: "Orthopedic Bed Check",
      description: "Ensure Luna has access to supportive bedding for hip comfort",
      completed: false,
    },
    {
      id: "doc_1",
      category: "documentation",
      title: "Photo Documentation",
      description: "Take photos of Luna's activity and general condition",
      completed: false,
    },
    {
      id: "doc_2",
      category: "documentation",
      title: "Behavior & Mood Notes",
      description: "Document Luna's energy level, appetite, and overall demeanor",
      completed: false,
    },
  ])

  const [timelineEvents, setTimelineEvents] = useState<
    Array<{
      id: string
      timestamp: string
      type: "start" | "completion" | "note" | "photo" | "end"
      title: string
      description?: string
      category?: string
    }>
  >([])

  const [showAfterActionReport, setShowAfterActionReport] = useState(false)

  const pet = DEMO_SERVICE_REQUEST.pets[0]
  const customer = DEMO_SERVICE_REQUEST.contactInfo

  const handleStartService = () => {
    const now = new Date()
    setServiceStatus("in_progress")
    setStartTime(now)

    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `start_${Date.now()}`,
        timestamp: now.toISOString(),
        type: "start",
        title: "Service Started",
        description: "Beginning care session with Luna",
      },
    ])
  }

  const handleEndService = () => {
    const now = new Date()
    setServiceStatus("completed")
    setEndTime(now)

    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `end_${Date.now()}`,
        timestamp: now.toISOString(),
        type: "end",
        title: "Service Completed",
        description: "Care session finished successfully",
      },
    ])

    // Show after action report after a brief delay
    setTimeout(() => {
      setShowAfterActionReport(true)
    }, 1000)
  }

  const handleCarePlanItemComplete = (itemId: string, notes?: string) => {
    const now = new Date()

    setCarePlanItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: true, completedAt: now.toISOString(), notes } : item,
      ),
    )

    const item = carePlanItems.find((i) => i.id === itemId)
    if (item) {
      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `complete_${itemId}_${Date.now()}`,
          timestamp: now.toISOString(),
          type: "completion",
          title: item.title,
          description: notes || item.description,
          category: item.category,
        },
      ])
    }
  }

  const completedItems = carePlanItems.filter((item) => item.completed).length
  const totalItems = carePlanItems.length
  const progressPercentage = (completedItems / totalItems) * 100

  if (showAfterActionReport) {
    return (
      <AfterActionReport
        pet={pet}
        customer={customer}
        carePlanItems={carePlanItems}
        timelineEvents={timelineEvents}
        startTime={startTime!}
        endTime={endTime!}
        onClose={() => setShowAfterActionReport(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Service Delivery - {pet.name}</h1>
              <p className="text-gray-600 body-font">
                Post-surgical care session with {customer.firstName} {customer.lastName}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="body-font">
                  {pet.breed} • {pet.age} years old
                </Badge>
                <Badge variant="outline" className="body-font">
                  Post-Op Day 14
                </Badge>
                <Badge variant="outline" className="body-font">
                  Hip Surgery Recovery
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <ServiceTimer
                status={serviceStatus}
                startTime={startTime}
                onStart={handleStartService}
                onEnd={handleEndService}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Care Plan - Left Column */}
          <div className="lg:col-span-2">
            <CarePlan
              items={carePlanItems}
              onItemComplete={handleCarePlanItemComplete}
              progressPercentage={progressPercentage}
              pet={pet}
              serviceActive={serviceStatus === "in_progress"}
            />
          </div>

          {/* Timeline - Right Column */}
          <div>
            <ServiceTimeline events={timelineEvents} serviceStatus={serviceStatus} />
          </div>
        </div>
      </div>
    </div>
  )
}
