import type { ChatAgentConfig } from "../types/chat-config"

const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

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
      console.error("❌ HTTP error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log("📥 Raw chat config response:", JSON.stringify(data, null, 2))

    // Handle array response - take first item
    const webhook_response = Array.isArray(data) ? data[0] : data

    if (!webhook_response) {
      console.log("⚠️ No data in webhook response")
      return null
    }

    console.log("🔍 Parsing chat config from first record:", JSON.stringify(webhook_response, null, 2))

    // Check if the response has chat configuration fields directly
    if (webhook_response.chat_name || webhook_response.chat_welcome_message) {
      const config: ChatAgentConfig = {
        professionalId: webhook_response.professional_id || uniqueUrl,
        chatName: webhook_response.chat_name || "Critter Assistant",
        welcomeMessage: webhook_response.chat_welcome_message || "Hello! How can I help you today?",
        primaryColor: webhook_response.widget_primary_color || "#E75837",
        position: webhook_response.widget_position || "bottom-right",
        size: webhook_response.widget_size || "medium",
        isEnabled: true,
      }

      console.log("✅ Valid chat config parsed:", JSON.stringify(config, null, 2))
      return config
    }

    // If no direct fields, check for nested structures
    const config_data = webhook_response.config_data || webhook_response.chat_config || webhook_response

    if (!config_data) {
      console.log("⚠️ No config_data found in response")
      return null
    }

    // Validate that we have the required fields
    if (
      !config_data.chat_name &&
      !config_data.chatName &&
      !config_data.chat_welcome_message &&
      !config_data.welcomeMessage
    ) {
      console.log("⚠️ No valid chat configuration found in response")
      return null
    }

    const finalConfig: ChatAgentConfig = {
      professionalId: config_data.professional_id || config_data.professionalId || uniqueUrl,
      chatName: config_data.chat_name || config_data.chatName || "Critter Assistant",
      welcomeMessage:
        config_data.chat_welcome_message || config_data.welcomeMessage || "Hello! How can I help you today?",
      primaryColor: config_data.widget_primary_color || config_data.primaryColor || "#E75837",
      position: config_data.widget_position || config_data.position || "bottom-right",
      size: config_data.widget_size || config_data.size || "medium",
      isEnabled: true,
    }

    console.log("✅ Chat config loaded successfully:", JSON.stringify(finalConfig, null, 2))
    return finalConfig
  } catch (error) {
    console.error("💥 Error loading chat config:", error)
    return null
  }
}

export function getDefaultChatConfig(uniqueUrl: string): ChatAgentConfig {
  return {
    professionalId: uniqueUrl,
    chatName: "Critter Assistant",
    welcomeMessage: "Hello! How can I help you with your pet care needs today?",
    primaryColor: "#E75837",
    position: "bottom-right",
    size: "medium",
    isEnabled: false,
  }
}
