"use client"

import type { Service, ServicesByCategory } from "@/types/schedule"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, DollarSign, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ServiceSelectorBarProps = {
  servicesByCategory: ServicesByCategory
  selectedServices: Service[]
  onServiceSelect: (service: Service) => void
  onContinue?: () => void
  summaryOnly: boolean
  showPrices: boolean
}

export function ServiceSelectorBar({
  servicesByCategory,
  selectedServices,
  onServiceSelect,
  onContinue,
  summaryOnly,
  showPrices,
}: ServiceSelectorBarProps) {
  const formatDuration = (duration: number | null, unit: string | null) => {
    if (duration === null || unit === null) {
      return null
    }
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

  const formatPrice = (price: string | number | null, currency: string | null) => {
    if (price === null || price === undefined) {
      return "By Consult"
    }
    const priceNumber = typeof price === "string" ? Number.parseFloat(price) : price
    if (isNaN(priceNumber)) {
      return "By Consult"
    }
    return `$${priceNumber.toFixed(0)}`
  }

  const getCategoryRank = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes("add-on")) {
      return 3
    }
    if (lowerCategory === "other services") {
      return 2
    }
    return 1 // Named services like Grooming, Walks, etc.
  }

  const sortedCategories = Object.keys(servicesByCategory).sort((a, b) => {
    const rankA = getCategoryRank(a)
    const rankB = getCategoryRank(b)

    if (rankA !== rankB) {
      return rankA - rankB
    }

    // Alphabetical sort for categories with the same rank
    return a.localeCompare(b)
  })

  const totalCost = selectedServices.reduce((total, service) => {
    if (service.customer_cost === null || service.customer_cost === undefined) {
      return total
    }
    const cost =
      typeof service.customer_cost === "string"
        ? Number.parseFloat(service.customer_cost)
        : Number(service.customer_cost)
    return total + (isNaN(cost) ? 0 : cost)
  }, 0)

  if (summaryOnly) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 header-font">Selected Services</h2>
        <div className="space-y-2">
          {selectedServices.map((service) => {
            const durationText = formatDuration(service.duration_number, service.duration_unit)
            return (
              <div key={service.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold header-font">{service.name}</p>
                  {durationText && <p className="text-sm text-gray-500 body-font">{durationText}</p>}
                </div>
                {showPrices && (
                  <p className="font-semibold body-font">
                    {formatPrice(service.customer_cost, service.customer_cost_currency)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        {showPrices && (
          <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg header-font">
            <span>Total</span>
            <span>{formatPrice(totalCost, "USD")}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 header-font">Select Services</h2>
      </div>

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedCategories}>
        {sortedCategories.map((category) => (
          <AccordionItem value={category} key={category} className="border-0 bg-gray-50/60 rounded-lg">
            <AccordionTrigger className="px-4 py-3 text-lg capitalize header-font text-[#E75837] hover:no-underline">
              {category}
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="divide-y divide-gray-200/60 bg-white">
                {servicesByCategory[category].map((service, index) => {
                  const isSelected = selectedServices.some((s) => s.name === service.name)
                  const durationText = formatDuration(service.duration_number, service.duration_unit)
                  return (
                    <div
                      key={`${category}-${index}`}
                      className={cn(
                        "p-4 transition-all duration-200 cursor-pointer",
                        isSelected ? "bg-orange-50 border-l-4 border-[#E75837]" : "hover:bg-gray-50/80",
                      )}
                      onClick={() => onServiceSelect(service)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 header-font text-base leading-tight">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1 body-font line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            {durationText && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="body-font">{durationText}</span>
                              </div>
                            )}
                            {showPrices && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <DollarSign className="w-4 h-4 flex-shrink-0" />
                                <span className="body-font font-medium">
                                  {formatPrice(service.customer_cost, service.customer_cost_currency)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-center h-full pt-1">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-[#E75837] border-[#E75837]" : "border-gray-300 bg-white",
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {selectedServices.length > 0 && onContinue && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 -mx-6 -mb-6 px-6 mt-6 border-t">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold header-font">
                {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
              </p>
              {showPrices && <p className="text-sm text-gray-600 body-font">Total: {formatPrice(totalCost, "USD")}</p>}
            </div>
            <Button onClick={onContinue} className="bg-[#E75837] hover:bg-[#d14a2a] text-white body-font">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
