"use client"
import { useState, useEffect } from "react"
import { Check, ChevronLeft, ChevronRight, Clock, X } from "lucide-react"
import type { SelectionOption, SelectionType } from "../types/booking"

type DynamicSelectionPanelProps = {
  isVisible: boolean
  selectionType: SelectionType
  selectionOptions: SelectionOption[]
  allowMultipleSelection: boolean
  selectedMainService: string | null
  selectedOptions: string[]
  onSelectionClick: (option: SelectionOption) => void
  onSubmit: () => void
  onClose: () => void
}

export default function DynamicSelectionPanel({
  isVisible,
  selectionType,
  selectionOptions,
  allowMultipleSelection,
  selectedMainService,
  selectedOptions,
  onSelectionClick,
  onSubmit,
  onClose,
}: DynamicSelectionPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Reset active index when selection type changes
  useEffect(() => {
    setActiveIndex(0)
  }, [selectionType])

  if (!isVisible) return null

  const getSelectionTitle = () => {
    switch (selectionType) {
      case "professional":
        return "Choose Your Professional"
      case "service":
        return "Select Services"
      case "pet":
        return "Choose Your Pet(s)"
      case "confirmation":
        return "Confirm Your Booking"
      default:
        return "Make Your Selection"
    }
  }

  const getSelectionDescription = () => {
    switch (selectionType) {
      case "professional":
        return "Select the professional you'd like to work with"
      case "service":
        return "Choose a main service and any add-ons you need"
      case "pet":
        return allowMultipleSelection ? "Select all pets that need care" : "Select which pet needs care"
      case "confirmation":
        return "Please review and confirm your booking details"
      default:
        return ""
    }
  }

  // Filter options based on selection type
  const mainServices = selectionOptions.filter((opt) => opt.category !== "Add-On")
  const addOns = selectionOptions.filter((opt) => opt.category === "Add-On")

  // For pagination in card view
  const nextCard = () => {
    if (selectionType === "service") {
      if (activeIndex < mainServices.length - 1) {
        setActiveIndex(activeIndex + 1)
      }
    } else {
      if (activeIndex < selectionOptions.length - 1) {
        setActiveIndex(activeIndex + 1)
      }
    }
  }

  const prevCard = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  // Helper to extract price from details
  const extractPrice = (details?: string[]) => {
    if (!details) return null
    const priceDetail = details.find((d) => d.includes("$") || d.includes("Price:"))
    if (!priceDetail) return null

    const priceMatch = priceDetail.match(/\$(\d+)/)
    return priceMatch ? priceMatch[0] : null
  }

  // Helper to extract duration from details
  const extractDuration = (details?: string[]) => {
    if (!details) return null
    const durationDetail = details.find(
      (d) => d.includes("minute") || d.includes("hour") || d.includes("Duration:") || d.includes("day"),
    )
    return durationDetail ? durationDetail.replace("Duration:", "").trim() : null
  }

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-[#E75837] text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium header-font">{getSelectionTitle()}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#d04e30] rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm mt-1 opacity-90 body-font">{getSelectionDescription()}</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Service Selection - Card View with Pagination */}
        {selectionType === "service" && (
          <>
            {/* Main Services Carousel */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 body-font">Main Services (select one)</h3>

              <div className="relative">
                {/* Card Carousel */}
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                  >
                    {mainServices.map((option, index) => {
                      const price = extractPrice(option.details)
                      const duration = extractDuration(option.details)
                      const isSelected = option.name === selectedMainService

                      return (
                        <div
                          key={index}
                          className={`min-w-full p-4 border rounded-lg transition-all ${
                            isSelected ? "border-[#E75837] bg-[#fff9f8]" : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium header-font">{option.name}</h3>
                            {price && <span className="text-lg font-bold text-[#E75837]">{price}</span>}
                          </div>

                          {option.description && (
                            <p className="text-sm text-gray-600 mb-3 body-font">{option.description}</p>
                          )}

                          {duration && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{duration}</span>
                            </div>
                          )}

                          <button
                            onClick={() => onSelectionClick(option)}
                            className={`w-full py-2 px-4 rounded-full text-sm font-medium transition-colors mt-2 ${
                              isSelected ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {isSelected ? (
                              <span className="flex items-center justify-center">
                                <Check className="h-4 w-4 mr-1" />
                                Selected
                              </span>
                            ) : (
                              "Select Service"
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {mainServices.length > 1 && (
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={prevCard}
                      disabled={activeIndex === 0}
                      className={`p-2 rounded-full ${
                        activeIndex === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {mainServices.map((_, idx) => (
                        <span
                          key={idx}
                          className={`block h-2 w-2 rounded-full ${
                            idx === activeIndex ? "bg-[#E75837]" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextCard}
                      disabled={activeIndex === mainServices.length - 1}
                      className={`p-2 rounded-full ${
                        activeIndex === mainServices.length - 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add-Ons Grid */}
            {addOns.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3 body-font">Add-On Services (optional)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {addOns.map((option, index) => {
                    const price = extractPrice(option.details)
                    const isSelected = selectedOptions.includes(option.name)

                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                          isSelected ? "border-[#94ABD6] bg-[#f8faff]" : "border-gray-200"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium body-font">{option.name}</h4>
                            {price && <span className="font-bold text-[#94ABD6]">{price}</span>}
                          </div>
                          {option.description && (
                            <p className="text-xs text-gray-500 mt-1 body-font">{option.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => onSelectionClick(option)}
                          className={`ml-3 h-6 w-6 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-[#94ABD6] text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Professional Selection */}
        {selectionType === "professional" && (
          <div className="space-y-4">
            {selectionOptions.map((option, index) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all ${
                    isSelected ? "border-[#E75837] bg-[#fff9f8]" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
                      {option.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium header-font">{option.name}</h3>
                      {option.description && <p className="text-sm text-gray-600 body-font">{option.description}</p>}
                      {option.details &&
                        option.details.map((detail, i) => (
                          <p key={i} className="text-sm text-gray-500 body-font">
                            {detail}
                          </p>
                        ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectionClick(option)}
                    className={`w-full py-2 px-4 rounded-full text-sm font-medium transition-colors mt-3 ${
                      isSelected ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center">
                        <Check className="h-4 w-4 mr-1" />
                        Selected
                      </span>
                    ) : (
                      "Select Professional"
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Pet Selection */}
        {selectionType === "pet" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-2 body-font">
              {allowMultipleSelection ? "Select all pets that need care:" : "Select which pet needs care:"}
            </p>

            {selectionOptions.map((option, index) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={index}
                  onClick={() => onSelectionClick(option)}
                  className={`p-3 border rounded-lg flex items-center cursor-pointer transition-all ${
                    isSelected ? "border-[#E75837] bg-[#fff9f8]" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium body-font">{option.name}</h4>
                    {option.description && <p className="text-xs text-gray-500 body-font">{option.description}</p>}
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "bg-[#E75837] border-[#E75837] text-white" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Confirmation */}
        {selectionType === "confirmation" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4 body-font">
              Please confirm if you'd like to proceed with this booking:
            </p>

            {selectionOptions.map((option, index) => {
              const isSelected = selectedOptions.includes(option.name)
              const isYes = option.name === "Yes, proceed"

              return (
                <button
                  key={index}
                  onClick={() => onSelectionClick(option)}
                  className={`w-full py-3 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
                    isSelected
                      ? isYes
                        ? "bg-[#E75837] text-white"
                        : "bg-gray-700 text-white"
                      : isYes
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {option.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with Submit Button */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        {((selectionType === "service" && selectedMainService) ||
          (selectionType === "pet" && selectedOptions.length > 0)) && (
          <button
            onClick={onSubmit}
            className="w-full bg-[#745E25] text-white py-3 px-4 rounded-lg font-medium text-sm transition-colors hover:bg-[#5d4b1e] focus:outline-none focus:ring-2 focus:ring-[#745E25] focus:ring-opacity-50 body-font"
          >
            {selectionType === "service"
              ? `Continue with ${selectedMainService}${selectedOptions.length > 0 ? ` + ${selectedOptions.length} add-on${selectedOptions.length > 1 ? "s" : ""}` : ""}`
              : `Continue with ${selectedOptions.length} pet${selectedOptions.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>
    </div>
  )
}
