"use client"
import type { Service } from "@/types/schedule"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

interface ParsedWebhookData {
  professional_info: {
    professional_id: string
    professional_name: string
  }
  schedule: {
    working_days: {
      day: string
      start: string
      end: string
      isWorking: boolean
    }[]
  }
  bookings: {
    all_booking_data: any[]
  }
  services: {
    services_by_category: { [category: string]: Service[] }
  }
  config: any
  booking_preferences: {
    business_name?: string
    booking_system?: string
    allow_direct_booking?: boolean
    require_approval?: boolean
    online_booking_enabled?: boolean
  } | null
}

const InactiveSchedulePage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-md p-8">
        <h1 className="text-2xl font-semibold text-gray-500 mb-4">Inactive Schedule</h1>
        <p className="text-gray-700">This schedule is currently inactive.</p>
      </div>
    </div>
  )
}

export default InactiveSchedulePage
