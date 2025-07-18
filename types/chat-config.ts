export interface ChatAgentConfig {
  professional_id: string
  chat_name: string
  chat_welcome_message: string
  widget_primary_color: string
  widget_position: "bottom-left" | "bottom-right"
  widget_size: "small" | "medium" | "large"
}

export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  isActive: boolean
  startedAt: Date
}
