"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"

import { Send, Loader2, X, MessageCircle, Minimize2 } from "lucide-react"

type ChatMessage = {
  text: string
  isUser: boolean
}

type AgentConfig = {
  chatName: string
  chatWelcomeMessage: string
  widgetConfig: {
    primaryColor: string
    position: string
    size: string
  }
  cancellationPolicy?: string
  newCustomerProcess?: string
  animalRestrictions?: string
  serviceDetails?: string
  additionalInfo?: string
}

type LiveChatWidgetProps = {
  professionalId: string
}

// Define the webhook URL - same as used in custom agent setup
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export default function LiveChatWidget({ professionalId }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Default configuration fallback
  const defaultConfig: AgentConfig = {
    chatName: "Critter Support",
    chatWelcomeMessage: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
    widgetConfig: {
      primaryColor: "#E75837",
      position: "bottom-right",
      size: "medium",
    },
  }

  // Function to parse webhook response for configuration
  const parseConfigResponse = (data: any): AgentConfig | null => {
    try {
      console.log("Raw config response data:", data)

      // Handle array response
      if (Array.isArray(data) && data.length > 0) {
        const configData = data[0]

        if (configData) {
          return {
            chatName: configData.chat_name || defaultConfig.chatName,
            chatWelcomeMessage: configData.chat_welcome_message || defaultConfig.chatWelcomeMessage,
            widgetConfig: {
              primaryColor: configData.widget_primary_color || defaultConfig.widgetConfig.primaryColor,
              position: configData.widget_position || defaultConfig.widgetConfig.position,
              size: configData.widget_size || defaultConfig.widgetConfig.size,
            },
            cancellationPolicy: configData.cancellation_policy || "",
            newCustomerProcess: configData.new_customer_process || "",
            animalRestrictions: configData.animal_restrictions || "",
            serviceDetails: configData.service_details || "",
            additionalInfo: configData.additional_info || "",
          }
        }
      }

      return null
    } catch (error) {
      console.error("Error parsing config response:", error)
      return null
    }
  }

  // Function to parse webhook response for chat messages
  const parseWebhookResponse = (data: any): string => {
    try {
      console.log("Raw chat response data:", data)

      // Handle array response
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]

        // Since n8n now handles all formatting, we just need to extract the output
        if (firstItem.output) {
          return firstItem.output
        }

        // Fallback for other response formats
        if (firstItem.response) return firstItem.response
        if (typeof firstItem === "string") return firstItem
        return String(firstItem)
      }

      // Handle direct object response
      if (data && typeof data === "object") {
        if (data.output) return data.output
        if (data.response) return data.response
      }

      // Handle direct string response
      if (typeof data === "string") {
        return data
      }

      // Fallback
      return "I'm sorry, I couldn't process that request."
    } catch (error) {
      console.error("Error parsing webhook response:", error)
      return "I'm sorry, there was an error processing your request."
    }
  }

  // Load agent configuration when component mounts or professionalId changes
  useEffect(() => {
    const loadAgentConfig = async () => {
      if (!professionalId) return

      setConfigLoading(true)
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_widget_customization",
            professionalId: professionalId,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Agent config response:", data)

        const config = parseConfigResponse(data)
        if (config) {
          setAgentConfig(config)
        } else {
          // Use default config if no custom config found
          setAgentConfig(defaultConfig)
        }
      } catch (error) {
        console.error("Error loading agent config:", error)
        // Use default config on error
        setAgentConfig(defaultConfig)
      } finally {
        setConfigLoading(false)
      }
    }

    loadAgentConfig()
  }, [professionalId])

  // Initialize chat with welcome message when config is loaded
  useEffect(() => {
    if (isOpen && messages.length === 0 && agentConfig) {
      setMessages([
        {
          text: agentConfig.chatWelcomeMessage,
          isUser: false,
        },
      ])
    }
  }, [isOpen, messages.length, agentConfig])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !agentConfig) return

    // Add user message
    const userMessage: ChatMessage = { text: message, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Use the same webhook endpoint as the custom agent setup
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "support_conversation",
          professionalId: professionalId,
          message: message,
          userInfo: {
            source: "live_chat_widget",
            sessionId: "chat_" + Date.now(),
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Chat agent response:", data)

      // Parse the response using our existing function
      const responseMessage = parseWebhookResponse(data)

      // Add agent response to chat
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: responseMessage, isUser: false }])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Chat error:", error)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact us directly for immediate assistance.",
            isUser: false,
          },
        ])
        setIsLoading(false)
      }, 1000)
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
  if (configLoading || !agentConfig) {
    return null
  }

  const { chatName, widgetConfig } = agentConfig
  const primaryColor = widgetConfig.primaryColor

  return (
    <>
      {/* Chat Button - Fixed position */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-105"
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
