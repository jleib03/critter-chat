"use client"

type NewCustomerSelectionProps = {
  onSelectionMade: (selection: "new_customer_onboarding" | "new_customer_lead") => void
}

export default function NewCustomerSelection({ onSelectionMade }: NewCustomerSelectionProps) {
  return (
    <div className="mt-5 mb-6">
      <p className="text-sm text-gray-600 mb-4 body-font font-medium">Tell us a little more about your situation:</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onSelectionMade("new_customer_onboarding")}
          className="px-4 py-3 bg-[#745E25] hover:bg-[#5d4b1e] text-white rounded-lg text-sm font-medium transition-colors body-font flex items-center justify-center"
        >
          I know my Critter professional
        </button>
        <p className="text-xs text-gray-500 ml-1 mb-3 body-font">
          I know which pet professional I want to work with and want to set up my account.
        </p>

        <button
          onClick={() => onSelectionMade("new_customer_lead")}
          className="px-4 py-3 bg-[#745E25] hover:bg-[#5d4b1e] text-white rounded-lg text-sm font-medium transition-colors body-font flex items-center justify-center"
        >
          I am looking for a new pet professional
        </button>
        <p className="text-xs text-gray-500 ml-1 body-font">
          I need help finding a pet professional in my area who offers the services I need.
        </p>
      </div>
    </div>
  )
}
