import type { ChatAgentConfig } from "../types/chat-config"

// Use the same webhook URL as the custom agent setup
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export async function loadChatConfig(professionalId: string): Promise<ChatAgentConfig | null> {
  try {
    console.log("🚀 Loading chat config for professional ID:", professionalId)
    console.log("🔗 Using webhook URL:", WEBHOOK_URL)

    // Use the same payload format as the custom agent setup
    const payload = {
      action: "get_widget_customization",
      professionalId: professionalId,
    }

    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Chat config webhook error:", errorText)
      return null
    }

    const data = await response.json()
    console.log("📥 Raw chat config response:", JSON.stringify(data, null, 2))

    // Parse the response - expecting array format like other webhooks
    if (Array.isArray(data) && data.length > 0) {
      const configData = data[0]
      console.log("🔍 Parsing config data:", configData)

      // Check if the config data is empty or invalid
      if (!configData || Object.keys(configData).length === 0) {
        console.log("⚠️ Empty config data received - chat will be disabled")
        return null
      }

      // Check if all values are empty/null/undefined
      const hasValidValues = Object.keys(configData).some((key) => {
        const value = configData[key]
        return value !== null && value !== undefined && value !== ""
      })

      if (!hasValidValues) {
        console.log("⚠️ Config data has no valid values - chat will be disabled")
        return null
      }

      if (configData) {
        const chatConfig: ChatAgentConfig = {
          chat_name: configData.chat_name || configData.name + " Support" || "Critter Support",
          welcome_message:
            configData.chat_welcome_message ||
            configData.welcome_message ||
            `Hi! I'm here to help you with ${configData.name || "your pet care needs"}. How can I assist you today?`,
          instructions:
            configData.instructions ||
            configData.agent_instructions ||
            `You are a helpful booking assistant. Help customers with booking appointments and answering questions about services.`,
          widget_config: {
            primary_color: configData.widget_primary_color || configData.primary_color || "#E75837",
            position: configData.widget_position || "bottom-right",
            size: configData.widget_size || "medium",
          },
          agent_behavior: {
            response_tone: configData.response_tone || "friendly",
            max_response_length: Number.parseInt(configData.max_response_length) || 200,
            include_booking_links: configData.include_booking_links !== false,
          },
          // Include business context from the professional setup
          business_context: {
            cancellation_policy: configData.cancellation_policy || "",
            new_customer_process: configData.new_customer_process || "",
            animal_restrictions: configData.animal_restrictions || "",
            service_details: configData.service_details || "",
            additional_info: configData.additional_info || "",
          },
        }

        console.log("✅ Final parsed chat config:", JSON.stringify(chatConfig, null, 2))
        return chatConfig
      }
    }

    console.log("⚠️ No valid chat config found in response - chat will be disabled")
    return null
  } catch (error) {
    console.error("💥 Error loading chat config:", error)
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

  console.log("🔄 Using default chat config:", JSON.stringify(defaultConfig, null, 2))
  return defaultConfig
}
