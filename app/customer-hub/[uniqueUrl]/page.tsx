"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CustomerHub({ params }: { params: { uniqueUrl: string } }) {
  const router = useRouter()
  const uniqueUrl = params.uniqueUrl as string

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4 header-font">Customer Hub Coming Soon</h1>

        <p className="text-gray-600 mb-8 body-font leading-relaxed">
          We're working hard to bring you an amazing customer portal experience. In the meantime, please contact your
          professional directly for any questions or updates.
        </p>

        <div className="space-y-3">
          <Link
            href={`/${uniqueUrl}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#E75837] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d04e30] transition-colors body-font"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Professional Page
          </Link>

          <Link
            href={`/schedule/${uniqueUrl}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#E75837] border-2 border-[#E75837] px-6 py-3 rounded-lg font-medium hover:bg-[#E75837] hover:text-white transition-colors body-font"
          >
            Schedule Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
