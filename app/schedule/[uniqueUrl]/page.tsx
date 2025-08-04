"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { Loader2, Calendar, Pencil, XCircle, CalendarCheck, FileText, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// This interface is kept for data fetching consistency, though not all fields are used in this UI
interface ProfessionalData {
  id: string
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  services: string[]
  bio: string
  profile_image_url?: string
  business_hours?: {
    [key: string]: { open: string; close: string; isOpen: boolean }
  }
}

interface ActionCardProps {
  icon: ReactNode
  title: string
  description: string
}

const ActionCard = ({ icon, title, description }: ActionCardProps) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 hover:border-[#E75837]">
    <CardContent className="p-4 flex items-start space-x-4">
      {icon}
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
)

export default function ScheduleSelectionPage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string

  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const fetchProfessionalData = async () => {
      if (!uniqueUrl) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          "https://jleib03.app.n8n.cloud/webhook-test/4ae0fb3d-17dc-482f-be27-1c7ab5c31b16",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "initialize_schedule",
              uniqueUrl: uniqueUrl,
              timestamp: new Date().toISOString(),
              user_timezone: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Professional data response:", data)

        if (Array.isArray(data) && data.length > 0) {
          setProfessionalData(data[0])
        } else if (data && typeof data === "object" && !Array.isArray(data)) {
          setProfessionalData(data)
        } else {
          throw new Error("Professional not found or invalid data format")
        }
      } catch (err) {
        console.error("Error fetching professional data:", err)
        setError("Unable to load professional information. Please check the URL and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionalData()
  }, [uniqueUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E75837] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Information</h2>
          <p className="text-gray-600">Please wait while we fetch the details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Page</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#E75837] text-white px-4 py-2 rounded-lg hover:bg-[#d04e30] transition-colors"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex justify-center items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white/50 shadow-2xl rounded-xl overflow-hidden">
        <aside className="lg:col-span-1 bg-white">
          <div className="bg-[#E75837] p-4 sm:p-6">
            <h2 className="text-xl font-bold text-white">Your Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                Name
              </label>
              <Input id="name" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>
              <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2 bg-white flex flex-col">
          <div className="bg-[#E75837] p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-white">What can Critter do for you?</h1>
          </div>
          <div className="p-6 flex-grow">
            <p className="text-gray-600 mb-4">
              Let's get you started! First thing's first, share some details to the left so can match you to the right
              businesses on Critter.
            </p>
            <p className="text-gray-800 font-semibold mb-6">What would you like to do today? Select an option:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <ActionCard
                icon={<Calendar className="w-6 h-6 text-[#E75837]" />}
                title="Request a new booking"
                description="Schedule a new service with your professional"
              />
              <ActionCard
                icon={<Pencil className="w-6 h-6 text-[#E75837]" />}
                title="Change existing booking"
                description="Modify date, time, or details of a booking"
              />
              <ActionCard
                icon={<XCircle className="w-6 h-6 text-[#E75837]" />}
                title="Cancel a booking"
                description="Cancel an upcoming appointment"
              />
              <ActionCard
                icon={<CalendarCheck className="w-6 h-6 text-[#E75837]" />}
                title="See upcoming bookings"
                description="View all your scheduled appointments"
              />
              <ActionCard
                icon={<FileText className="w-6 h-6 text-[#E75837]" />}
                title="Review open invoices"
                description="Check any outstanding payments"
              />
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
            <div className="relative">
              <Input type="text" placeholder="Type your message here..." className="pr-16 bg-white" />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-auto px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Send
                <Send className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
