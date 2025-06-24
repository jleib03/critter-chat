"use client"
import { useState } from "react"

interface Service {
  id: string
  name: string
  duration: number
}

interface ServiceSelectorBarProps {
  services: Service[]
  selectedServices: string[]
  onServiceSelect: (serviceId: string) => void
}

export function ServiceSelectorBar(props: ServiceSelectorBarProps) {
  const { services, selectedServices, onServiceSelect } = props
  const [expanded, setExpanded] = useState(false)

  const handleServiceClick = (serviceId: string) => {
    onServiceSelect(serviceId)
  }

  const handleClearAll = () => {
    services.forEach((service) => {
      if (selectedServices.includes(service.id)) {
        onServiceSelect(service.id) // Deselect all
      }
    })
  }

  const totalDuration = services
    .filter((service) => selectedServices.includes(service.id))
    .reduce((sum, service) => sum + service.duration, 0)

  const selectedServicesCount = selectedServices.length

  return (
    <div className="service-selector-bar">
      <div className="service-selector-header">
        <h3>Select Services</h3>
        {selectedServicesCount > 0 && (
          <button className="clear-all-button" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>
      <div className="service-list">
        {services.map((service) => (
          <div
            key={service.id}
            className={`service-item ${selectedServices.includes(service.id) ? "selected" : ""}`}
            onClick={() => handleServiceClick(service.id)}
          >
            <span className="service-name">{service.name}</span>
            <span className="service-duration">{service.duration} min</span>
            {selectedServices.includes(service.id) && <span className="checkmark">&#10004;</span>}
          </div>
        ))}
      </div>
      {selectedServicesCount > 0 && (
        <div className="selected-services-info">
          <p>
            {selectedServicesCount} Service{selectedServicesCount !== 1 ? "s" : ""} Selected
          </p>
          <p>Total Duration: {totalDuration} minutes</p>
        </div>
      )}
    </div>
  )
}
