const BookingConfirmation = ({ selectedService, selectedTimeSlot }) => {
  return (
    <div className="booking-confirmation">
      <h2 className="text-2xl font-bold">Booking Confirmation</h2>
      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 header-font">Booking Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Service:</span>
            <span className="font-medium body-font">{selectedService.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Date:</span>
            <span className="font-medium body-font">
              {selectedTimeSlot.dayOfWeek},{" "}
              {new Date(selectedTimeSlot.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Time:</span>
            <span className="font-medium body-font">
              {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Duration:</span>
            <span className="font-medium body-font">
              {selectedService.duration_number} {selectedService.duration_unit.toLowerCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 body-font">Cost:</span>
            <span className="font-medium body-font">
              {selectedService.customer_cost_currency} {selectedService.customer_cost}
            </span>
          </div>
          {selectedTimeSlot.employeeNames && (
            <div className="flex justify-between">
              <span className="text-gray-600 body-font">Available Staff:</span>
              <span className="font-medium body-font">{selectedTimeSlot.employeeNames}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
</merged_code>
