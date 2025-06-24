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
  business_context?: {
    cancellation_policy?: string
    new_customer_process?: string
    animal_restrictions?: string
    service_details?: string
    additional_info?: string
  }
  custom_responses?: Record<string, string>
}
