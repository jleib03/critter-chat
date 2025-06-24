export type ChatConfig = {
  chatName: string
  chatWelcomeMessage: string
  widgetConfig: {
    primaryColor: string
    position: string
    size: string
  }
  cancellationPolicy?: string
  newCustomerProcess?: string
  animalRestrictions?: string
  serviceDetails?: string
  additionalInfo?: string
}

export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  chatName: "Critter Support",
  chatWelcomeMessage: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
  widgetConfig: {
    primaryColor: "#E75837",
    position: "bottom-right",
    size: "medium",
  },
}

export const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export const loadChatConfig = async (professionalId: string): Promise<ChatConfig> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get_widget_customization",
        professionalId: professionalId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Chat config response:", data)

    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const configData = data[0]

      if (configData) {
        return {
          chatName: configData.chat_name || DEFAULT_CHAT_CONFIG.chatName,
          chatWelcomeMessage: configData.chat_welcome_message || DEFAULT_CHAT_CONFIG.chatWelcomeMessage,
          widgetConfig: {
            primaryColor: configData.widget_primary_color || DEFAULT_CHAT_CONFIG.widgetConfig.primaryColor,
            position: configData.widget_position || DEFAULT_CHAT_CONFIG.widgetConfig.position,
            size: configData.widget_size || DEFAULT_CHAT_CONFIG.widgetConfig.size,
          },
          cancellationPolicy: configData.cancellation_policy || "",
          newCustomerProcess: configData.new_customer_process || "",
          animalRestrictions: configData.animal_restrictions || "",
          serviceDetails: configData.service_details || "",
          additionalInfo: configData.additional_info || "",
        }
      }
    }

    return DEFAULT_CHAT_CONFIG
  } catch (error) {
    console.error("Error loading chat config:", error)
    return DEFAULT_CHAT_CONFIG
  }
}

export const sendChatMessage = async (professionalId: string, message: string, sessionId?: string): Promise<string> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "support_conversation",
        professionalId: professionalId,
        message: message,
        userInfo: {
          source: "live_chat_widget",
          sessionId: sessionId || "chat_" + Date.now(),
          timestamp: new Date().toISOString(),
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Chat response:", data)

    // Handle array response
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0]

      if (firstItem.output) {
        return firstItem.output
      }

      if (firstItem.response) return firstItem.response
      if (typeof firstItem === "string") return firstItem
      return String(firstItem)
    }

    // Handle direct object response
    if (data && typeof data === "object") {
      if (data.output) return data.output
      if (data.response) return data.response
    }

    // Handle direct string response
    if (typeof data === "string") {
      return data
    }

    return "I'm sorry, I couldn't process that request."
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw error
  }
}
