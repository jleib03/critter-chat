"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Service = {
  id: string
  name: string
  description: string
  duration: string
  price: string
  category: string
  selected: boolean
}

type ServiceSelectionProps = {
  services: Service[]
  onSubmit: (selectedServices: Service[]) => void
  onBack: () => void
}

export default function ServiceSelection({ services, onSubmit, onBack }: ServiceSelectionProps) {
  const [localServices, setLocalServices] = useState<Service[]>(services)
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([])

  useEffect(() => {
    // Group services by category
    const grouped = localServices.reduce(
      (acc, service) => {
        const category = service.category || "Other Services"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(service)
        return acc
      },
      {} as Record<string, Service[]>,
    )

    // Open all accordion items by default
    setOpenAccordionItems(Object.keys(grouped))
  }, [localServices])

  const handleServiceToggle = (id: string) => {
    setLocalServices(
      localServices.map((service) => (service.id === id ? { ...service, selected: !service.selected } : service)),
    )
  }

  const handleSubmit = () => {
    onSubmit(localServices.filter((service) => service.selected))
  }

  const groupedServices = localServices.reduce(
    (acc, service) => {
      const category = service.category || "Other Services"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  const getCategoryOrder = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes("add-on")) {
      return 3
    }
    if (lowerCategory === "other services") {
      return 2
    }
    return 1 // All other defined categories go first
  }

  const sortedCategories = Object.entries(groupedServices).sort(([categoryA], [categoryB]) => {
    const orderA = getCategoryOrder(categoryA)
    const orderB = getCategoryOrder(categoryB)

    if (orderA !== orderB) {
      return orderA - orderB
    }
    return categoryA.localeCompare(categoryB)
  })

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center header-font">Select Services</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
          {sortedCategories.map(([category, servicesInCategory]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-medium text-[#E75837] header-font">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {servicesInCategory.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={service.selected}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                      />
                      <div className="ml-4 flex-grow">
                        <label
                          htmlFor={`service-${service.id}`}
                          className="font-medium text-gray-800 cursor-pointer header-font"
                        >
                          {service.name}
                        </label>
                        <p className="text-sm text-gray-600 body-font">{service.description}</p>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-500 body-font">
                          <span>Duration: {service.duration}</span>
                          <span className="font-semibold text-gray-800">{service.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Continue</Button>
      </CardFooter>
    </Card>
  )
}
