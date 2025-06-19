"use client"

import type { Service, ServicesByCategory } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, ChevronDown } from "lucide-react"
import { useState } from "react"

type ServiceSelectorBarProps = {
  servicesByCategory: ServicesByCategory
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
}

export function ServiceSelectorBar({ servicesByCategory, selectedService, onServiceSelect }: ServiceSelectorBarProps) {
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

  const allServices = Object.values(servicesByCategory).flat()

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 header-font">Select Service</h2>
        {selectedService && (
          <div className="text-sm text-gray-600 body-font">
            {formatDuration(selectedService.duration_number, selectedService.duration_unit)} •{" "}
            {formatPrice(selectedService.customer_cost)}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 text-left body-font"
      >
        <span className={selectedService ? "text-gray-900" : "text-gray-500"}>
          {selectedService ? selectedService.name : "Choose a service..."}
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
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedService?.name === service.name ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 header-font">{service.name}</h4>
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
