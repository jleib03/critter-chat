const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export interface ChatConfig {
  isEnabled: boolean
  chatName: string
  welcomeMessage: string
  primaryColor: string
  position: "bottom-left" | "bottom-right"
  size: "small" | "medium" | "large"
}

export async function loadChatConfig(uniqueUrl: string): Promise<ChatConfig | null> {
  try {
    console.log(`🚀 Loading chat configuration for URL: ${uniqueUrl}`)
    console.log(`🔗 Using webhook URL: ${WEBHOOK_URL}`)

    const payload = {
      action: "get_chat_config",
      uniqueUrl: uniqueUrl,
      timestamp: new Date().toISOString(),
    }

    console.log(`📤 Sending payload:`, JSON.stringify(payload, null, 2))

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log(`📡 Response status: ${response.status}`)

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log(`📥 Raw chat config response:`, JSON.stringify(data, null, 2))

    // Parse the response - expecting an array with chat config data
    if (Array.isArray(data) && data.length > 0) {
      const firstRecord = data[0]
      console.log(`🔍 Parsing chat config from first record:`, JSON.stringify(firstRecord, null, 2))

      // Check if the first record has the chat configuration fields directly
      if (
        firstRecord &&
        (firstRecord.chat_name || firstRecord.chat_welcome_message || firstRecord.widget_primary_color)
      ) {
        console.log(`✅ Valid chat configuration found`)
        return {
          isEnabled: true,
          chatName: firstRecord.chat_name || "Critter Support",
          welcomeMessage:
            firstRecord.chat_welcome_message ||
            "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
          primaryColor: firstRecord.widget_primary_color || "#94ABD6",
          position: (firstRecord.widget_position as "bottom-left" | "bottom-right") || "bottom-right",
          size: (firstRecord.widget_size as "small" | "medium" | "large") || "medium",
        }
      }
    }

    console.log(`⚠️ No valid chat configuration found in response`)
    return null
  } catch (error) {
    console.error(`❌ Error loading chat configuration:`, error)
    return null
  }
}

export function getDefaultChatConfig(): ChatConfig {
  return {
    isEnabled: false,
    chatName: "Critter Support",
    welcomeMessage: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
    primaryColor: "#94ABD6",
    position: "bottom-right",
    size: "medium",
  }
}
