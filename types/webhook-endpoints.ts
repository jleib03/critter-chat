export const WEBHOOK_ENDPOINTS = {
  PROFESSIONAL_CONFIG: "https://jleib03.app.n8n.cloud/webhook/6ac562d1-a0b6-4558-8a78-6e179be01aae",
  CHAT_CONFIG: process.env.NEXT_PUBLIC_CHAT_CONFIG_WEBHOOK_URL || "",
  NEW_CUSTOMER: process.env.NEXT_PUBLIC_NEW_CUSTOMER_WEBHOOK_URL || "",
  CUSTOM_AGENT: process.env.NEXT_PUBLIC_CUSTOM_AGENT_WEBHOOK_URL || "",
} as const
</merged_code>
