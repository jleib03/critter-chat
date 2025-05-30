"use client"

import { Calendar, CalendarDays, FileText, PenLine, X } from "lucide-react"

type ActionBubblesProps = {
  onActionSelect: (action: string) => void
  disabled?: boolean
}

export default function ActionBubbles({ onActionSelect, disabled = false }: ActionBubblesProps) {
  return (
    <div className="mt-8 mb-4">
      <p className="text-sm text-gray-600 mb-4 body-font">
        {disabled
          ? "Please complete your information on the left to get started:"
          : "What would you like to do today? Select an option:"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => !disabled && onActionSelect("new_booking")}
          disabled={disabled}
          className={`p-4 rounded-lg text-sm text-left transition-all flex flex-col body-font ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-[#E75837] hover:bg-[#fff8f6] text-gray-800 hover:shadow-md"
          }`}
        >
          <div className="flex mb-2">
            <Calendar className={`h-5 w-5 mr-2 ${disabled ? "text-gray-400" : "text-[#E75837]"}`} />
            <span className="font-medium header-font">Request a new booking</span>
          </div>
          <p className="text-xs text-gray-500">Schedule a new service with your professional</p>
        </button>

        <button
          onClick={() => !disabled && onActionSelect("change_booking")}
          disabled={disabled}
          className={`p-4 rounded-lg text-sm text-left transition-all flex flex-col body-font ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-[#E75837] hover:bg-[#fff8f6] text-gray-800 hover:shadow-md"
          }`}
        >
          <div className="flex mb-2">
            <PenLine className={`h-5 w-5 mr-2 ${disabled ? "text-gray-400" : "text-[#E75837]"}`} />
            <span className="font-medium header-font">Change existing booking</span>
          </div>
          <p className="text-xs text-gray-500">Modify date, time, or details of a booking</p>
        </button>

        <button
          onClick={() => !disabled && onActionSelect("cancel_booking")}
          disabled={disabled}
          className={`p-4 rounded-lg text-sm text-left transition-all flex flex-col body-font ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-[#745E25] hover:bg-[#f9f7f2] text-gray-800 hover:shadow-md"
          }`}
        >
          <div className="flex mb-2">
            <X className={`h-5 w-5 mr-2 ${disabled ? "text-gray-400" : "text-[#745E25]"}`} />
            <span className="font-medium header-font">Cancel a booking</span>
          </div>
          <p className="text-xs text-gray-500">Cancel an upcoming appointment</p>
        </button>

        <button
          onClick={() => !disabled && onActionSelect("list_bookings")}
          disabled={disabled}
          className={`p-4 rounded-lg text-sm text-left transition-all flex flex-col body-font ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-[#745E25] hover:bg-[#f9f7f2] text-gray-800 hover:shadow-md"
          }`}
        >
          <div className="flex mb-2">
            <CalendarDays className={`h-5 w-5 mr-2 ${disabled ? "text-gray-400" : "text-[#745E25]"}`} />
            <span className="font-medium header-font">See upcoming bookings</span>
          </div>
          <p className="text-xs text-gray-500">View all your scheduled appointments</p>
        </button>

        <button
          onClick={() => !disabled && onActionSelect("list_outstanding")}
          disabled={disabled}
          className={`p-4 rounded-lg text-sm text-left transition-all flex flex-col body-font ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-[#94ABD6] hover:bg-[#f5f8fd] text-gray-800 hover:shadow-md"
          }`}
        >
          <div className="flex mb-2">
            <FileText className={`h-5 w-5 mr-2 ${disabled ? "text-gray-400" : "text-[#94ABD6]"}`} />
            <span className="font-medium header-font">Review open invoices</span>
          </div>
          <p className="text-xs text-gray-500">Check any outstanding payments</p>
        </button>
      </div>
    </div>
  )
}
