import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints";
import type { ChatAgentConfig } from "../types/chat-config";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: ChatAgentConfig; timestamp: number }>();

export async function loadChatConfig(uniqueUrl: string): Promise<ChatAgentConfig | null> {
  const cachedItem = cache.get(uniqueUrl);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
    console.log("✅ Using cached chat config for:", uniqueUrl);
    return cachedItem.data;
  }

  try {
    const webhookUrl = getWebhookEndpoint("CHAT_CONFIG");
    logWebhookUsage("CHAT_CONFIG", "load_chat_config");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_chat_config", uniqueUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const configData = Array.isArray(data) ? data.find(item => item.chat_config) : data;
    const config = configData ? (configData.chat_config || configData) : null;

    if (config) {
      cache.set(uniqueUrl, { data: config, timestamp: Date.now() });
    }
    
    return config;
  } catch (error) {
    console.error("💥 Failed to load chat config from webhook:", error);
    return null;
  }
}
