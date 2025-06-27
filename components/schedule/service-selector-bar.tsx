"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/schedule"

type ServiceSelectorBarProps = {
  servicesByCategory: { [category: string]: Service[] }
  selectedServices: Service[]
  onServiceSelect: (service: Service) => void
  onContinue?: () => void
  summaryOnly?: boolean
}

export function ServiceSelectorBar({
  servicesByCategory,
  selectedServices,
  onServiceSelect,
  onContinue,
  summaryOnly = false,
}: ServiceSelectorBarProps) {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

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
      return duration === 1 ? `${duration}h` : `${duration}h`
    }
    if (unit === "Days") {
      return duration === 1 ? `${duration} day` : `${duration} days`
    }
    return `${duration} ${unit.toLowerCase()}`
  }

  const formatPrice = (price: string | number) => {
    return `$${Number.parseFloat(price.toString()).toFixed(0)}`
  }

  // Calculate totals
  const totalDuration = selectedServices.reduce((sum, service) => {
    let durationInMinutes = service.duration_number
    if (service.duration_unit === "Hours") {
      durationInMinutes = service.duration_number * 60
    } else if (service.duration_unit === "Days") {
      durationInMinutes = service.duration_number * 24 * 60
    }
    return sum + durationInMinutes
  }, 0)

  const totalCost = selectedServices.reduce((sum, service) => {
    return sum + Number.parseFloat(service.customer_cost.toString())
  }, 0)

  const formatTotalDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold header-font text-gray-900">Select Services</h2>
        {selectedServices.length > 0 && onContinue && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 body-font">
              {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} •{" "}
              {formatTotalDuration(totalDuration)} • ${totalCost.toFixed(0)}
            </span>
            <Button onClick={onContinue} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font">
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {selectedServices.length}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 header-font">Selected Services</h3>
                <p className="text-sm text-gray-600 body-font">
                  {formatTotalDuration(totalDuration)} • ${totalCost.toFixed(0)} total
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedServices.map((service, index) => (
              <div
                key={index}
                className="bg-white border border-orange-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 body-font">{service.name}</p>
                    <p className="text-sm text-[#E75837] body-font">
                      {formatDuration(service.duration_number, service.duration_unit)} •{" "}
                      {formatPrice(service.customer_cost)}
                    </p>
                  </div>
                </div>
                {!summaryOnly && (
                  <button
                    onClick={() => onServiceSelect(service)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Categories - Only show if not summary only */}
      {!summaryOnly && (
        <div className="space-y-4">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <h3 className="text-lg font-medium text-[#E75837] header-font">{category}</h3>
                {expandedCategories[category] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {(expandedCategories[category] ||
                selectedServices.some((selected) => services.some((service) => service.name === selected.name))) && (
                <div className="p-6 space-y-4">
                  {services.map((service, index) => {
                    const isSelected = selectedServices.some((selected) => selected.name === service.name)
                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected
                            ? "border-[#E75837] bg-orange-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => onServiceSelect(service)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-[#E75837] bg-[#E75837] text-white" : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 body-font">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-gray-600 body-font mt-1">{service.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm text-gray-600 body-font">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {formatDuration(service.duration_number, service.duration_unit)}
                              </span>
                              <span className="font-medium text-gray-900">{formatPrice(service.customer_cost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
