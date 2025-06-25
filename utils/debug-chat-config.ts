// Debug utility to see exactly what we're sending to the webhook
export function debugChatConfigRequest(professionalId: string) {
  const payload = {
    professional_id: professionalId,
    action: "get_chat_config",
  }

  console.log("=== CHAT CONFIG WEBHOOK DEBUG ===")
  console.log("Webhook URL:", process.env.NEXT_PUBLIC_WEBHOOK_URL + "/get-professional-info")
  console.log("Method: POST")
  console.log("Headers:", {
    "Content-Type": "application/json",
  })
  console.log("Payload:", JSON.stringify(payload, null, 2))
  console.log("================================")

  return payload
}

// Test function to manually trigger the webhook call
export async function testChatConfigWebhook(professionalId: string) {
  const payload = debugChatConfigRequest(professionalId)

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_URL}/get-professional-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("Raw response text:", responseText)

    try {
      const responseJson = JSON.parse(responseText)
      console.log("Parsed response JSON:", responseJson)
      return responseJson
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return responseText
    }
  } catch (error) {
    console.error("Webhook request failed:", error)
    throw error
  }
}
