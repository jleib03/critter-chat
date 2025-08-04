// Centralized webhook endpoint configuration
export const WEBHOOK_ENDPOINTS = {
  CUSTOM_AGENT: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  PROFESSIONAL_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16",
  CHAT_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  NEW_CUSTOMER_ONBOARDING: "https://jleib03.app.n8n.cloud/webhook-test/a306584e-8637-4284-8a41-ecd5d24dc255",
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
