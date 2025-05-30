"use client"
import { useState } from "react"
import { Check, Calendar, Clock, MapPin, ArrowLeft, ArrowRight, Repeat, CalendarRange } from "lucide-react"
import type { ServiceSelectionData } from "../types/booking"

type ServiceOption = {
  id: string
  name: string
  description: string
  duration: string
  price: string
  category: string
  selected: boolean
}

type ServiceSelectionProps = {
  services: ServiceOption[]
  onSubmit: (data: ServiceSelectionData) => void
  onBack: () => void
}

// Extended ServiceSelectionData to include recurring and multi-day options
type ExtendedServiceSelectionData = ServiceSelectionData & {
  isRecurring: boolean
  recurringFrequency: string | null
  recurringEndDate: string | null
  isMultiDay: boolean
  endDate: string | null
}

export default function ServiceSelection({ services, onSubmit, onBack }: ServiceSelectionProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState<Omit<ExtendedServiceSelectionData, "services">>({
    date: "",
    time: "",
    timezone: "America/Los_Angeles",
    notes: "",
    isRecurring: false,
    recurringFrequency: null,
    recurringEndDate: null,
    isMultiDay: false,
    endDate: null,
  })

  const toggleService = (serviceId: string, category: string) => {
    if (category !== "Add-On") {
      // For main services, deselect any other main service
      const otherMainServices = services.filter((s) => s.category !== "Add-On" && s.id !== serviceId).map((s) => s.id)

      setSelectedServices((prev) => {
        // Remove other main services
        const filtered = prev.filter((id) => !otherMainServices.includes(id))

        // Toggle the current service
        if (filtered.includes(serviceId)) {
          return filtered.filter((id) => id !== serviceId)
        } else {
          return [...filtered, serviceId]
        }
      })
    } else {
      // For add-ons, simply toggle
      setSelectedServices((prev) => {
        if (prev.includes(serviceId)) {
          return prev.filter((id) => id !== serviceId)
        } else {
          return [...prev, serviceId]
        }
      })
    }
  }

  const updateFormData = (field: keyof Omit<ExtendedServiceSelectionData, "services">, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  const handleSubmit = () => {
    const selectedServiceNames = services
      .filter((service) => selectedServices.includes(service.id))
      .map((service) => service.name)

    onSubmit({
      services: selectedServiceNames,
      date: formData.date,
      time: formData.time,
      timezone: formData.timezone,
      notes: formData.notes,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.recurringFrequency,
      recurringEndDate: formData.recurringEndDate,
      isMultiDay: formData.isMultiDay,
      endDate: formData.endDate,
    })
  }

  const validateStep = () => {
    if (currentStep === 1) {
      // Ensure at least one main service is selected
      return services.some((service) => service.category !== "Add-On" && selectedServices.includes(service.id))
    } else if (currentStep === 2) {
      // Basic validation for date and time
      if (!formData.date || !formData.time) return false

      // If recurring is selected, validate recurring fields
      if (formData.isRecurring && (!formData.recurringFrequency || !formData.recurringEndDate)) return false

      // If multi-day is selected, validate end date
      if (formData.isMultiDay && !formData.endDate) return false

      return true
    }
    return false
  }

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      const period = hour < 12 ? "AM" : "PM"
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const hourStr = hour.toString().padStart(2, "0")

      // Add the option for the hour (e.g., "9:00 AM")
      options.push({
        value: `${hourStr}:00`,
        display: `${displayHour}:00 ${period}`,
      })

      // Add the option for the half hour (e.g., "9:30 AM")
      options.push({
        value: `${hourStr}:30`,
        display: `${displayHour}:30 ${period}`,
      })
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  // Group services by category
  const mainServices = services.filter((service) => service.category !== "Add-On")
  const addOnServices = services.filter((service) => service.category === "Add-On")

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#E75837] mb-2 header-font">Service Selection</h2>
        <p className="text-gray-600 body-font">
          Please select the services you'd like to book with your Critter professional.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex flex-col items-center ${
              currentStep >= 1 ? "text-[#E75837]" : "text-gray-400"
            } transition-colors`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                currentStep >= 1 ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <span className="text-xs">Services</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-[#E75837]" : "bg-gray-200"}`}></div>
          <div
            className={`flex flex-col items-center ${
              currentStep >= 2 ? "text-[#E75837]" : "text-gray-400"
            } transition-colors`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                currentStep >= 2 ? "bg-[#E75837] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <span className="text-xs">Scheduling</span>
          </div>
        </div>
      </div>

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Main Services */}
          <div>
            <h3 className="text-lg font-medium mb-4 header-font">Main Services (select one)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id, service.category)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedServices.includes(service.id)
                      ? "border-[#E75837] bg-[#fff8f6]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium header-font">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 body-font">{service.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500 body-font">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-gray-800 header-font">{service.price}</span>
                      {selectedServices.includes(service.id) && (
                        <div className="w-6 h-6 bg-[#E75837] rounded-full flex items-center justify-center mt-2">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-On Services */}
          {addOnServices.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 header-font">Add-On Services (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addOnServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id, service.category)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedServices.includes(service.id)
                        ? "border-[#745E25] bg-[#f9f7f2]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium header-font">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 body-font">{service.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500 body-font">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-gray-800 header-font">{service.price}</span>
                        {selectedServices.includes(service.id) && (
                          <div className="w-6 h-6 bg-[#745E25] rounded-full flex items-center justify-center mt-2">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Scheduling */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                Date*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => updateFormData("date", e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                Time*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="time"
                  value={formData.time}
                  onChange={(e) => updateFormData("time", e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font appearance-none"
                  required
                >
                  <option value="">Select a time</option>
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.display}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2 header-font">
              Timezone*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => updateFormData("timezone", e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                required
              >
                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                <option value="America/Denver">Mountain Time (Denver)</option>
                <option value="America/Chicago">Central Time (Chicago)</option>
                <option value="America/New_York">Eastern Time (New York)</option>
                <option value="Europe/London">London, UK (GMT/BST)</option>
                <option value="Europe/Paris">Paris, France (CET/CEST)</option>
                <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
                <option value="Australia/Sydney">Sydney, Australia (AEST/AEDT)</option>
              </select>
            </div>
          </div>

          {/* Recurring Booking Option */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-3">
              <Repeat className="h-5 w-5 text-[#E75837] mr-2" />
              <h3 className="text-md font-medium header-font">Recurring Booking</h3>
            </div>

            <div className="mb-4">
              <label className="flex items-center body-font">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
                  checked={formData.isRecurring}
                  onChange={(e) => updateFormData("isRecurring", e.target.checked)}
                />
                This is a recurring booking
              </label>
            </div>

            {formData.isRecurring && (
              <div className="pl-6 space-y-4">
                <div>
                  <label
                    htmlFor="recurringFrequency"
                    className="block text-sm font-medium text-gray-700 mb-2 header-font"
                  >
                    Frequency*
                  </label>
                  <select
                    id="recurringFrequency"
                    value={formData.recurringFrequency || ""}
                    onChange={(e) => updateFormData("recurringFrequency", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                    required={formData.isRecurring}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="recurringEndDate"
                    className="block text-sm font-medium text-gray-700 mb-2 header-font"
                  >
                    End Date*
                  </label>
                  <input
                    type="date"
                    id="recurringEndDate"
                    value={formData.recurringEndDate || ""}
                    onChange={(e) => updateFormData("recurringEndDate", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                    required={formData.isRecurring}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Multi-Day Booking Option */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-3">
              <CalendarRange className="h-5 w-5 text-[#E75837] mr-2" />
              <h3 className="text-md font-medium header-font">Multi-Day Booking</h3>
            </div>

            <div className="mb-4">
              <label className="flex items-center body-font">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-[#E75837] focus:ring-2 focus:ring-[#E75837] border-gray-300 rounded"
                  checked={formData.isMultiDay}
                  onChange={(e) => updateFormData("isMultiDay", e.target.checked)}
                />
                This booking spans multiple days
              </label>
            </div>

            {formData.isMultiDay && (
              <div className="pl-6">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate || ""}
                  onChange={(e) => updateFormData("endDate", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                  required={formData.isMultiDay}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 header-font">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
              placeholder="Any special requests or information for your appointment"
              rows={4}
            ></textarea>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <button
          type="button"
          onClick={nextStep}
          disabled={!validateStep()}
          className={`flex items-center px-6 py-2 rounded-lg text-white transition-colors body-font ${
            validateStep() ? "bg-[#E75837] hover:bg-[#d04e30]" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentStep < 2 ? (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            "Submit Booking Request"
          )}
        </button>
      </div>
    </div>
  )
}
