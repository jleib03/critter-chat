// Centralized webhook endpoint configuration
export const WEBHOOK_ENDPOINTS = {
  CUSTOM_AGENT:
    process.env.NEXT_PUBLIC_CUSTOM_AGENT_WEBHOOK_URL ||
    "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0",
  PROFESSIONAL_CONFIG:
    process.env.NEXT_PUBLIC_PROFESSIONAL_CONFIG_WEBHOOK_URL ||
    "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520",
  CHAT_CONFIG:
    process.env.NEXT_PUBLIC_CHAT_CONFIG_WEBHOOK_URL ||
    "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0",
} as const

// Type for webhook endpoint keys
export type WebhookEndpointKey = keyof typeof WEBHOOK_ENDPOINTS

// Webhook endpoint getter with validation
export function getWebhookEndpoint(endpoint: WebhookEndpointKey): string {
  const url = WEBHOOK_ENDPOINTS[endpoint]

  if (!url) {
    throw new Error(`Webhook endpoint ${endpoint} is not configured`)
  }

  // Validate URL format
  try {
    new URL(url)
    return url
  } catch (error) {
    throw new Error(`Invalid webhook URL for ${endpoint}: ${url}`)
  }
}

// Helper function to log webhook usage for debugging
export function logWebhookUsage(endpoint: WebhookEndpointKey, action: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔗 Using ${endpoint} webhook for action: ${action}`)
    console.log(`📍 URL: ${WEBHOOK_ENDPOINTS[endpoint]}`)
  }
}
