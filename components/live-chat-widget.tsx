"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface LiveChatWidgetProps {
  uniqueUrl: string
  professionalId: string
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ uniqueUrl, professionalId }) => {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate a session ID if one doesn't exist in local storage
    const storedSessionId = localStorage.getItem("sessionId")
    return storedSessionId || generateSessionId()
  })
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Store the session ID in local storage when it changes
    localStorage.setItem("sessionId", sessionId)
  }, [sessionId])

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value)
  }

  const sendMessage = async () => {
    if (newMessage.trim() !== "") {
      const message = newMessage.trim()
      setMessages([...messages, `You: ${message}`])

      // Construct the webhook payload
      const payload = {
        action: "support_conversation",
        uniqueUrl: uniqueUrl,
        professionalId: professionalId,
        message: message,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
      }

      try {
        // Replace with your actual webhook URL
        const webhookUrl = "/api/webhook"

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.error("Webhook request failed:", response.status)
          setMessages([...messages, `You: ${message}`, `Error: Message failed to send`])
        } else {
          const data = await response.json()
          setMessages([...messages, `You: ${message}`, `Agent: ${data.response}`])
        }
      } catch (error) {
        console.error("Error sending message:", error)
        setMessages([...messages, `You: ${message}`, `Error: Message failed to send`])
      }

      setNewMessage("")
    }
  }

  return (
    <div className="live-chat-widget">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input type="text" placeholder="Type your message..." value={newMessage} onChange={handleInputChange} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default LiveChatWidget
