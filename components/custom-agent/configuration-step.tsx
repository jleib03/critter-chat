"use client"
import { ArrowLeft, ArrowRight } from "lucide-react"

type AgentConfig = {
  cancellationPolicy: string
  newCustomerProcess: string
  animalRestrictions: string
  serviceDetails: string
  additionalInfo: string
  chatName: string
  chatWelcomeMessage: string
}

type ConfigurationStepProps = {
  agentConfig: AgentConfig
  setAgentConfig: (config: AgentConfig) => void
  onNext: () => void
  onBack: () => void
}

export default function ConfigurationStep({ agentConfig, setAgentConfig, onNext, onBack }: ConfigurationStepProps) {
  const updateConfig = (field: keyof AgentConfig, value: string) => {
    setAgentConfig({
      ...agentConfig,
      [field]: value,
    })
  }

  const isFormValid = () => {
    // Require at least cancellation policy and new customer process
    return agentConfig.cancellationPolicy.trim() !== "" && agentConfig.newCustomerProcess.trim() !== ""
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 2: Configure Your Support Agent</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your agent already has access to your documentation, but providing additional information will help it better
        assist your customers. Please fill out the following sections.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Cancellation Policy*
          </label>
          <textarea
            id="cancellationPolicy"
            value={agentConfig.cancellationPolicy}
            onChange={(e) => updateConfig("cancellationPolicy", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Describe your cancellation policy (e.g., 24-hour notice required, fees for late cancellations)"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="newCustomerProcess" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            New Customer Intake Process*
          </label>
          <textarea
            id="newCustomerProcess"
            value={agentConfig.newCustomerProcess}
            onChange={(e) => updateConfig("newCustomerProcess", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Describe your process for onboarding new customers (e.g., required forms, initial consultation)"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="animalRestrictions" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Animal Restrictions
          </label>
          <textarea
            id="animalRestrictions"
            value={agentConfig.animalRestrictions}
            onChange={(e) => updateConfig("animalRestrictions", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="List any restrictions on animals you service (e.g., breed restrictions, weight limits, exotic pets)"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Service Details
          </label>
          <textarea
            id="serviceDetails"
            value={agentConfig.serviceDetails}
            onChange={(e) => updateConfig("serviceDetails", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Provide details about your services (e.g., duration, what's included, pricing structure)"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2 header-font">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            value={agentConfig.additionalInfo}
            onChange={(e) => updateConfig("additionalInfo", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            placeholder="Any other information your support agent should know (e.g., business hours, service area, emergency procedures)"
            rows={3}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-4 header-font">Chat Customization</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chatName" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                Chat Agent Name
              </label>
              <input
                type="text"
                id="chatName"
                value={agentConfig.chatName}
                onChange={(e) => updateConfig("chatName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                placeholder="Name for your chat agent"
              />
            </div>

            <div>
              <label htmlFor="chatWelcomeMessage" className="block text-sm font-medium text-gray-700 mb-2 header-font">
                Welcome Message
              </label>
              <input
                type="text"
                id="chatWelcomeMessage"
                value={agentConfig.chatWelcomeMessage}
                onChange={(e) => updateConfig("chatWelcomeMessage", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                placeholder="Initial message shown to users"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
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
