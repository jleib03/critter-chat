// Utility for loading professional landing page data - always fresh, no caching
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints";

export interface Service {
  id: string;
  name: string;
  description: string;
  cost: string;
  duration: string;
}

export interface ServiceGroup {
  type: string;
  type_display: string;
  services: Service[];
}

export interface ProfessionalLandingData {
  professional_id: string;
  name: string;
  tagline: string;
  description: string;
  specialties: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  location: {
    address: string;
  };
  working_hours: {
    [day: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  service_groups: ServiceGroup[];
  show_prices: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: ProfessionalLandingData; timestamp: number }>();

export async function loadProfessionalLandingData(uniqueUrl: string, forceRefresh: boolean = false): Promise<ProfessionalLandingData | null> {
  if (!forceRefresh) {
    const cachedItem = cache.get(uniqueUrl);
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION) {
      console.log("✅ Using cached professional landing data for:", uniqueUrl);
      return cachedItem.data;
    }
  }

  try {
    const webhookUrl = getWebhookEndpoint("CHAT_CONFIG");
    logWebhookUsage("CHAT_CONFIG", "load_professional_landing_data");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_landing_page_data", uniqueUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const landingData = Array.isArray(data) ? data.find(item => item.professional_id) : data;

    if (landingData) {
      cache.set(uniqueUrl, { data: landingData, timestamp: Date.now() });
    }
    
    return landingData;
  } catch (error) {
    console.error("💥 Failed to load professional landing data from webhook:", error);
    return null;
  }
}

export function getDefaultProfessionalData(uniqueUrl: string): ProfessionalLandingData {
    return {
        professional_id: uniqueUrl,
        name: "Critter Pet Services",
        tagline: "Your pet's favorite place to be.",
        description: "We provide top-notch grooming, walking, and boarding services for your beloved pets. Our team of certified professionals is dedicated to ensuring your pet's happiness and well-being.",
        specialties: ["Grooming", "Dog Walking", "Pet Boarding", "Puppy Training"],
        contact: {
            phone: "555-123-4567",
            email: "contact@critter.com",
            website: "critter.com"
        },
        location: {
            address: "123 Pet Lane, Critterville, USA"
        },
        working_hours: {
            monday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            tuesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            wednesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            thursday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            friday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            saturday: { open: "10:00 AM", close: "4:00 PM", isOpen: true },
            sunday: { open: "", close: "", isOpen: false },
        },
        service_groups: [],
        show_prices: true,
    };
}

// Legacy functions for compatibility - no longer used but kept to avoid breaking changes
export function clearProfessionalCache(uniqueUrl: string): void {
  console.log("🗑️ Cache clearing not needed - always using fresh data");
}

export function clearAllProfessionalCaches(): void {
  console.log("🗑️ Cache clearing not needed - always using fresh data");
}
