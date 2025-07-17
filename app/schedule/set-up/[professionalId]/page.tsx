"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ProfessionalSetupPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  return (
    <div className="container py-12">
      {isSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2 header-font">Submission Successful</h2>
          <p className="text-green-700 body-font">
            Your submission has been successfully submitted with your professional account.
          </p>
        </div>
      ) : (
        <div>
          <p>Setup Page</p>
        </div>
      )}
    </div>
  )
}
