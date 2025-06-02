"use client"
import type React from "react"
import { ArrowRight, ArrowLeft, SkipForward } from "lucide-react"

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
  onSkip: () => void
}

export default function ConfigurationStep({
  agentConfig,
  setAgentConfig,
  onNext,
  onBack,
  onSkip,
}: ConfigurationStepProps) {
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

  const hasAnyContent = () => {
    return (
      agentConfig.cancellationPolicy.trim() !== "" ||
      agentConfig.newCustomerProcess.trim() !== "" ||
      agentConfig.animalRestrictions.trim() !== "" ||
      agentConfig.serviceDetails.trim() !== "" ||
      agentConfig.additionalInfo.trim() !== ""
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 2: Training</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your support agent already has access to your Critter documentation. You can add specific information about your
        business policies now, or skip this step and come back to customize it later.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Cancellation Policy <span className="text-gray-400 text-xs">(Optional)</span>
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
            New Customer Intake Process <span className="text-gray-400 text-xs">(Optional)</span>
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
            Animal Restrictions <span className="text-gray-400 text-xs">(Optional)</span>
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
            Service Details <span className="text-gray-400 text-xs">(Optional)</span>
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
            Additional Information <span className="text-gray-400 text-xs">(Optional)</span>
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

      {/* Info box about skipping */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2 header-font">💡 You can always come back</h3>
        <p className="text-sm text-blue-700 body-font">
          Want to test your agent first? You can skip this step and add your business policies later. Your agent will
          work with the default Critter documentation, and you can customize it anytime from your dashboard.
        </p>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors body-font"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex items-center px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors body-font"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip for Now
          </button>

          {hasAnyContent() && (
            <button
              onClick={onNext}
              className="flex items-center px-6 py-2 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors body-font"
            >
              Save & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
