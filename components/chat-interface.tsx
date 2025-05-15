"use client"
import { useRef, useEffect } from "react"
import type React from "react"

import { Send } from "lucide-react"
import ActionBubbles from "./action-bubbles"
import SelectionBubbles from "./selection-bubbles"
import BookingCalendar, { type BookingInfo } from "./booking-calendar"

type SelectionOption = {
  name: string
  description?: string
  details?: string[]
  selected?: boolean
  category?: string
}

type SelectionType = "professional" | "service" | "pet" | "confirmation" | null

type ChatInterfaceProps = {
  messages: Array<{ text: string; isUser: boolean; htmlMessage?: string }>
  isTyping: boolean
  showActionBubbles: boolean
  showSelectionBubbles: boolean
  selectionType: SelectionType
  selectionOptions: SelectionOption[]
  allowMultipleSelection: boolean
  selectedMainService: string | null
  selectedOptions: string[]
  showCalendar: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onActionSelect: (action: string) => void
  onSelectionClick: (option: SelectionOption) => void
  onSelectionSubmit: () => void
  onCalendarSubmit: (bookingInfo: BookingInfo) => void
  onCalendarCancel: () => void
}

export default function ChatInterface({
  messages,
  isTyping,
  showActionBubbles,
  showSelectionBubbles,
  selectionType,
  selectionOptions,
  allowMultipleSelection,
  selectedMainService,
  selectedOptions,
  showCalendar,
  inputValue,
  onInputChange,
  onSendMessage,
  onActionSelect,
  onSelectionClick,
  onSelectionSubmit,
  onCalendarSubmit,
  onCalendarCancel,
}: ChatInterfaceProps) {
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages, isTyping, showActionBubbles, showSelectionBubbles, showCalendar])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#E75837] text-white py-3 px-4 rounded-t-lg">
        <h2 className="text-xl font-medium header-font">What can Critter do for you?</h2>
      </div>
      <div className="bg-white rounded-b-lg shadow-sm flex flex-col flex-1">
        {/* Fixed height chat messages container with overflow */}
        <div className="overflow-y-auto p-5 body-font chat-container flex-none" ref={chatMessagesRef}>
          <p className="text-gray-700 mb-4 body-font">
            Let's get you started! First thing's first, share some details to the left so can match you to the right
            businesses on Critter.
          </p>

          {messages.slice(1).map((msg, index) => {
            // Add extra spacing for non-user messages that might contain options
            const messageContent = msg.htmlMessage || msg.text
            const hasOptions =
              !msg.isUser &&
              (messageContent.includes("select") ||
                messageContent.includes("option") ||
                messageContent.includes("choose") ||
                messageContent.includes("?") ||
                messageContent.includes("Email:") ||
                messageContent.includes("Duration:") ||
                messageContent.includes("Price:"))

            // Add extra margin for messages that likely contain options
            const extraSpacing = hasOptions ? "mb-5" : "mb-4"

            // Add extra padding for messages with structured content
            const extraPadding = hasOptions ? "p-4" : "p-3"

            return msg.htmlMessage ? (
              <div
                key={index}
                className={`message ${extraSpacing} ${extraPadding} rounded-lg max-w-[85%] relative ${
                  msg.isUser
                    ? "bg-[#E75837] text-white ml-auto rounded-br-sm"
                    : "bg-gray-100 text-gray-800 mr-auto rounded-bl-sm"
                } body-font`}
                dangerouslySetInnerHTML={{ __html: msg.htmlMessage }}
              />
            ) : (
              <div
                key={index}
                className={`message ${extraSpacing} ${extraPadding} rounded-lg max-w-[85%] relative ${
                  msg.isUser
                    ? "bg-[#E75837] text-white ml-auto rounded-br-sm"
                    : "bg-gray-100 text-gray-800 mr-auto rounded-bl-sm"
                } body-font whitespace-pre-line`}
              >
                {msg.text}
              </div>
            )
          })}

          {/* Initial action bubbles */}
          {showActionBubbles && <ActionBubbles onActionSelect={onActionSelect} />}

          {/* Selection bubbles for professionals, services, pets, confirmation */}
          {showSelectionBubbles && (
            <SelectionBubbles
              selectionType={selectionType}
              selectionOptions={selectionOptions}
              allowMultipleSelection={allowMultipleSelection}
              selectedMainService={selectedMainService}
              selectedOptions={selectedOptions}
              onSelectionClick={onSelectionClick}
              onSubmit={onSelectionSubmit}
            />
          )}

          {/* Calendar widget for date/time selection */}
          {showCalendar && (
            <div className="calendar-widget mt-4 mb-4">
              <BookingCalendar onSubmit={onCalendarSubmit} onCancel={onCalendarCancel} />
            </div>
          )}

          {isTyping && (
            <div className="typing-indicator p-3 bg-gray-100 rounded-lg mb-4 w-16 mr-auto rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
          />

          <button
            onClick={onSendMessage}
            className="bg-[#E75837] text-white px-4 py-3 rounded-r-lg hover:bg-[#d04e30] transition-colors flex items-center header-font"
          >
            <span className="mr-2">Send</span>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
