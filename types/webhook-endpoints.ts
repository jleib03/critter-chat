// Centralized webhook endpoint configuration
// Using variables to make future updates easier
const SCHEDULE_SETUP_URL = "https://jleib03.app.n8n.cloud/webhook/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16";
const CHAT_LANDING_AND_ONBOARDING_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4";

export const WEBHOOK_ENDPOINTS = {
  // For custom agent setup page (enrollment, config, testing)
  CUSTOM_AGENT: CHAT_LANDING_AND_ONBOARDING_URL,
  // For schedule and availability setup page
  PROFESSIONAL_CONFIG: SCHEDULE_SETUP_URL,
  // For loading chat config and professional landing page data
  CHAT_CONFIG: CHAT_LANDING_AND_ONBOARDING_URL,
  // For new customer intake flow
  NEW_CUSTOMER_ONBOARDING: CHAT_LANDING_AND_ONBOARDING_URL,
} as const;

// Type for webhook endpoint keys
export type WebhookEndpointKey = keyof typeof WEBHOOK_ENDPOINTS;

// Webhook endpoint getter with validation
export function getWebhookEndpoint(endpoint: WebhookEndpointKey): string {
  const url = WEBHOOK_ENDPOINTS[endpoint];

  if (!url) {
    throw new Error(`Webhook endpoint ${endpoint} is not configured`);
  }

  // Validate URL format
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new Error(`Invalid webhook URL for ${endpoint}: ${url}`);
  }
}

// Helper function to log webhook usage for debugging
export function logWebhookUsage(endpoint: WebhookEndpointKey, action: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔗 Using ${endpoint} webhook for action: ${action}`);
    console.log(`📍 URL: ${WEBHOOK_ENDPOINTS[endpoint]}`);
  }
}
