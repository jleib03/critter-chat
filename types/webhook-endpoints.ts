// Centralized webhook endpoint configuration
export const WEBHOOK_ENDPOINTS = {
  NEW_CUSTOMER: "https://jleib03.app.n8n.cloud/webhook-test/a306584e-8637-4284-8a41-ecd5d24dc255",
  PROFESSIONAL_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16",
  CHAT_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  CUSTOM_AGENT: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
} as const

export type WebhookEndpointKey = keyof typeof WEBHOOK_ENDPOINTS

// Usage tracking for debugging
const webhookUsage: Record<string, number> = {}

export function getWebhookEndpoint(key: WebhookEndpointKey): string {
  return WEBHOOK_ENDPOINTS[key]
}

export function logWebhookUsage(key: WebhookEndpointKey, action: string): void {
  const logKey = `${key}_${action}`
  webhookUsage[logKey] = (webhookUsage[logKey] || 0) + 1
  console.log(`Webhook Usage: ${logKey} (${webhookUsage[logKey]} times)`)
}
