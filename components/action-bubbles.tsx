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

      {/* New customer option - visually separated */}
      <div className="mb-5">
        <button
          onClick={() => onActionSelect("new_customer")}
          className="px-4 py-2 bg-[#745E25] hover:bg-[#5d4b1e] text-white rounded-full text-sm font-medium transition-colors body-font w-full sm:w-auto"
        >
          I'm a new customer
        </button>
        <p className="text-xs text-gray-500 mt-1 body-font">
          First time using Critter? Select this option to get started.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center mb-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-xs text-gray-500 body-font">Existing Customer Options</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Existing customer options */}
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
