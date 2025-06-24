import type { ChatAgentConfig } from "../types/chat-config"

export async function loadChatConfig(professionalId: string): Promise<ChatAgentConfig | null> {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/get-chat-config`
    const payload = {
      professional_id: professionalId,
      action: "get_chat_config",
      timestamp: new Date().toISOString(),
    }

    console.log("🚀 Chat Config Webhook Request:")
    console.log("URL:", webhookUrl)
    console.log("Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Chat Config Webhook Response:")
    console.log("Status:", response.status, response.statusText)
    console.log("Headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Chat Config Webhook Error Response:", errorText)
      return null
    }

    const data = await response.json()
    console.log("✅ Chat Config Webhook Success Response:", JSON.stringify(data, null, 2))

    if (!data.success || !data.chat_config) {
      console.error("❌ Invalid chat config response structure:", data)
      return null
    }

    console.log("🎯 Final Chat Config:", JSON.stringify(data.chat_config, null, 2))
    return data.chat_config
  } catch (error) {
    console.error("💥 Chat Config Webhook Error:", error)
    return null
  }
}

export function getDefaultChatConfig(professionalName: string): ChatAgentConfig {
  const defaultConfig = {
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

  console.log("🔄 Using Default Chat Config:", JSON.stringify(defaultConfig, null, 2))
  return defaultConfig
}
