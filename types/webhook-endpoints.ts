// Centralized webhook endpoint configuration

// Using variables to make future updates easier
const SCHEDULE_SETUP_URL =
  "https://jleib03.app.n8n.cloud/webhook-test/6ac562d1-a0b6-4558-8a78-6e179be01aae";
const CHAT_LANDING_AND_ONBOARDING_URL =
  "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0";
const NEW_CUSTOMER_URL =
  "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4";

export const WEBHOOK_ENDPOINTS = {
  // For schedule, booking, and professional config setup
  PROFESSIONAL_CONFIG: SCHEDULE_SETUP_URL,
  // For professional landing page and chat config
  CHAT_CONFIG: CHAT_LANDING_AND_ONBOARDING_URL,
  // For new customer intake and existing customer widget
  NEW_CUSTOMER_ONBOARDING: NEW_CUSTOMER_URL,
  // For custom agent setup (uses the same as chat/landing)
  CUSTOM_AGENT: CHAT_LANDING_AND_ONBOARDING_URL,
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
