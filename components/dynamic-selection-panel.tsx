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
  isFormValid: boolean
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
  isFormValid,
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
    const priceDetail = option.details.find((detail) => detail.startsWith("Price:"))
    return priceDetail ? priceDetail.replace("Price:", "").trim() : null
  }

  // Extract duration from details if available
  const getDuration = (option: SelectionOption) => {
    if (!option.details || option.details.length === 0) return null
    const durationDetail = option.details.find((detail) => detail.startsWith("Duration:"))
    return durationDetail ? durationDetail.replace("Duration:", "").trim() : null
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
    if (!isFormValid) {
      return "Complete your information on the left to continue"
    }
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
    if (!isFormValid) return false

    if (selectionType === "service") {
      return !!selectedMainService
    } else if (allowMultipleSelection) {
      return selectedOptions.length > 0
    } else {
      return selectedOptions.length === 1
    }
  }

  const handleOptionClick = (option: SelectionOption) => {
    if (!isFormValid) return
    onSelectionClick(option)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E75837] text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold header-font">{getPanelTitle()}</h2>
          <p className="text-sm opacity-90 body-font">{getPanelSubtitle()}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Form validation notice */}

      {/* Content */}
      <div className={`flex-grow overflow-y-auto p-4 ${!isFormValid ? "opacity-50" : ""}`}>
        {selectionType === "service" && (
          <>
            {/* Main Services Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 header-font">Main Services (select one)</h3>

              {/* Main Services Carousel */}
              <div className="relative">
                <div className="space-y-3">
                  {paginatedMainServices.map((option) => {
                    const price = getPrice(option)
                    const duration = getDuration(option)
                    const isSelected = selectedMainService === option.name

                    return (
                      <div
                        key={option.name}
                        className={`relative border rounded-lg p-4 transition-all ${
                          isFormValid ? "cursor-pointer" : "cursor-not-allowed"
                        } ${
                          isSelected
                            ? "border-[#E75837] bg-[#fff8f6] shadow-md"
                            : "border-gray-200 hover:border-[#E75837]/50 hover:shadow-sm"
                        }`}
                        onClick={() => handleOptionClick(option)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium header-font mb-1">{option.name}</h4>
                            {duration && (
                              <div className="flex items-center text-gray-500 body-font">
                                <Clock size={16} className="mr-1" />
                                <span>{duration}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            {price && <span className="text-lg font-semibold header-font">{price}</span>}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-[#E75837] text-white rounded-full p-1">
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
                      disabled={currentPage === 0 || !isFormValid}
                      className={`p-2 rounded-full ${
                        currentPage === 0 || !isFormValid ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => isFormValid && setCurrentPage(index)}
                          disabled={!isFormValid}
                          className={`w-2 h-2 rounded-full ${
                            currentPage === index ? "bg-[#E75837]" : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1 || !isFormValid}
                      className={`p-2 rounded-full ${
                        currentPage === totalPages - 1 || !isFormValid
                          ? "text-gray-300"
                          : "text-gray-600 hover:bg-gray-100"
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
                <h3 className="text-lg font-semibold mb-3 header-font">Add-On Services (optional)</h3>
                <div className="space-y-2">
                  {addOnServices.map((option) => {
                    const price = getPrice(option)
                    const duration = getDuration(option)
                    const isSelected = selectedOptions.includes(option.name)

                    return (
                      <div
                        key={option.name}
                        className={`relative border rounded-lg p-3 transition-all ${
                          isFormValid ? "cursor-pointer" : "cursor-not-allowed"
                        } ${
                          isSelected
                            ? "border-[#745E25] bg-[#f9f7f2] shadow-sm"
                            : "border-gray-200 hover:border-[#745E25]/50"
                        }`}
                        onClick={() => handleOptionClick(option)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                                isSelected ? "bg-[#745E25] border-[#745E25]" : "border-gray-400"
                              }`}
                            >
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                            <div>
                              <h4 className="font-medium header-font">{option.name}</h4>
                              {duration && (
                                <div className="flex items-center text-gray-500 text-sm body-font">
                                  <Clock size={14} className="mr-1" />
                                  <span>{duration}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {price && <span className="font-semibold header-font">{price}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {selectionType === "professional" && (
          <div className="space-y-4">
            {selectionOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.name)

              return (
                <div
                  key={option.name}
                  className={`border rounded-lg p-4 transition-all ${
                    isFormValid ? "cursor-pointer" : "cursor-not-allowed"
                  } ${
                    isSelected ? "border-[#E75837] bg-orange-50 shadow-md" : "border-gray-200 hover:border-[#E75837]/50"
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <h4 className="text-lg font-medium header-font">{option.name}</h4>
                  {option.description && <p className="text-gray-600 mt-1 body-font">{option.description}</p>}
                  {option.details && option.details.length > 0 && (
                    <p className="text-gray-500 text-sm mt-2 body-font">{option.details.join(" • ")}</p>
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
                  className={`border rounded-lg p-3 transition-all flex items-center ${
                    isFormValid ? "cursor-pointer" : "cursor-not-allowed"
                  } ${isSelected ? "border-[#E75837] bg-orange-50" : "border-gray-200 hover:border-[#E75837]/50"}`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div
                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${
                      isSelected ? "bg-[#E75837] border-[#E75837]" : "border-gray-400"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium header-font">{option.name}</h4>
                    {option.description && <p className="text-gray-600 text-sm body-font">{option.description}</p>}
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
                  className={`border rounded-lg p-4 transition-all ${
                    isFormValid ? "cursor-pointer" : "cursor-not-allowed"
                  } ${
                    isSelected
                      ? option.name === "Yes, proceed"
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <h4 className="text-lg font-medium header-font">{option.name}</h4>
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
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors body-font"
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
          className={`px-4 py-2 rounded-md body-font ${
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
