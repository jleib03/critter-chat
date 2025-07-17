"use client"
import { useState, useEffect } from "react"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { LandingPageComponent } from "@/components/landing-page"
import { LiveChatWidget } from "@/components/live-chat-widget"
import { loadProfessionalLandingData } from "@/utils/professional-landing-config"
import { loadChatConfig } from "@/utils/chat-config"
import type { ChatAgentConfig } from "../../types/chat-config"
import type { ProfessionalLandingData } from "../../utils/professional-landing-config"

interface ProfessionalPageProps {
  params: {
    uniqueUrl: string
  }
}

export default function ProfessionalPageClient({ params }: ProfessionalPageProps) {
  const { uniqueUrl } = params

  console.log("🔍 Loading data for unique URL:", uniqueUrl)

  const [professionalData, setProfessionalData] = useState<ProfessionalLandingData | null>(null)
  const [chatConfig, setChatConfig] = useState<ChatAgentConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load professional data and chat config in parallel
        const [professionalDataResult, chatConfigResult] = await Promise.all([
          loadProfessionalLandingData(uniqueUrl),
          loadChatConfig(uniqueUrl),
        ])

        if (!professionalDataResult) {
          console.error("❌ No professional data found for unique URL:", uniqueUrl)
          notFound()
          return
        }

        setProfessionalData(professionalDataResult)
        setChatConfig(chatConfigResult)
        console.log("✅ Professional data loaded successfully")
        console.log("💬 Chat config:", chatConfigResult ? "loaded" : "not available")
      } catch (error) {
        console.error("💥 Error loading professional page:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [uniqueUrl])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!professionalData) {
    return <div>Error loading data.</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <LandingPageComponent professionalData={professionalData} uniqueUrl={uniqueUrl} />
      </Suspense>
      {chatConfig && <LiveChatWidget config={chatConfig} />}
    </div>
  )
}
