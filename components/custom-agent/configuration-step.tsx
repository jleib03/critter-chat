"use client"
import type React from "react"
import { ArrowRight, ArrowLeft } from "lucide-react"

type ConfigurationStepProps = {
  agentConfig: {
    cancellationPolicy: string
    newCustomerProcess: string
    animalRestrictions: string
    serviceDetails: string
    additionalInfo: string
    chatName: string
    chatWelcomeMessage: string
  }
  setAgentConfig: (config: any) => void
  onNext: () => void
  onBack: () => void
}

export default function ConfigurationStep({ agentConfig, setAgentConfig, onNext, onBack }: ConfigurationStepProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAgentConfig({
      ...agentConfig,
      [name]: value,
    })
  }

  const isFormValid = () => {
    // Require at least one policy field to be filled out
    return (
      agentConfig.cancellationPolicy.trim() !== "" ||
      agentConfig.newCustomerProcess.trim() !== "" ||
      agentConfig.animalRestrictions.trim() !== "" ||
      agentConfig.serviceDetails.trim() !== ""
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 2: Business Policies</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your support agent already has access to your Critter documentation. Now, let's add specific information about
        your business policies and procedures.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Cancellation Policy
          </label>
          <textarea
            id="cancellationPolicy"
            name="cancellationPolicy"
            value={agentConfig.cancellationPolicy}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Describe your cancellation policy (e.g., '24-hour notice required for cancellations')"
          />
        </div>

        <div>
          <label htmlFor="newCustomerProcess" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            New Customer Intake Process
          </label>
          <textarea
            id="newCustomerProcess"
            name="newCustomerProcess"
            value={agentConfig.newCustomerProcess}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Describe your process for new customers (e.g., 'Initial consultation required for all new clients')"
          />
        </div>

        <div>
          <label htmlFor="animalRestrictions" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Animal Restrictions
          </label>
          <textarea
            id="animalRestrictions"
            name="animalRestrictions"
            value={agentConfig.animalRestrictions}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="List any animal restrictions (e.g., 'We do not service aggressive dogs or exotic pets')"
          />
        </div>

        <div>
          <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Service Details
          </label>
          <textarea
            id="serviceDetails"
            name="serviceDetails"
            value={agentConfig.serviceDetails}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Describe your services (e.g., 'We offer grooming, boarding, and daycare services')"
          />
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={agentConfig.additionalInfo}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Any other information you'd like your support agent to know"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors body-font"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isFormValid()}
          className={`flex items-center px-6 py-2 rounded-lg text-white transition-colors body-font ${
            isFormValid() ? "bg-[#94ABD6] hover:bg-[#7a90ba]" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
