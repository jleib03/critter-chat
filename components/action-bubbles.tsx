"use client"

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
          : "Pick from the options below to get started on your request:"}
      </p>

      {/* Existing customer options */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => !disabled && onActionSelect("new_booking")}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors body-font ${
            disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
          }`}
        >
          Request a new booking
        </button>
        <button
          onClick={() => !disabled && onActionSelect("change_booking")}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors body-font ${
            disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
          }`}
        >
          Make a change to an existing booking
        </button>
        <button
          onClick={() => !disabled && onActionSelect("cancel_booking")}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors body-font ${
            disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
          }`}
        >
          Cancel an existing booking
        </button>
        <button
          onClick={() => !disabled && onActionSelect("list_bookings")}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors body-font ${
            disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
          }`}
        >
          See upcoming bookings
        </button>
        <button
          onClick={() => !disabled && onActionSelect("list_outstanding")}
          disabled={disabled}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors body-font ${
            disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#E75837] hover:bg-[#d04e30] text-white"
          }`}
        >
          Review open invoices
        </button>
      </div>
    </div>
  )
}
