import type { ChatAgentConfig } from "../types/chat-config"

export async function loadChatConfig(professionalId: string): Promise<ChatAgentConfig | null> {
  try {
    console.log("Loading chat config for professional ID:", professionalId)

    // Use the same webhook URL pattern as other successful calls
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_URL}/get-professional-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professional_id: professionalId,
        action: "get_chat_config", // Add action parameter to distinguish this request
      }),
    })

    console.log("Chat config response status:", response.status)

    if (!response.ok) {
      console.error("Failed to load chat config:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log("Raw chat config response:", data)

    // Handle the response format similar to other webhook responses
    if (Array.isArray(data) && data.length > 0) {
      const configData = data[0]
      console.log("Chat config data:", configData)

      if (configData) {
        const chatConfig: ChatAgentConfig = {
          chat_name: configData.chat_name || configData.name + " Support",
          welcome_message:
            configData.welcome_message ||
            `Hi! I'm here to help you with ${configData.name}. How can I assist you today?`,
          instructions:
            configData.instructions ||
            `You are a helpful booking assistant for ${configData.name}. Help customers with booking appointments and answering questions about services.`,
          widget_config: {
            primary_color: configData.primary_color || configData.widget_primary_color || "#E75837",
            position: configData.widget_position || "bottom-right",
            size: configData.widget_size || "medium",
          },
          agent_behavior: {
            response_tone: configData.response_tone || "friendly",
            max_response_length: configData.max_response_length || 200,
            include_booking_links: configData.include_booking_links !== false,
          },
          custom_responses: configData.custom_responses ? JSON.parse(configData.custom_responses) : {},
        }

        console.log("Parsed chat config:", chatConfig)
        return chatConfig
      }
    }

    console.log("No chat config found in response, using defaults")
    return null
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
