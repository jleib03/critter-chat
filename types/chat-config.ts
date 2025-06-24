export interface ChatAgentConfig {
  chat_name: string
  welcome_message: string
  instructions: string
  widget_config: {
    primary_color: string
    position: string
    size: string
  }
  agent_behavior: {
    response_tone: string
    max_response_length: number
    include_booking_links: boolean
  }
  custom_responses?: {
    [key: string]: string
  }
}

export interface ChatConfigWebhookResponse {
  success: boolean
  message?: string
  chat_config?: ChatAgentConfig
  error?: string
}
