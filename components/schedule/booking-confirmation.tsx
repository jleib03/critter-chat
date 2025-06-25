import type React from "react"

interface BookingConfirmationProps {
  selectedTimeSlot: {
    date: string
    startTime: string
    endTime: string
  }
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ selectedTimeSlot }) => {
  const displayDate = (() => {
    // Parse the date string directly without timezone conversion
    const [year, month, day] = selectedTimeSlot.date.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  })()

  return (
    <div>
      <h2>Booking Confirmation</h2>
      <p>You have successfully booked a session on:</p>
      <p>
        <b>Date:</b> {displayDate}
      </p>
      <p>
        <b>Time:</b> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
      </p>
    </div>
  )
}

export default BookingConfirmation
