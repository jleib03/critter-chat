"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, RefreshCw } from "lucide-react"
import { formatMessage } from "@/utils/message-formatter"

export default function BookingPage() {
  // Update the status colors to match the new primary color
  const [statusColor, setStatusColor] = useState("#E75837") // Updated to Orange (primary)
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; htmlMessage?: string }>>([
    {
      text: "Welcome to Critter Pet Services! Please fill in your information to the left and select one of the below to get started. If you're an existing customer, select one of the service options. If you are a new customer, select New Customer.",
      isUser: false,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [showActionBubbles, setShowActionBubbles] = useState(true)

  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [statusText, setStatusText] = useState("Ready to assist you")
  const [showDebug, setShowDebug] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [selectedAction, setSelectedAction] = useState<string>("")

  const USER_ID = useRef(`web_user_${Math.random().toString(36).substring(2, 10)}`)
  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/dcfe550a-6d48-40b7-a337-c062c0c36f63"

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const actionSelectRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on first name input if empty
    if (firstNameRef.current && !firstNameRef.current.value) {
      firstNameRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Update the hidden input when selectedAction changes
  useEffect(() => {
    if (actionSelectRef.current && selectedAction) {
      actionSelectRef.current.value = selectedAction
    }
  }, [selectedAction])

  const logDebug = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    let logEntry = `[${timestamp}] ${message}`

    if (data) {
      logEntry += `: ${JSON.stringify(data)}`
    }

    setDebugLogs((prev) => [...prev, logEntry])

    // Also log to console
    console.log(message, data)
  }

  const clearDebugLogs = () => {
    setDebugLogs([])
    logDebug("Debug log cleared")
  }

  // Reset the chat to its initial state
  const resetChat = () => {
    // Reset the selected action
    setSelectedAction("")
    if (actionSelectRef.current) {
      actionSelectRef.current.value = ""
    }

    // Show the action bubbles again
    setShowActionBubbles(true)

    // Reset the messages to just the welcome message
    setMessages([
      {
        text: "Welcome to Critter Pet Services! Please fill in your information to the left and select one of the below to get started. If you're an existing customer, select one of the service options. If you are a new customer, select New Customer.",
        isUser: false,
      },
    ])

    // Reset the input value
    setInputValue("")

    // Reset the status
    updateStatus("Ready to assist you", "#E75837")

    // Log the reset
    logDebug("Chat reset by user")

    // Note: We're keeping the user's personal information (name, email)
    // and the user ID to maintain some continuity
  }

  // Update the getUserInfo function to include the selected action
  const getUserInfo = () => {
    return {
      firstName: firstNameRef.current?.value.trim() || "",
      lastName: lastNameRef.current?.value.trim() || "",
      email: emailRef.current?.value.trim() || "",
      selectedAction: selectedAction || actionSelectRef.current?.value || "",
    }
  }

  const updateStatus = (text: string, color: string) => {
    setStatusText(text)
    setStatusColor(color)
  }

  const handleActionBubbleClick = (action: string) => {
    // Get the message text for the selected action
    const actionMessages: { [key: string]: string } = {
      new_booking: "I'd like to make a new booking",
      change_booking: "I need to change my existing booking",
      cancel_booking: "I want to cancel my booking",
      list_bookings: "Show me my existing bookings",
      list_outstanding: "What are my outstanding invoices?",
      new_customer: "I'm a new customer and would like to get started",
    }

    const messageText = actionMessages[action]

    // Set the selected action
    setSelectedAction(action)
    logDebug("Action selected from bubble", { action })

    // Update the hidden input value
    if (actionSelectRef.current) {
      actionSelectRef.current.value = action
    }

    // Hide the action bubbles after selection
    setShowActionBubbles(false)

    // Send the message
    sendMessage(messageText)
  }

  const sendMessage = async (messageText?: string) => {
    // Get the message text from the parameter or the input value
    const message = messageText || inputValue.trim()
    if (!message) return

    setShowActionBubbles(false)

    // Log that we're sending a message
    logDebug("Sending message", { message })

    // Add user message to chat immediately
    setMessages((prev) => {
      const newMessages = [...prev, { text: message, isUser: true }]
      logDebug("Updated messages array", { messageCount: newMessages.length })
      return newMessages
    })

    // Clear input field
    setInputValue("")

    // Show typing indicator
    setIsTyping(true)
    // Update the status color in the sendMessage function
    updateStatus("Thinking...", "#745E25") // Updated to Green (secondary)

    try {
      // Get user info
      const userInfo = getUserInfo()

      // Prepare request payload
      const payload = {
        message: {
          text: message,
          userId: USER_ID.current,
          timestamp: new Date().toISOString(),
          userInfo: userInfo,
        },
      } as any

      // Add session and conversation IDs if available
      if (sessionId) {
        payload.message.sessionId = sessionId
      }
      if (conversationId) {
        payload.message.conversationId = conversationId
      }

      // Log what we're sending
      logDebug("Sending message to webhook", payload)
      // Update the status color in the sendMessage function
      updateStatus("Connecting...", "#94ABD6") // Updated to Blue

      // Send message to webhook
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

      // Parse response
      const data = await response.json()

      // Log the response
      logDebug("Received response", data)

      // Hide typing indicator
      setIsTyping(false)
      // Update the status color in the sendMessage function
      updateStatus("Ready to assist you", "#E75837") // Updated to Orange (primary)

      // Process the response message if it exists
      if (data.message) {
        // Use our formatter to process the message
        const formattedMessage = formatMessage(data.message, data.htmlMessage)

        // Add bot response to chat with the formatted HTML
        setMessages((prev) => [
          ...prev,
          {
            text: formattedMessage.text,
            isUser: false,
            htmlMessage: formattedMessage.html,
          },
        ])
      } else {
        // If no message, just use what we got
        setMessages((prev) => [...prev, { text: JSON.stringify(data), isUser: false }])
      }

      // Store session and conversation IDs - defensive approach
      if (data.sessionId) {
        // Only update if we don't already have a session ID
        if (!sessionId) {
          setSessionId(data.sessionId)
          logDebug("Set initial sessionId", data.sessionId)
        } else {
          // Log that we're keeping the existing ID
          logDebug("Keeping existing sessionId", sessionId)
        }
      }

      if (data.conversationId) {
        // Only update if we don't already have a conversation ID
        if (!conversationId) {
          setConversationId(data.conversationId)
          logDebug("Set initial conversationId", data.conversationId)
        } else {
          // Log that we're keeping the existing ID
          logDebug("Keeping existing conversationId", conversationId)
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      logDebug("Error", error.message)

      // Hide typing indicator
      setIsTyping(false)
      updateStatus("Connection error", "#3F001D") // Updated to Maroon

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your request. Please try again later.",
          isUser: false,
        },
      ])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  // Fix the layout to ensure side-by-side display
  return (
    <div className="container max-w-[1200px] mx-auto my-[30px] px-5">
      <div className="app-header text-center mb-[30px]">
        <h1 className="text-primary text-[2.2rem] mb-[10px] font-bold">Critter - Booking & Info Service</h1>
      </div>

      {/* Side-by-side layout - fixed to ensure it works properly */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Your Information Card - 4 columns on medium screens and up */}
        <div className="md:col-span-4 card bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] overflow-hidden mb-[25px] transition-transform duration-300 hover:translate-y-[-5px)]">
          <div
            className="card-header bg-primary text-white p-5 font-semibold text-[1.2rem]"
            style={{ backgroundColor: "#e75837" }}
          >
            Your Information
          </div>
          <div className="card-body p-6">
            <div className="form-group mb-5">
              <label htmlFor="first-name" className="block mb-2 font-medium text-[var(--text)]">
                First Name
              </label>
              <input
                type="text"
                id="first-name"
                ref={firstNameRef}
                className="w-full p-3 border border-[var(--border)] rounded-lg text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(231,88,55,0.2)]"
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group mb-5">
              <label htmlFor="last-name" className="block mb-2 font-medium text-[var(--text)]">
                Last Name
              </label>
              <input
                type="text"
                id="last-name"
                ref={lastNameRef}
                className="w-full p-3 border border-[var(--border)] rounded-lg text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(231,88,55,0.2)]"
                placeholder="Enter your last name"
              />
            </div>
            <div className="form-group mb-5">
              <label htmlFor="email" className="block mb-2 font-medium text-[var(--text)]">
                Email
              </label>
              <input
                type="email"
                id="email"
                ref={emailRef}
                className="w-full p-3 border border-[var(--border)] rounded-lg text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(231,88,55,0.2)]"
                placeholder="Enter your email address"
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="action-select" className="block mb-2 font-medium text-[var(--text)]">
                Current Action
              </label>
              <div
                className={`w-full p-3 border border-[var(--border)] rounded-lg text-base font-[inherit] bg-[#f5f5f5] ${selectedAction ? "text-[var(--text)]" : "text-[#6b7280] italic"}`}
              >
                {selectedAction ? getActionDisplayName(selectedAction) : "No action selected yet"}
              </div>
              <input type="hidden" id="action-select" ref={actionSelectRef} value={selectedAction} />
              <p className="mt-2 text-sm text-[#6b7280]">Please select an action from the chat options on the right</p>
            </div>

            {selectedAction && (
              <div className="form-group mb-5">
                <button
                  onClick={resetChat}
                  className="flex items-center justify-center w-full p-2 mt-2 border border-[var(--border)] rounded-lg bg-[#f0f2f5] hover:bg-[#e4e6e8] text-[var(--text)] transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Do Something Else
                </button>
                <p className="mt-1 text-xs text-[#6b7280]">
                  This will reset the chat and let you select a different action
                </p>
              </div>
            )}

            <div className="status-indicator flex items-center mt-[10px] text-[0.85rem] text-[var(--text-light)]">
              <div className="status-dot h-2 w-2 rounded-full mr-2" style={{ backgroundColor: statusColor }}></div>
              <div className="status-text font-medium">{statusText}</div>
            </div>
          </div>
        </div>

        {/* Chat Card - 8 columns on medium screens and up */}
        <div className="md:col-span-8 card bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] overflow-hidden mb-[25px] transition-transform duration-300 hover:translate-y-[-5px)]">
          <div
            className="card-header bg-primary text-white p-5 font-semibold text-[1.2rem]"
            style={{ backgroundColor: "#e75837" }}
          >
            Chat with Us
          </div>
          <div className="chat-container flex flex-col h-[500px]">
            <div
              className="chat-messages flex-1 overflow-y-auto p-5 bg-[var(--card-bg)] border-b border-[var(--border)]"
              ref={chatMessagesRef}
            >
              {messages.map((msg, index) => {
                // Log each message for debugging
                console.log(`Rendering message ${index}:`, msg)

                return msg.htmlMessage ? (
                  <div
                    key={index}
                    className={`message mb-[15px] p-3 rounded-[18px] max-w-[80%] relative leading-[1.5] text-[0.95rem] ${
                      msg.isUser
                        ? "user-message bg-[#e75837] text-white ml-auto rounded-br-[4px]"
                        : "bot-message bg-[#f0f2f5] text-[var(--text)] mr-auto rounded-bl-[4px]"
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.htmlMessage }}
                  />
                ) : (
                  <div
                    key={index}
                    className={`message mb-[15px] p-3 rounded-[18px] max-w-[80%] relative leading-[1.5] text-[0.95rem] ${
                      msg.isUser
                        ? "user-message bg-[#e75837] text-white ml-auto rounded-br-[4px]"
                        : "bot-message bg-[#f0f2f5] text-[var(--text)] mr-auto rounded-bl-[4px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                )
              })}
              {showActionBubbles && (
                <div className="action-bubbles flex flex-col gap-4 mt-4">
                  {/* New Customer option with distinct styling */}
                  <div className="new-customer-option">
                    <button
                      onClick={() => handleActionBubbleClick("new_customer")}
                      className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      New Customer
                    </button>
                  </div>

                  {/* Existing customer options */}
                  <div className="existing-customer-options">
                    <p className="text-sm text-gray-600 mb-2">Existing customer options:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleActionBubbleClick("new_booking")}
                        className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        New Booking
                      </button>
                      <button
                        onClick={() => handleActionBubbleClick("change_booking")}
                        className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Change Booking
                      </button>
                      <button
                        onClick={() => handleActionBubbleClick("cancel_booking")}
                        className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Cancel Booking
                      </button>
                      <button
                        onClick={() => handleActionBubbleClick("list_bookings")}
                        className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        List Bookings
                      </button>
                      <button
                        onClick={() => handleActionBubbleClick("list_outstanding")}
                        className="action-bubble bg-[#e75837] hover:bg-[#d04e30] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Outstanding Invoices
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="typing-indicator p-3 bg-[#f0f2f5] rounded-[18px] mb-[15px] w-[70px] mr-auto rounded-bl-[4px]">
                  <span className="h-2 w-2 float-left mx-[1px] bg-[#9E9EA1] block rounded-full opacity-40"></span>
                  <span className="h-2 w-2 float-left mx-[1px] bg-[#9E9EA1] block rounded-full opacity-40"></span>
                  <span className="h-2 w-2 float-left mx-[1px] bg-[#9E9EA1] block rounded-full opacity-40"></span>
                </div>
              )}
            </div>
            <div className="chat-input flex p-[15px] bg-[var(--card-bg)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 p-3 border border-[var(--border)] rounded-[24px] text-base mr-[10px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(231,88,55,0.2)]"
              />
              <button
                onClick={() => sendMessage()}
                className="bg-secondary text-white border-none py-3 px-5 rounded-[24px] cursor-pointer font-medium text-base transition-colors duration-300 hover:bg-[#5d4b1e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(116,94,37,0.3)] inline-flex items-center justify-center"
              >
                Send
                <Send className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDebug && (
        <div className="debug-panel bg-[var(--card-bg)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5 mt-[25px]">
          <h3 className="mt-0 text-primary mb-[15px] text-[1.2rem]">Debug Information</h3>
          <div className="debug-log h-[200px] overflow-y-auto bg-[#f5f5f5] p-[15px] font-mono text-[0.85rem] rounded-lg border border-[var(--border)]">
            {debugLogs.map((log, index) => (
              <div key={index} className="mb-[5px] leading-[1.4]">
                {log}
              </div>
            ))}
          </div>
          <div className="debug-controls flex justify-end mt-[15px]">
            <button
              onClick={clearDebugLogs}
              className="bg-[#f0f2f5] text-[var(--text)] border border-[var(--border)] py-2 px-[15px] rounded-md cursor-pointer text-[0.9rem] transition-all duration-200 hover:bg-[#e4e6e8]"
            >
              Clear Log
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-[#f0f2f5] text-[var(--text)] border border-[var(--border)] py-2 px-[15px] rounded-md cursor-pointer text-[0.9rem] transition-all duration-200 hover:bg-[#e4e6e8]"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>
      </div>
    </div>
  )
}

// Helper function to get a user-friendly display name for the action
function getActionDisplayName(action: string): string {
  const actionDisplayNames: { [key: string]: string } = {
    new_booking: "New Booking",
    change_booking: "Change Existing Booking",
    cancel_booking: "Cancel Booking",
    list_bookings: "List Bookings",
    list_outstanding: "Outstanding Invoices",
    new_customer: "New Customer",
  }

  return actionDisplayNames[action] || action
}
