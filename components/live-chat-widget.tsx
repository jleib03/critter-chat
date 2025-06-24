"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"
import { Send, Loader2, X, MessageCircle, Minimize2 } from "lucide-react"
import type { ChatAgentConfig } from "../types/chat-config"

type ChatMessage = {
  text: string
  isUser: boolean
}

type LiveChatWidgetProps = {
  professionalId: string
  professionalName: string
  chatConfig?: ChatAgentConfig | null
  isConfigLoading?: boolean
}

// Use the same webhook URL as the custom agent setup
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export default function LiveChatWidget({
  professionalId,
  professionalName,
  chatConfig,
  isConfigLoading = false,
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use dynamic config or fallback to defaults
  const chatName = chatConfig?.chat_name || `${professionalName} Support`
  const primaryColor = chatConfig?.widget_config?.primary_color || "#E75837"
  const welcomeMessage =
    chatConfig?.welcome_message ||
    `Hi! I'm here to help you with ${professionalName}. I can assist with booking appointments, answering questions about our services, and helping with any other inquiries. How can I help you today?`
  const agentInstructions = chatConfig?.instructions || ""

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isConfigLoading) {
      setMessages([
        {
          text: welcomeMessage,
          isUser: false,
        },
      ])
    }
  }, [isOpen, messages.length, welcomeMessage, isConfigLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Add user message
    const userMessage: ChatMessage = { text: message, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      console.log("💬 Sending chat message:", message)
      console.log("🔗 Using webhook URL:", WEBHOOK_URL)

      // Use the same webhook URL and payload format as the custom agent setup
      const payload = {
        action: "support_conversation",
        professionalId: professionalId,
        message: message,
        userInfo: {
          source: "live_chat_widget",
          sessionId: "chat_" + Date.now(),
          timestamp: new Date().toISOString(),
        },
        // Include agent configuration for context
        agentConfig: {
          instructions: agentInstructions,
          response_tone: chatConfig?.agent_behavior?.response_tone || "friendly",
          max_response_length: chatConfig?.agent_behavior?.max_response_length || 200,
          include_booking_links: chatConfig?.agent_behavior?.include_booking_links || true,
          professional_name: professionalName,
          business_context: chatConfig?.business_context || {},
        },
      }

      console.log("📤 Chat payload:", JSON.stringify(payload, null, 2))

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("📡 Chat response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📥 Chat response data:", JSON.stringify(data, null, 2))

      // Parse the response using the same logic as the testing step
      let responseMessage = "I'm sorry, I couldn't process that request."

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        if (firstItem.output) {
          responseMessage = firstItem.output
        } else if (firstItem.response) {
          responseMessage = firstItem.response
        } else if (typeof firstItem === "string") {
          responseMessage = firstItem
        }
      } else if (data && typeof data === "object") {
        if (data.output) {
          responseMessage = data.output
        } else if (data.response) {
          responseMessage = data.response
        }
      } else if (typeof data === "string") {
        responseMessage = data
      }

      console.log("✅ Final response message:", responseMessage)

      // Add bot response
      const botMessage: ChatMessage = {
        text: responseMessage,
        isUser: false,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("💥 Chat error:", error)

      // Add error message
      const errorMessage: ChatMessage = {
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact us directly for immediate assistance.",
        isUser: false,
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const openChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const restoreChat = () => {
    setIsMinimized(false)
  }

  // Don't render if config is still loading
  if (isConfigLoading) {
    return (
      <div className="fixed bottom-6 right-6 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center z-50 animate-pulse">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Chat Button - Fixed position */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
          style={{ backgroundColor: primaryColor }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
            isMinimized ? "h-14" : "h-[500px]"
          }`}
        >
          {/* Chat Header */}
          <div
            className="p-4 border-b border-gray-200 rounded-t-lg cursor-pointer"
            style={{ backgroundColor: primaryColor }}
            onClick={isMinimized ? restoreChat : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {chatName.charAt(0)}
                </div>
                <h3 className="font-medium text-white header-font">{chatName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={minimizeChat}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages - Hidden when minimized */}
          {!isMinimized && (
            <>
              <div className="h-80 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser ? `text-white` : "bg-gray-100 text-gray-800"
                      } body-font`}
                      style={message.isUser ? { backgroundColor: primaryColor } : {}}
                    >
                      {message.isUser ? message.text : <div dangerouslySetInnerHTML={{ __html: message.text }} />}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                      <Loader2 className="h-4 w-4 text-gray-500 animate-spin mr-2" />
                      <span className="text-gray-500 text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 flex">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 body-font"
                  style={{ focusRingColor: primaryColor }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-4 py-2 rounded-r-lg flex items-center justify-center transition-colors ${
                    !inputValue.trim() || isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "text-white hover:opacity-90"
                  }`}
                  style={{ backgroundColor: !inputValue.trim() || isLoading ? undefined : primaryColor }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
