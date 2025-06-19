"use client"

import type { Service, ServicesByCategory } from "@/types/schedule"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign } from "lucide-react"

type ServiceSelectionProps = {
  servicesByCategory: ServicesByCategory
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
}

export function ServiceSelection({ servicesByCategory, selectedService, onServiceSelect }: ServiceSelectionProps) {
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

  const formatPrice = (price: string, currency: string) => {
    return `$${Number.parseFloat(price).toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 header-font">Select a Service</h2>
        <p className="text-gray-600 body-font">Choose the service you'd like to book.</p>
      </div>

      {Object.entries(servicesByCategory).map(([category, services]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg capitalize header-font text-[#E75837]">{category}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <div
                  key={`${category}-${index}`}
                  className={`p-4 transition-colors ${
                    selectedService?.name === service.name
                      ? "bg-orange-50 border-l-4 border-[#E75837]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 header-font">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1 body-font">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="body-font">
                            {formatDuration(service.duration_number, service.duration_unit)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <DollarSign className="w-4 h-4" />
                          <span className="body-font">
                            {formatPrice(service.customer_cost, service.customer_cost_currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => onServiceSelect(service)}
                      variant={selectedService?.name === service.name ? "default" : "outline"}
                      className={
                        selectedService?.name === service.name
                          ? "bg-[#E75837] hover:bg-[#d14a2a] body-font"
                          : "body-font"
                      }
                    >
                      {selectedService?.name === service.name ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
