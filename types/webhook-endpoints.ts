// Defines the webhook endpoints for different services in the application.
// This file uses hardcoded test URLs to ensure the development branch does not use production webhooks.

// A mapping of webhook types to their corresponding URLs.
const webhookEndpoints = {
  PROFESSIONAL_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  CHAT_CONFIG: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  NEW_CUSTOMER: "https://jleib03.app.n8n.cloud/webhook-test/94a7e18e-149c-4a66-a16b-db77f15756a2",
  CUSTOM_AGENT: "https://jleib03.app.n8n.cloud/webhook-test/15f85beb-543f-47b2-954a-458984e3f94c",
  // Add other webhook types here if needed
}

export type WebhookType = keyof typeof webhookEndpoints

// A record to track the usage of each webhook endpoint for debugging and analytics.
export const webhookUsage: Record<string, number> = {}

/**
 * Retrieves the webhook URL for a given type.
 * @param type The type of webhook endpoint to retrieve.
 * @returns The URL of the webhook.
 * @throws {Error} If the webhook type is invalid.
 */
export function getWebhookEndpoint(type: WebhookType): string {
  const url = webhookEndpoints[type]
  if (!url) {
    console.error(`Invalid webhook type: ${type}`)
    throw new Error(`Invalid webhook type: ${type}`)
  }
  return url
}

/**
 * Logs the usage of a specific webhook endpoint.
 * @param type The type of webhook that was used.
 * @param action The action performed with the webhook.
 */
export function logWebhookUsage(type: WebhookType, action: string): void {
  const key = `${type}_${action}`
  webhookUsage[key] = (webhookUsage[key] || 0) + 1
  console.log(`Webhook used: ${key}, Total uses: ${webhookUsage[key]}`)
}
