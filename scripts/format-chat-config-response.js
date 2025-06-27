// N8N Script to format chat configuration response
const professionalId = "professional_id" // Placeholder for $input.first().json.professional_id
const $input = {
  // Placeholder for $input variable
  first: () => ({
    json: {
      professional_id: professionalId,
      query_result: [], // Placeholder for query_result
    },
  }),
}

try {
  // Get the query result from the previous node
  const queryResult = $input.first().json.query_result

  if (!queryResult || queryResult.length === 0) {
    throw new Error("No chat configuration found for professional")
  }

  const config = queryResult[0]

  // Format the chat configuration
  const chatConfig = {
    chat_name: config.chat_name || `${config.business_name} Support`,
    welcome_message:
      config.welcome_message || `Hi! I'm here to help you with ${config.business_name}. How can I assist you today?`,
    instructions:
      config.instructions ||
      `You are a helpful booking assistant for ${config.business_name}. Help customers with booking appointments and answering questions about services.`,
    widget_config: {
      primary_color: config.primary_color || "#E75837",
      position: config.widget_position || "bottom-right",
      size: config.widget_size || "medium",
    },
    agent_behavior: {
      response_tone: config.response_tone || "friendly",
      max_response_length: config.max_response_length || 200,
      include_booking_links: config.include_booking_links !== false,
    },
    custom_responses: config.custom_responses ? JSON.parse(config.custom_responses) : {},
  }

  console.log({
    json: {
      success: true,
      message: "Chat configuration loaded successfully",
      professional_id: professionalId,
      chat_config: chatConfig,
      last_updated: config.chat_config_updated,
    },
  })
} catch (error) {
  console.error("Error formatting chat config:", error)

  console.log({
    json: {
      success: false,
      message: "Error processing chat configuration",
      error: error.message,
      professional_id: professionalId,
    },
  })
}
