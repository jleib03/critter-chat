"use client"
import { useRef, useEffect } from "react"
import type React from "react"

import { ArrowRight, ArrowLeft, Send, Loader2 } from "lucide-react"

type TestingStepProps = {
  testMessages: Array<{ text: string; isUser: boolean }>
  testInput: string
  setTestInput: (input: string) => void
  sendTestMessage: (message: string) => void
  isTestingActive: boolean
  onNext: () => void
  onBack: () => void
  agentConfig?: {
    chatName: string
    chatWelcomeMessage: string
    widgetConfig?: {
      primaryColor: string
      position: string
      size: string
    }
  }
}

export default function TestingStep({
  testMessages,
  testInput,
  setTestInput,
  sendTestMessage,
  isTestingActive,
  onNext,
  onBack,
  agentConfig,
}: TestingStepProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Default values if not provided
  const chatName = agentConfig?.chatName || "Critter Support"
  const primaryColor = agentConfig?.widgetConfig?.primaryColor || "#94ABD6"

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [testMessages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (testInput.trim() && !isTestingActive) {
      sendTestMessage(testInput)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 4: Testing</h2>
      <p className="text-gray-600 mb-6 body-font">
        Test your custom support agent to make sure it responds correctly to customer inquiries. Try asking questions
        about your policies, services, or other common customer questions.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200" style={{ backgroundColor: primaryColor }}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-medium mr-3">
              {chatName.charAt(0)}
            </div>
            <h3 className="font-medium text-white header-font">{chatName}</h3>
          </div>
        </div>
        <div className="h-80 overflow-y-auto p-4">
          {testMessages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser ? `text-white` : "bg-gray-100 text-gray-800"
                } body-font`}
                style={message.isUser ? { backgroundColor: primaryColor } : {}}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isTestingActive && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                <Loader2 className="h-4 w-4 text-gray-500 animate-spin mr-2" />
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a message to test your agent..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
            disabled={isTestingActive}
          />
          <button
            type="submit"
            disabled={!testInput.trim() || isTestingActive}
            className={`px-4 py-2 rounded-r-lg flex items-center justify-center ${
              !testInput.trim() || isTestingActive
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "text-white hover:opacity-90"
            } transition-colors`}
            style={{ backgroundColor: !testInput.trim() || isTestingActive ? undefined : primaryColor }}
          >
            {isTestingActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2 header-font">Testing Tips</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1 body-font">
          <li>Ask about your cancellation policy</li>
          <li>Inquire about your services and pricing</li>
          <li>Ask about scheduling and availability</li>
          <li>Test common customer questions</li>
          <li>Try different phrasings of the same question</li>
        </ul>
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
          className="flex items-center px-6 py-2 rounded-lg text-white hover:opacity-90 transition-colors body-font"
          style={{ backgroundColor: primaryColor }}
        >
          Complete Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
