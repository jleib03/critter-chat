"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X, ArrowRight, Clock, DollarSign } from "lucide-react"
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
    <div className="space-y-8">
      {/* Header */}
      {!summaryOnly && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold header-font text-gray-900">Choose Your Services</h2>
            <p className="text-gray-600 body-font mt-1">Select the services you need for your pet</p>
          </div>
          {selectedServices.length > 0 && onContinue && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500 body-font">
                  {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
                </div>
                <div className="text-lg font-semibold text-gray-900 body-font">
                  {formatTotalDuration(totalDuration)} • ${totalCost.toFixed(0)}
                </div>
              </div>
              <Button
                onClick={onContinue}
                className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border border-orange-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E75837] to-[#d14a2a] text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold">{selectedServices.length}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 header-font">Selected Services</h3>
                  <p className="text-gray-600 body-font">
                    {formatTotalDuration(totalDuration)} total • ${totalCost.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedServices.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#E75837] to-[#d14a2a] text-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 body-font">{service.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 body-font flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(service.duration_number, service.duration_unit)}
                          </span>
                          <span className="text-sm font-semibold text-[#E75837] body-font flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatPrice(service.customer_cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!summaryOnly && (
                      <button
                        onClick={() => onServiceSelect(service)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Categories - Only show if not summary only */}
      {!summaryOnly && (
        <div className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div
              key={category}
              className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-50 transition-all duration-200 flex items-center justify-between group"
              >
                <h3 className="text-xl font-bold text-[#E75837] header-font group-hover:text-[#d14a2a] transition-colors duration-200">
                  {category}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 body-font">
                    {services.length} service{services.length !== 1 ? "s" : ""}
                  </span>
                  <div className="p-1 rounded-lg bg-white/50 group-hover:bg-white transition-colors duration-200">
                    {expandedCategories[category] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>

              {(expandedCategories[category] ||
                selectedServices.some((selected) => services.some((service) => service.name === selected.name))) && (
                <div className="p-6 bg-white space-y-4">
                  {services.map((service, index) => {
                    const isSelected = selectedServices.some((selected) => selected.name === service.name)
                    return (
                      <div
                        key={index}
                        className={`group relative rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-[#E75837] shadow-md transform scale-[1.02]"
                            : "bg-gray-50 hover:bg-white border-2 border-transparent hover:border-gray-200 hover:shadow-md"
                        }`}
                        onClick={() => onServiceSelect(service)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? "border-[#E75837] bg-[#E75837] text-white shadow-lg"
                                  : "border-gray-300 bg-white group-hover:border-[#E75837] group-hover:bg-orange-50"
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
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-lg font-bold ${isSelected ? "text-[#E75837]" : "text-gray-900 group-hover:text-[#E75837]"} header-font transition-colors duration-200`}
                              >
                                {service.name}
                              </h4>
                              {service.description && (
                                <p className="text-gray-600 body-font mt-2 leading-relaxed">{service.description}</p>
                              )}
                              <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <div className="p-1 bg-gray-100 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className="body-font font-medium">
                                    {formatDuration(service.duration_number, service.duration_unit)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-green-100 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                  </div>
                                  <span className="body-font font-bold text-gray-900 text-lg">
                                    {formatPrice(service.customer_cost)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div
                          className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                            isSelected ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                          } bg-gradient-to-r from-orange-50/50 to-transparent pointer-events-none`}
                        ></div>
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
