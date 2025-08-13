// Webhook endpoint configuration
export type WebhookEndpointType = "PROFESSIONAL_CONFIG" | "CHAT_CONFIG" | "NEW_CUSTOMER" | "CUSTOM_AGENT"

// Webhook endpoint URLs
const WEBHOOK_ENDPOINTS: Record<WebhookEndpointType, string> = {
  PROFESSIONAL_CONFIG:
    process.env.NEXT_PUBLIC_PROFESSIONAL_CONFIG_WEBHOOK_URL || "https://hook.us2.make.com/professional-config",
  CHAT_CONFIG: process.env.NEXT_PUBLIC_CHAT_CONFIG_WEBHOOK_URL || "https://hook.us2.make.com/chat-config",
  NEW_CUSTOMER: process.env.NEXT_PUBLIC_NEW_CUSTOMER_WEBHOOK_URL || "https://hook.us2.make.com/new-customer",
  CUSTOM_AGENT: process.env.NEXT_PUBLIC_CUSTOM_AGENT_WEBHOOK_URL || "https://hook.us2.make.com/custom-agent",
}
