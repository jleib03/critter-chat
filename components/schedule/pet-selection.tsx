import type React from "react"

interface PetSelectionProps {
  selectedTimeSlot: {
    date: string
    time: string
  }
  selectedPet: {
    name: string
    breed: string
  } | null // Allow selectedPet to be null
}

const PetSelection: React.FC<PetSelectionProps> = ({ selectedTimeSlot, selectedPet }) => {
  const displayDate = (() => {
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
      <h3>Booking Summary</h3>
      <p>
        <b>Date:</b> {displayDate}
      </p>
      <p>
        <b>Time:</b> {selectedTimeSlot.time}
      </p>
      <p>
        <b>Pet Name:</b> {selectedPet?.name || "No pet selected"}
      </p>
      <p>
        <b>Pet Breed:</b> {selectedPet?.breed || "No pet selected"}
      </p>
    </div>
  )
}

// keep default export for flexibility
export default PetSelection

// add the missing *named* export expected elsewhere
export { PetSelection }
