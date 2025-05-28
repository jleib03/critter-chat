"use client"
import { useState } from "react"
import { Clock, X, Check, ChevronLeft, ChevronRight } from "lucide-react"
import type { SelectionOption, SelectionType } from "../types/booking"

interface DynamicSelectionPanelProps {
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
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 3

  if (!isVisible) return null

  // Group options by category for services
  const mainServices = selectionOptions.filter((option) => option.category !== "Add-On")
  const addOnServices = selectionOptions.filter((option) => option.category === "Add-On")

  // Pagination for main services
  const totalPages = Math.ceil(mainServices.length / itemsPerPage)
  const paginatedMainServices = mainServices.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  // Extract price from details if available
  const getPrice = (option: SelectionOption) => {
    if (!option.details || option.details.length === 0) return null
    const priceDetail = option.details.find((detail) => detail.startsWith("$"))
    return priceDetail || null
  }

  // Extract duration from details if available
  const getDuration = (option: SelectionOption) => {
    if (!option.details || option.details.length === 0) return null
    const durationDetail = option.details.find(
      (detail) => detail.includes("minute") || detail.includes("hour") || detail.includes("day"),
    )
    return durationDetail || null
  }

  // Get title based on selection type
  const getPanelTitle = () => {
    switch (selectionType) {
      case "service":
        return "Select Services"
      case "professional":
        return "Select Professional"
      case "pet":
        return "Select Pets"
      case "confirmation":
        return "Confirm Booking"
      default:
        return "Make Selection"
    }
  }

  // Get subtitle based on selection type
  const getPanelSubtitle = () => {
    switch (selectionType) {
      case "service":
        return "Choose a main service and any add-ons you need"
      case "professional":
        return "Select the professional you'd like to book with"
      case "pet":
        return "Select the pets for this booking"
      case "confirmation":
        return "Please confirm your booking details"
      default:
        return ""
    }
  }

  // Check if submit button should be enabled
  const isSubmitEnabled = () => {
    if (selectionType === "service") {
      return !!selectedMainService
    } else if (allowMultipleSelection) {
      return selectedOptions.length > 0
    } else {
      return selectedOptions.length === 1
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E75837] text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{getPanelTitle()}</h2>
          <p className="text-sm opacity-90">{getPanelSubtitle()}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4">
        {selectionType === "service" && (
          <>
            {/* Main Services Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Main Services (select one)</h3>

              {/* Main Services Carousel */}
              <div className="relative">
                <div className="flex flex-col space-y-4">
                  {paginatedMainServices.map((option) => {
                    const price = getPrice(option)
                    const duration = getDuration(option)
                    const isSelected = selectedMainService === option.name

                    return (
                      <div
                        key={option.name}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#E75837] bg-orange-50 shadow-md"
                            : "border-gray-200 hover:border-[#E75837]/50"
                        }`}
                        onClick={() => onSelectionClick(option)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-medium">{option.name}</h4>
                          {price && <span className="text-lg font-semibold">{price}</span>}
                        </div>

                        {option.description && <p className="text-gray-600 mt-1">{option.description}</p>}

                        {duration && (
                          <div className="flex items-center mt-2 text-gray-500">
                            <Clock size={16} className="mr-1" />
                            <span>{duration}</span>
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#E75837] text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`p-1 rounded-full ${
                        currentPage === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="text-sm text-gray-600">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <span
                          key={index}
                          className={`inline-block w-2 h-2 rounded-full mx-1 ${
                            currentPage === index ? "bg-[#E75837]" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      className={`p-1 rounded-full ${
                        currentPage === totalPages - 1 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add-On Services Section */}
            {addOnServices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Add-On Services (optional)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {addOnServices.map((option) => {
                    const price = getPrice(option)
                    const duration = getDuration(option)
                    const isSelected = selectedOptions.includes(option.name)

                    return (
                      <div
                        key={option.name}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => onSelectionClick(option)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{option.name}</h4>
                          {price && <span className="font-semibold">{price}</span>}
                        </div>

                        {option.description && <p className="text-gray-600 text-sm mt-1">{option.description}</p>}

                        {duration && (
                          <div className="flex items-center mt-1 text-gray-500 text-sm">
                            <Clock size={14} className="mr-1" />
                            <span>{duration}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {selectionType === "professional" && (
          <div className="grid grid-cols-1 gap-4">
            {selectionOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={option.name}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? "border-[#E75837] bg-orange-50 shadow-md" : "border-gray-200 hover:border-[#E75837]/50"
                  }`}
                  onClick={() => onSelectionClick(option)}
                >
                  <h4 className="text-lg font-medium">{option.name}</h4>
                  {option.description && <p className="text-gray-600 mt-1">{option.description}</p>}
                  {option.details && option.details.length > 0 && (
                    <p className="text-gray-500 text-sm mt-2">{option.details.join(" • ")}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {selectionType === "pet" && (
          <div className="space-y-3">
            {selectionOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={option.name}
                  className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center ${
                    isSelected ? "border-[#E75837] bg-orange-50" : "border-gray-200 hover:border-[#E75837]/50"
                  }`}
                  onClick={() => onSelectionClick(option)}
                >
                  <div
                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                      isSelected ? "bg-[#E75837] border-[#E75837]" : "border-gray-400"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    {option.description && <p className="text-gray-600 text-sm">{option.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectionType === "confirmation" && (
          <div className="space-y-4">
            {selectionOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={option.name}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? option.name === "Yes, proceed"
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => onSelectionClick(option)}
                >
                  <h4 className="text-lg font-medium">{option.name}</h4>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-between">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            console.log("Submit button clicked")
            console.log("Selected main service:", selectedMainService)
            console.log("Selected options:", selectedOptions)
            onSubmit()
          }}
          disabled={!isSubmitEnabled()}
          className={`px-4 py-2 rounded-md ${
            isSubmitEnabled()
              ? "bg-[#E75837] text-white hover:bg-[#D64726] transition-colors"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {selectionType === "confirmation" && selectedOptions[0] === "Yes, proceed"
            ? "Confirm"
            : selectionType === "confirmation"
              ? "Go Back"
              : "Next"}
        </button>
      </div>
    </div>
  )
}
