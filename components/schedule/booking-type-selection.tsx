"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Repeat, Moon, ArrowLeft, ArrowRight } from "lucide-react"
import type { Service } from "@/types/schedule"

interface BookingTypeSelectionProps {
  selectedServices: Service[]
  onBookingTypeSelect: (type: "one-time" | "recurring" | "multi-day") => void
  onBack: () => void
}

export function BookingTypeSelection({ selectedServices, onBookingTypeSelect, onBack }: BookingTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<"one-time" | "recurring" | "multi-day" | null>(null)

  // Calculate total duration of selected services
  const totalDuration = selectedServices.reduce((total, service) => {
    return total + (service.duration || 0)
  }, 0)

  // If total duration is > 12 hours (720 minutes), only show multi-day option
  const isMultiDayOnly = totalDuration > 720

  const handleContinue = () => {
    if (selectedType) {
      onBookingTypeSelect(selectedType)
    }
  }

  // If multi-day only, automatically select and continue
  if (isMultiDayOnly && selectedType !== "multi-day") {
    setSelectedType("multi-day")
    onBookingTypeSelect("multi-day")
    return null
  }

  const bookingOptions = isMultiDayOnly
    ? [
        {
          id: "multi-day" as const,
          title: "Multi-Day / Overnight Stay",
          description: "Perfect for extended care, boarding, or overnight services",
          icon: Moon,
          recommended: true,
        },
      ]
    : [
        {
          id: "one-time" as const,
          title: "One-Time Service",
          description: "Schedule a single appointment for your selected services",
          icon: Calendar,
          recommended: false,
        },
        {
          id: "recurring" as const,
          title: "Recurring Service",
          description: "Set up regular appointments (weekly, bi-weekly, monthly)",
          icon: Repeat,
          recommended: false,
        },
      ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#E75837] header-font">
          {isMultiDayOnly ? "Booking Type" : "Choose Your Booking Type"}
        </CardTitle>
        {isMultiDayOnly && (
          <p className="text-gray-600 body-font">
            Based on your selected services (total duration: {Math.round(totalDuration / 60)} hours), we recommend our
            multi-day booking option.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {bookingOptions.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedType === option.id ? "border-[#E75837] bg-orange-50" : "border-gray-200 hover:border-gray-300"
                } ${option.recommended ? "ring-2 ring-[#E75837] ring-opacity-20" : ""}`}
                onClick={() => setSelectedType(option.id)}
              >
                {option.recommended && (
                  <div className="absolute -top-2 left-4 bg-[#E75837] text-white text-xs px-2 py-1 rounded">
                    Recommended
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedType === option.id ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg header-font">{option.title}</h3>
                    <p className="text-gray-600 body-font">{option.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedType === option.id ? "border-[#E75837] bg-[#E75837]" : "border-gray-300"
                    }`}
                  >
                    {selectedType === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedType} className="bg-[#E75837] hover:bg-[#d04e30]">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
