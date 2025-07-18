"use client"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import LandingPage from "../../components/landing-page"
import LiveChatWidget from "../../components/live-chat-widget"
import { loadProfessionalLandingData } from "../../utils/professional-landing-config"
import { loadChatConfig } from "../../utils/chat-config"

interface PageProps {
  params: Promise<{ uniqueUrl: string }>
}

export default async function ProfessionalLandingPage({ params }: PageProps) {
  const { uniqueUrl } = await params

  console.log(`🔍 Loading data for unique URL: ${uniqueUrl}`)

  // Load professional data and chat config in parallel
  const [professionalData, chatConfig] = await Promise.all([
    loadProfessionalLandingData(uniqueUrl),
    loadChatConfig(uniqueUrl),
  ])

  if (!professionalData) {
    console.log(`❌ No professional data found for URL: ${uniqueUrl}`)
    notFound()
  }

  console.log(`✅ Professional data loaded for: ${professionalData.name}`)
  console.log(`💬 Chat config loaded:`, chatConfig ? "Yes" : "No")

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Suspense fallback={<div>Loading...</div>}>
        <LandingPage data={professionalData} />
      </Suspense>

      {/* Live Chat Widget */}
      <LiveChatWidget
        uniqueUrl={uniqueUrl}
        professionalId={professionalData.professional_id}
        professionalName={professionalData.name}
        chatConfig={
          chatConfig || {
            professional_id: professionalData.professional_id,
            chat_name: "Critter Support",
            chat_welcome_message: "Hello! I'm your Critter professional's virtual assistant. How can I help you today?",
            widget_primary_color: "#94ABD6",
            widget_position: "bottom-right",
            widget_size: "medium",
          }
        }
        isConfigLoading={false}
      />
    </div>
  )
}
