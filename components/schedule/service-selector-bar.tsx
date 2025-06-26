"use client"

import type React from "react"

import type { Service, ServicesByCategory } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, X, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ServiceSelectorBarProps = {
  servicesByCategory: ServicesByCategory
  selectedServices: Service[]
  onServiceSelect: (service: Service) => void
  onContinue?: () => void
  summaryOnly?: boolean // New prop to control whether to show full menu or just summary
}

export function ServiceSelectorBar({
  servicesByCategory,
  selectedServices,
  onServiceSelect,
  onContinue,
  summaryOnly = false,
}: ServiceSelectorBarProps) {
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

  const formatPrice = (price: string | number) => {
    return `$${Number.parseFloat(price.toString()).toFixed(0)}`
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
      return total + Number.parseFloat(service.customer_cost.toString())
    }, 0)
  }

  const isServiceSelected = (service: Service) => {
    return selectedServices.some((s) => s.name === service.name)
  }

  const handleServiceClick = (service: Service, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log("Service clicked:", service.name)
    onServiceSelect(service)
  }

  const removeService = (serviceToRemove: Service) => {
    onServiceSelect(serviceToRemove)
  }

  const totalDurationMinutes = calculateTotalDuration()
  const totalCost = calculateTotalCost()

  // If summary only and no services selected, don't render anything
  if (summaryOnly && selectedServices.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header - only show for full selector, not summary */}
      {!summaryOnly && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 header-font">Select Services</h2>
          {selectedServices.length > 0 && onContinue && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 body-font">
                {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} •{" "}
                {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m • ${totalCost.toFixed(0)}
              </div>
              <Button onClick={onContinue} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font" size="sm">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selected Services Summary - show if we have selected services */}
      {selectedServices.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E75837] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{selectedServices.length}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 header-font">Selected Services</h3>
                <p className="text-sm text-gray-600 body-font">
                  {Math.floor(totalDurationMinutes / 60) > 0 && `${Math.floor(totalDurationMinutes / 60)}h `}
                  {totalDurationMinutes % 60 > 0 && `${totalDurationMinutes % 60}m`} • ${totalCost.toFixed(0)} total
                </p>
              </div>
            </div>
            {/* Only show continue button if not summary only and onContinue is provided */}
            {!summaryOnly && onContinue && (
              <Button
                onClick={onContinue}
                className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 font-semibold body-font shadow-lg hover:shadow-xl transition-all"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedServices.map((service, index) => (
              <div
                key={`selected-${index}`}
                className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-orange-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#E75837] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 body-font">{service.name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 body-font">
                        {formatDuration(service.duration_number, service.duration_unit)}
                      </span>
                      <span className="text-xs font-medium text-[#E75837] body-font">
                        {formatPrice(service.customer_cost)}
                      </span>
                    </div>
                  </div>
                </div>
                {!summaryOnly && (
                  <button
                    onClick={() => removeService(service)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    title="Remove service"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Menu - only show if not summary only */}
      {!summaryOnly && (
        <div className="space-y-4">
          {Object.entries(servicesByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-500">No services available</div>
          ) : (
            Object.entries(servicesByCategory).map(([category, services]) => (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3">
                  <CardTitle className="text-lg capitalize header-font text-[#E75837]">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {services && services.length > 0 ? (
                      services.map((service, index) => {
                        const selected = isServiceSelected(service)
                        return (
                          <div
                            key={`${category}-${index}`}
                            onClick={(e) => handleServiceClick(service, e)}
                            className={`p-4 transition-all duration-200 cursor-pointer ${
                              selected ? "bg-orange-50 border-l-4 border-l-[#E75837] shadow-sm" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selected
                                      ? "bg-[#E75837] border-[#E75837] text-white"
                                      : "border-gray-300 hover:border-[#E75837]"
                                  }`}
                                >
                                  {selected && <span className="text-xs font-bold">✓</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={`font-semibold ${selected ? "text-[#E75837]" : "text-gray-900"} header-font text-base leading-tight`}
                                  >
                                    {service.name}
                                  </h4>
                                  {service.description && (
                                    <p className="text-sm text-gray-600 mt-1 body-font line-clamp-2">
                                      {service.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Clock className="w-4 h-4 flex-shrink-0" />
                                      <span className="body-font">
                                        {formatDuration(service.duration_number, service.duration_unit)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                                      <span className="body-font font-medium">
                                        {formatPrice(service.customer_cost)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 text-gray-500 text-center">No services in this category</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
