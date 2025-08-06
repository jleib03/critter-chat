// Centralized webhook endpoint configuration
// Using variables to make future updates easier
const CUSTOM_AGENT_URL = "https://jleib03.app.n8n.cloud/webhook/94a7e18e-149c-4a66-a16b-db77f15756a2";
const SCHEDULE_CONFIG_URL = "https://jleib03.app.n8n.cloud/webhook/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16";
const GENERAL_PURPOSE_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4";
const NEW_CUSTOMER_ONBOARDING_URL = "https://jleib03.app.n8n.cloud/webhook/a306584e-8637-4284-8a41-ecd5d24dc255";

export const WEBHOOK_ENDPOINTS = {
  CUSTOM_AGENT: CUSTOM_AGENT_URL,
  // For schedule and availability setup
  SCHEDULE_CONFIG: SCHEDULE_CONFIG_URL,
  // For chat config, professional page init, and new customer onboarding
  GENERAL_PURPOSE: GENERAL_PURPOSE_URL,
  NEW_CUSTOMER_ONBOARDING: NEW_CUSTOMER_ONBOARDING_URL,
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
