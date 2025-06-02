"use client"
import { useRef, useEffect } from "react"
import type React from "react"

import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react"

type TestingStepProps = {
  testMessages: Array<{ text: string; isUser: boolean }>
  testInput: string
  setTestInput: (input: string) => void
  sendTestMessage: (message: string) => void
  isTestingActive: boolean
  onNext: () => void
  onBack: () => void
}

export default function TestingStep({
  testMessages,
  testInput,
  setTestInput,
  sendTestMessage,
  isTestingActive,
  onNext,
  onBack,
}: TestingStepProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [testMessages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && testInput.trim()) {
      e.preventDefault()
      sendTestMessage(testInput)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 3: Test Your Support Agent</h2>
      <p className="text-gray-600 mb-6 body-font">
        Try out your custom support agent to see how it responds to customer inquiries. Ask questions about your
        services, policies, or any other information you've provided.
      </p>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {testMessages.map((msg, index) => (
            <div key={index} className={`mb-4 max-w-[80%] ${msg.isUser ? "ml-auto" : "mr-auto"}`}>
              <div
                className={`p-3 rounded-lg ${
                  msg.isUser
                    ? "bg-[#94ABD6] text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
                }`}
              >
                <p className="body-font whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTestingActive && (
            <div className="mb-4 max-w-[80%]">
              <div className="p-3 rounded-lg bg-white border border-gray-200 rounded-bl-none inline-flex">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message to test your support agent..."
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] resize-none body-font"
              rows={1}
              disabled={isTestingActive}
            />
            <button
              onClick={() => sendTestMessage(testInput)}
              disabled={!testInput.trim() || isTestingActive}
              className={`px-4 py-2 rounded-r-lg transition-colors flex items-center ${
                testInput.trim() && !isTestingActive
                  ? "bg-[#94ABD6] text-white hover:bg-[#7a90ba]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isTestingActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 font-medium mb-2 header-font">Testing Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 body-font">
          <li>Try asking about your cancellation policy</li>
          <li>Ask about your services and pricing</li>
          <li>Test questions about your new customer process</li>
          <li>Ask about animal restrictions or requirements</li>
          <li>Try common customer support questions</li>
        </ul>
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
          className="flex items-center px-6 py-2 rounded-lg text-white bg-[#94ABD6] hover:bg-[#7a90ba] transition-colors body-font"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
