import type { ChatAgentConfig } from "../types/chat-config"

export async function loadChatConfig(professionalId: string): Promise<ChatAgentConfig | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_URL}/get-chat-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professional_id: professionalId,
      }),
    })

    if (!response.ok) {
      console.error("Failed to load chat config:", response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (!data.success || !data.chat_config) {
      console.error("Invalid chat config response:", data)
      return null
    }

    return data.chat_config
  } catch (error) {
    console.error("Error loading chat config:", error)
    return null
  }
}

export function getDefaultChatConfig(professionalName: string): ChatAgentConfig {
  return {
    chat_name: `${professionalName} Support`,
    welcome_message: `Hi! I'm here to help you with ${professionalName}. I can assist with booking appointments, answering questions about our services, and helping with any other inquiries. How can I help you today?`,
    instructions: `You are a helpful booking assistant for ${professionalName}. Help customers with:
- Booking appointments
- Answering questions about services
- Providing information about availability
- Assisting with general inquiries
Be friendly, professional, and helpful.`,
    widget_config: {
      primary_color: "#E75837",
      position: "bottom-right",
      size: "medium",
    },
    agent_behavior: {
      response_tone: "friendly",
      max_response_length: 200,
      include_booking_links: true,
    },
  }
}
