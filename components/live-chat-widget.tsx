"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"
import { Send, Loader2, X, MessageCircle } from "lucide-react"
import type { ChatAgentConfig } from "../types/chat-config"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
}

interface LiveChatWidgetProps {
  uniqueUrl: string
  professionalId: string
  professionalName: string
  chatConfig: ChatAgentConfig
  isConfigLoading: boolean
}

const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export default function LiveChatWidget({
  uniqueUrl,
  professionalId,
  professionalName,
  chatConfig,
  isConfigLoading,
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string>("")

  // Generate a unique session ID when the component mounts
  useEffect(() => {
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    console.log("Generated chat session ID:", newSessionId)
  }, [])

  // Add welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isConfigLoading && chatConfig) {
      const welcomeMessage =
        chatConfig.chat_welcome_message || `Hello! How can I help you with ${professionalName}'s services today?`

      setMessages([
        {
          id: `welcome_${Date.now()}`,
          text: welcomeMessage,
          sender: "agent",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length, chatConfig, professionalName, isConfigLoading])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    try {
      // Send message to webhook with the specific format requested
      const payload = {
        action: "support_conversation",
        uniqueUrl: uniqueUrl,
        professionalId: professionalId,
        session_id: sessionId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        chat_history: messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
          timestamp: m.timestamp.toISOString(),
        })),
      }

      console.log("Sending chat message to webhook:", payload)

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received chat response:", data)

      // Extract the response message - handle "output" field specifically
      let responseText = "I'm sorry, I couldn't process your request at the moment."

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        // Check for "output" field first (your webhook's format)
        if (firstItem.output) {
          responseText = firstItem.output
        } else if (firstItem.response) {
          responseText = firstItem.response
        } else if (firstItem.message) {
          responseText = firstItem.message
        } else if (firstItem.text) {
          responseText = firstItem.text
        } else if (firstItem.content) {
          responseText = firstItem.content
        } else if (typeof firstItem === "string") {
          responseText = firstItem
        }
      } else if (typeof data === "string") {
        responseText = data
      } else if (data.output) {
        responseText = data.output
      } else if (data.response) {
        responseText = data.response
      } else if (data.message) {
        responseText = data.message
      } else if (data.text) {
        responseText = data.text
      } else if (data.content) {
        responseText = data.content
      }

      // Add agent response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `agent_${Date.now()}`,
          text: responseText,
          sender: "agent",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error sending chat message:", error)

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          sender: "agent",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Use the loaded chat config colors and settings
  const primaryColor = chatConfig?.widget_primary_color || "#94ABD6"
  const chatName = chatConfig?.chat_name || professionalName

  // Helper function to get hover color (slightly darker)
  const getHoverColor = (color: string) => {
    if (color === "#94ABD6") return "#7a90ba"
    if (color === "#94d6b1") return "#7bc49a"
    // For other colors, try to darken by reducing the hex values
    const hex = color.replace("#", "")
    const r = Math.max(0, Number.parseInt(hex.substr(0, 2), 16) - 20)
    const g = Math.max(0, Number.parseInt(hex.substr(2, 2), 16) - 20)
    const b = Math.max(0, Number.parseInt(hex.substr(4, 2), 16) - 20)
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  const hoverColor = getHoverColor(primaryColor)

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-colors z-40"
        style={{
          backgroundColor: primaryColor,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverColor
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = primaryColor
        }}
        aria-label="Chat with us"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-xl z-40 flex flex-col max-h-[70vh] border border-gray-200">
          {/* Chat Header */}
          <div className="text-white p-4 rounded-t-xl" style={{ backgroundColor: primaryColor }}>
            <h3 className="font-bold header-font">Chat with {chatName}</h3>
            <p className="text-sm text-white/80 body-font">Ask questions about services and booking</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-[#E75837] text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  } body-font`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none p-3 body-font flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 resize-none body-font"
                style={
                  {
                    focusRingColor: primaryColor,
                    "--tw-ring-color": primaryColor,
                  } as React.CSSProperties
                }
                rows={2}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="ml-2 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = hoverColor
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = primaryColor
                  }
                }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center body-font">Powered by Critter AI Assistant</p>
          </div>
        </div>
      )}
    </>
  )
}
