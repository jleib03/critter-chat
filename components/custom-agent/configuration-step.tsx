"use client"
import { useState } from "react"
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
  const [activeTab, setActiveTab] = useState("policies")

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
      <h2 className="text-2xl font-bold mb-4 header-font">Step 2: Configuration</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your support agent already has access to your Critter documentation. Now, let's add specific information about
        your business policies and customize your chat interface.
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "policies"
              ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("policies")}
        >
          Business Policies
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "chat" ? "border-b-2 border-[#94ABD6] text-[#94ABD6]" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Chat Customization
        </button>
      </div>

      {/* Policies Tab */}
      {activeTab === "policies" && (
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
      )}

      {/* Chat Customization Tab */}
      {activeTab === "chat" && (
        <div className="space-y-6">
          <div>
            <label htmlFor="chatName" className="block text-sm font-medium text-gray-700 mb-2 header-font">
              Chat Agent Name
            </label>
            <input
              type="text"
              id="chatName"
              name="chatName"
              value={agentConfig.chatName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              placeholder="Name your chat agent (e.g., 'Critter Support')"
            />
          </div>

          <div>
            <label htmlFor="chatWelcomeMessage" className="block text-sm font-medium text-gray-700 mb-2 header-font">
              Welcome Message
            </label>
            <textarea
              id="chatWelcomeMessage"
              name="chatWelcomeMessage"
              value={agentConfig.chatWelcomeMessage}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              placeholder="The first message customers will see when they start a chat"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2 header-font">Chat Preview</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-[#94ABD6] rounded-full flex items-center justify-center text-white font-medium">
                  {agentConfig.chatName.charAt(0)}
                </div>
                <div className="ml-2 font-medium">{agentConfig.chatName}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] body-font">
                {agentConfig.chatWelcomeMessage || "Hello! How can I help you today?"}
              </div>
            </div>
          </div>
        </div>
      )}

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
