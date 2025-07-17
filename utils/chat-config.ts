// Utility for loading chat configuration
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export async function loadChatConfig(uniqueUrl: string) {
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
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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

    // Parse the response format
    if (Array.isArray(data) && data.length > 0) {
      const firstRecord = data[0]
      console.log("🔍 Parsing chat config from first record:", firstRecord)

      // Check for webhook_response structure
      if (firstRecord.webhook_response && firstRecord.webhook_response.success) {
        console.log("✅ Found webhook_response.success structure")
        return firstRecord.webhook_response.config_data || null
      }

      // Check for direct config data
      if (firstRecord.config_data) {
        console.log("✅ Found direct config_data structure")
        return firstRecord.config_data
      }

      // Check for chat_config structure
      if (firstRecord.chat_config) {
        console.log("✅ Found chat_config structure")
        return firstRecord.chat_config
      }
    }

    console.log("⚠️ No valid chat configuration found in response")
    return null
  } catch (error) {
    console.error("💥 Error loading chat configuration:", error)
    return null
  }
}
