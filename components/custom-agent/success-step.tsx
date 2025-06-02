"use client"
import { Home, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

type SuccessStepProps = {
  professionalName: string
}

export default function SuccessStep({ professionalName }: SuccessStepProps) {
  const router = useRouter()

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4 header-font">Setup Complete!</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto body-font">
        Congratulations, {professionalName}! Your custom support agent is now ready to assist your customers.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
        <h3 className="text-lg font-medium text-blue-800 mb-4 header-font">Next Steps</h3>
        <ul className="list-disc pl-5 text-left text-blue-700 space-y-2 body-font">
          <li>Add the chat widget to your website using the code provided</li>
          <li>Test the widget on your live website to ensure it's working correctly</li>
          <li>Update your agent's knowledge as your business policies change</li>
          <li>Monitor customer interactions to improve your agent's responses</li>
        </ul>
      </div>

      <button
        onClick={() => router.push("/")}
        className="flex items-center px-6 py-3 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors mx-auto body-font"
      >
        <Home className="mr-2 h-5 w-5" />
        Return to Home
      </button>
    </div>
  )
}
