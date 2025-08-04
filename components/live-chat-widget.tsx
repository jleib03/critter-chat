"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatWidgetProps {
  professionalId: string
  chatName?: string
  welcomeMessage?: string
  primaryColor?: string
  position?: "bottom-right" | "bottom-left"
  size?: "small" | "medium" | "large"
}

export default function LiveChatWidget({
  professionalId,
  chatName = "Critter Support",
  welcomeMessage = "Hello! How can I help you today?",
  primaryColor = "#94ABD6",
  position = "bottom-right",
  size = "medium",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: welcomeMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ])
    }
  }, [welcomeMessage])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "support_conversation",
          professionalId: professionalId,
          message: userMessage.text,
          userInfo: {
            source: "live_chat_widget",
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Chat response:", data)

      // Parse the response
      let responseText = "I'm sorry, I couldn't process that request."

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        if (firstItem.output) {
          responseText = firstItem.output
        } else if (firstItem.response) {
          responseText = firstItem.response
        } else if (typeof firstItem === "string") {
          responseText = firstItem
        }
      } else if (data && typeof data === "object") {
        if (data.output) {
          responseText = data.output
        } else if (data.response) {
          responseText = data.response
        }
      } else if (typeof data === "string") {
        responseText = data
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Size configurations
  const sizeConfig = {
    small: { width: "w-80", height: "h-96" },
    medium: { width: "w-96", height: "h-[500px]" },
    large: { width: "w-[420px]", height: "h-[600px]" },
  }

  // Position configurations
  const positionConfig = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  if (!isOpen) {
    return (
      <div className={`fixed ${positionConfig[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionConfig[position]} z-50`}>
      <div
        className={`bg-white rounded-lg shadow-2xl border ${sizeConfig[size].width} ${
          isMinimized ? "h-14" : sizeConfig[size].height
        } flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{chatName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser ? "text-white" : "bg-gray-100 text-gray-800"
                    }`}
                    style={message.isUser ? { backgroundColor: primaryColor } : {}}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  style={{ backgroundColor: primaryColor }}
                  className="text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
