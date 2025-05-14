"use client"
import { Check } from "lucide-react"

type SelectionOption = {
  name: string
  description?: string
  details?: string[]
  selected?: boolean
  category?: string
}

type SelectionType = "professional" | "service" | "pet" | "confirmation" | null

type SelectionBubblesProps = {
  selectionType: SelectionType
  selectionOptions: SelectionOption[]
  allowMultipleSelection: boolean
  selectedMainService: string | null
  selectedOptions: string[]
  onSelectionClick: (option: SelectionOption) => void
  onSubmit: () => void
}

export default function SelectionBubbles({
  selectionType,
  selectionOptions,
  allowMultipleSelection,
  selectedMainService,
  selectedOptions,
  onSelectionClick,
  onSubmit,
}: SelectionBubblesProps) {
  return (
    <div className="selection-bubbles flex flex-col gap-4 mt-4 mb-4">
      <div className="selection-options">
        <p className="text-sm text-gray-600 mb-2 body-font">
          {selectionType === "professional" && "Select a professional:"}
          {selectionType === "service" && "Select a service:"}
          {selectionType === "pet" && `Select ${allowMultipleSelection ? "pet(s)" : "a pet"}:`}
          {selectionType === "confirmation" && "Confirm your booking:"}
        </p>

        {/* Group options by category for services */}
        {selectionType === "service" && (
          <>
            {/* Main Services */}
            {selectionOptions.some((opt) => opt.category !== "Add-On") && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 body-font">Main Services (select one):</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectionOptions
                    .filter((opt) => opt.category !== "Add-On")
                    .map((option, index) => (
                      <button
                        key={index}
                        onClick={() => onSelectionClick(option)}
                        className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                          option.selected ? "bg-[#d04e30] text-white" : "bg-[#e75837] hover:bg-[#d04e30] text-white"
                        }`}
                      >
                        {option.selected && <Check className="w-4 h-4 mr-1" />}
                        {option.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Add-Ons */}
            {selectionOptions.some((opt) => opt.category === "Add-On") && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 body-font">Add-Ons (select any):</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectionOptions
                    .filter((opt) => opt.category === "Add-On")
                    .map((option, index) => (
                      <button
                        key={index}
                        onClick={() => onSelectionClick(option)}
                        className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                          option.selected ? "bg-[#745E25] text-white" : "bg-[#94ABD6] hover:bg-[#7a8eb3] text-white"
                        }`}
                      >
                        {option.selected && <Check className="w-4 h-4 mr-1" />}
                        {option.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* For non-service selections */}
        {selectionType !== "service" && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectionOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelectionClick(option)}
                className={`selection-bubble px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center body-font ${
                  option.selected ? "bg-[#d04e30] text-white" : "bg-[#e75837] hover:bg-[#d04e30] text-white"
                }`}
              >
                {option.selected && <Check className="w-4 h-4 mr-1" />}
                {option.name}
              </button>
            ))}
          </div>
        )}

        {/* Show details for the selected options */}
        {selectionOptions
          .filter((opt) => opt.selected)
          .map((option, index) => (
            <div key={index} className="selected-option-details mb-3 p-3 bg-[#f9f9f9] rounded-md body-font">
              <div className="font-medium header-font">{option.name}</div>
              {option.description && <div className="text-sm text-gray-600 body-font">{option.description}</div>}
              {option.details &&
                option.details.map((detail, i) => (
                  <div key={i} className="text-sm text-gray-600 body-font">
                    {detail}
                  </div>
                ))}
            </div>
          ))}

        {/* Submit button for services (when main service is selected) or multiple selections */}
        {((selectionType === "service" && selectedMainService) ||
          (selectionType === "confirmation" && selectedOptions.length > 0) ||
          (selectionType === "pet" && selectedOptions.length > 0) ||
          (selectionType !== "service" && selectionType !== "professional" && selectedOptions.length > 0)) && (
          <button
            onClick={onSubmit}
            className="bg-[#745E25] text-white border-none py-2 px-4 rounded-full cursor-pointer font-medium text-sm transition-colors duration-300 hover:bg-[#5d4b1e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(116,94,37,0.3)] inline-flex items-center justify-center body-font"
          >
            Submit Selection
          </button>
        )}
      </div>
    </div>
  )
}
