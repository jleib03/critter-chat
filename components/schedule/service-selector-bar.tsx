"use client"

import type { Service, ServicesByCategory } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, ChevronDown, X, ArrowRight } from "lucide-react"
import { useState } from "react"

type ServiceSelectorBarProps = {
  servicesByCategory: ServicesByCategory
  selectedServices: Service[]
  onServiceSelect: (service: Service) => void
  onContinue?: () => void
}

export function ServiceSelectorBar({
  servicesByCategory,
  selectedServices,
  onServiceSelect,
  onContinue,
}: ServiceSelectorBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDuration = (duration: number, unit: string) => {
    if (unit === "Minutes") {
      if (duration >= 60) {
        const hours = Math.floor(duration / 60)
        const minutes = duration % 60
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${duration}m`
    }
    if (unit === "Hours") {
      return duration === 1 ? `${duration} hour` : `${duration} hours`
    }
    if (unit === "Days") {
      return duration === 1 ? `${duration} day` : `${duration} days`
    }
    return `${duration} ${unit.toLowerCase()}`
  }

  const formatPrice = (price: string) => {
    return `$${Number.parseFloat(price).toFixed(0)}`
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      let durationInMinutes = service.duration_number
      if (service.duration_unit === "Hours") {
        durationInMinutes = service.duration_number * 60
      } else if (service.duration_unit === "Days") {
        durationInMinutes = service.duration_number * 24 * 60
      }
      return total + durationInMinutes
    }, 0)
  }

  const calculateTotalCost = () => {
    return selectedServices.reduce((total, service) => {
      return total + Number.parseFloat(service.customer_cost)
    }, 0)
  }

  const isServiceSelected = (service: Service) => {
    return selectedServices.some((s) => s.name === service.name)
  }

  const removeService = (serviceToRemove: Service) => {
    onServiceSelect(serviceToRemove) // This will toggle it off
  }

  const allServices = Object.values(servicesByCategory).flat()
  const totalDurationMinutes = calculateTotalDuration()
  const totalCost = calculateTotalCost()

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 header-font">Select Services</h2>
        {selectedServices.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 body-font">
              {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} •{" "}
              {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m • ${totalCost.toFixed(0)}
            </div>
            {onContinue && (
              <Button onClick={onContinue} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font" size="sm">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 header-font">Selected Services</h3>
            <div className="text-sm font-medium text-[#E75837] body-font">
              {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} •
              {Math.floor(totalDurationMinutes / 60) > 0 && ` ${Math.floor(totalDurationMinutes / 60)}h`}
              {totalDurationMinutes % 60 > 0 && ` ${totalDurationMinutes % 60}m`} • ${totalCost.toFixed(0)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedServices.map((service, index) => (
              <div
                key={`selected-${index}`}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-2 border-orange-300 shadow-sm"
              >
                <div className="w-4 h-4 bg-[#E75837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span className="font-medium body-font">{service.name}</span>
                <span className="text-gray-500 text-sm body-font">
                  {formatDuration(service.duration_number, service.duration_unit)}
                </span>
                <button
                  onClick={() => removeService(service)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {onContinue && (
            <div className="flex justify-center">
              <Button
                onClick={onContinue}
                className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-8 py-3 text-lg font-semibold body-font shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Continue with {selectedServices.length} Service{selectedServices.length !== 1 ? "s" : ""}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 text-left body-font"
      >
        <span className="text-gray-900">
          {selectedServices.length > 0
            ? `${selectedServices.length} service${selectedServices.length !== 1 ? "s" : ""} selected`
            : "Choose services..."}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category}>
              <div className="px-4 py-2 bg-gray-50 border-b">
                <h3 className="text-sm font-medium text-[#E75837] capitalize header-font">{category}</h3>
              </div>
              {services.map((service, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => {
                    onServiceSelect(service)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                    isServiceSelected(service) ? "bg-orange-50 border-l-4 border-l-[#E75837] shadow-sm" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isServiceSelected(service)
                              ? "bg-[#E75837] border-[#E75837] text-white"
                              : "border-gray-300 hover:border-[#E75837]"
                          }`}
                        >
                          {isServiceSelected(service) && <span className="text-xs font-bold">✓</span>}
                        </div>
                        <h4
                          className={`font-medium ${isServiceSelected(service) ? "text-[#E75837]" : "text-gray-900"} header-font`}
                        >
                          {service.name}
                        </h4>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1 body-font line-clamp-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="body-font">
                            {formatDuration(service.duration_number, service.duration_unit)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <DollarSign className="w-3 h-3" />
                          <span className="body-font font-medium">{formatPrice(service.customer_cost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
