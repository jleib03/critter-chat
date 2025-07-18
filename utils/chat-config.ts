import type { ChatAgentConfig } from "../types/chat-config"

const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export async function loadChatConfig(uniqueUrl: string): Promise<ChatAgentConfig | null> {
  try {
    console.log("🚀 Loading chat configuration for URL:", uniqueUrl)
    console.log("🔗 Using webhook URL:", WEBHOOK_URL)

    const payload = {
      action: "get_chat_config",
      uniqueUrl: uniqueUrl,
      timestamp: new Date().toISOString(),
    }

    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📥 Raw chat config response:", JSON.stringify(data, null, 2))

    // Handle array response (typical webhook format)
    if (Array.isArray(data) && data.length > 0) {
      const configData = data[0]
      console.log("🔍 Parsing chat config from first record:", JSON.stringify(configData, null, 2))

      // Map the webhook response to our ChatAgentConfig interface
      const chatConfig: ChatAgentConfig = {
        professional_id: configData.professional_id || "",
        chat_name: configData.chat_name || "",
        chat_welcome_message: configData.chat_welcome_message || "",
        widget_primary_color: configData.widget_primary_color || "#94ABD6",
        widget_position: configData.widget_position || "bottom-right",
        widget_size: configData.widget_size || "medium",
      }

      console.log("✅ Valid chat configuration found")
      return chatConfig
    }

    // Handle direct object response
    if (data && typeof data === "object" && !Array.isArray(data)) {
      console.log("🔍 Parsing chat config from direct object:", JSON.stringify(data, null, 2))

      const chatConfig: ChatAgentConfig = {
        professional_id: data.professional_id || "",
        chat_name: data.chat_name || "",
        chat_welcome_message: data.chat_welcome_message || "",
        widget_primary_color: data.widget_primary_color || "#94ABD6",
        widget_position: data.widget_position || "bottom-right",
        widget_size: data.widget_size || "medium",
      }

      console.log("✅ Valid chat configuration found")
      return chatConfig
    }

    console.log("⚠️ No valid chat configuration found in response")
    return null
  } catch (error) {
    console.error("💥 Failed to load chat configuration:", error)
    return null
  }
}
