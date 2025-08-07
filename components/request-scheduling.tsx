"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from 'lucide-react'

type SchedulingData = {
  bookingType: "one-time" | "recurring"
  date: Date | undefined
  time: string
  recurringEndDate?: string
  recurringDays?: string[]
}

type RequestSchedulingProps = {
  onSubmit: (data: SchedulingData) => void
  onBack: () => void
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function RequestScheduling({ onSubmit, onBack }: RequestSchedulingProps) {
  const [bookingType, setBookingType] = useState<"one-time" | "recurring">("one-time")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("09:00")
  const [recurringEndDate, setRecurringEndDate] = useState("")
  const [recurringDays, setRecurringDays] = useState<string[]>([])

  const handleDayToggle = (day: string) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = () => {
    const data: SchedulingData = {
      bookingType,
      date,
      time,
    }
    if (bookingType === "recurring") {
      data.recurringEndDate = recurringEndDate
      data.recurringDays = recurringDays
    }
    onSubmit(data)
  }

  const isFormValid = () => {
    if (!date || !time) return false
    if (bookingType === "recurring") {
      return recurringDays.length > 0 && recurringEndDate !== ""
    }
    return true
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="header-font text-2xl">Request a Date and Time</CardTitle>
        <p className="body-font text-gray-600">
          Please provide your preferred date and time for the service. This is a request and will be confirmed by the professional.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="body-font font-medium">Booking Type</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={bookingType === "one-time" ? "default" : "outline"}
              onClick={() => setBookingType("one-time")}
              className={`flex-1 ${bookingType === 'one-time' ? 'bg-[#E75837] text-white hover:bg-[#d04e30]' : 'bg-transparent'}`}
            >
              One-Time
            </Button>
            <Button
              variant={bookingType === "recurring" ? "default" : "outline"}
              onClick={() => setBookingType("recurring")}
              className={`flex-1 ${bookingType === 'recurring' ? 'bg-[#E75837] text-white hover:bg-[#d04e30]' : 'bg-transparent'}`}
            >
              Recurring
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Label className="font-medium text-gray-700 mb-2 self-start">Preferred Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="time" className="font-medium text-gray-700">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2"
              />
            </div>
            {bookingType === "recurring" && (
              <div className="space-y-4 pt-6 border-t">
                <div>
                  <Label className="body-font font-medium">Recurring Days</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day}
                        variant={recurringDays.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDayToggle(day)}
                        className={`${recurringDays.includes(day) ? 'bg-[#E75837] text-white hover:bg-[#d04e30]' : 'bg-transparent'}`}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="recurring-end-date" className="body-font font-medium">End Date for Recurring Service</Label>
                  <Input
                    id="recurring-end-date"
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="mt-2"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-8 border-t">
          <Button variant="outline" onClick={onBack} className="bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()} className="bg-[#E75837] hover:bg-[#d04e30] text-white">
            Continue to Confirmation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
