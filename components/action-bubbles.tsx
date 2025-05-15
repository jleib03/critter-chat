"use client"

type ActionBubblesProps = {
  onActionSelect: (action: string) => void
}

export default function ActionBubbles({ onActionSelect }: ActionBubblesProps) {
  return (
    <div className="mt-8 mb-4">
      <p className="text-sm text-gray-600 mb-4 body-font">
        Then, pick from the options below to get started on your request:
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onActionSelect("new_booking")}
          className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
        >
          Request a new booking
        </button>
        <button
          onClick={() => onActionSelect("change_booking")}
          className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
        >
          Make a change to an existing booking
        </button>
        <button
          onClick={() => onActionSelect("cancel_booking")}
          className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
        >
          Cancel an existing booking
        </button>
        <button
          onClick={() => onActionSelect("list_bookings")}
          className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
        >
          See upcoming bookings
        </button>
        <button
          onClick={() => onActionSelect("list_outstanding")}
          className="px-4 py-2 bg-[#E75837] hover:bg-[#d04e30] text-white rounded-full text-sm font-medium transition-colors body-font"
        >
          Review open invoices
        </button>
      </div>
    </div>
  )
}
