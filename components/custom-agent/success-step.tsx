"use client"
import { useRouter } from "next/navigation"
import { CheckCircle2, Home } from "lucide-react"

type SuccessStepProps = {
  professionalName: string
}

export default function SuccessStep({ professionalName }: SuccessStepProps) {
  const router = useRouter()

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-[#94ABD6] mb-4 header-font">Setup Complete!</h2>
      <p className="text-xl text-gray-700 mb-6 body-font">
        Congratulations, {professionalName}! Your custom support agent is now ready to assist your customers.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-medium text-blue-800 mb-3 header-font">What's Next?</h3>
        <ul className="space-y-3 text-blue-700 body-font">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">1.</span>
            <span>
              <strong className="header-font">Implement the code</strong> on your website using the instructions
              provided in the previous step.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">2.</span>
            <span>
              <strong className="header-font">Test your agent</strong> on your website to ensure it's working correctly.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">3.</span>
            <span>
              <strong className="header-font">Monitor performance</strong> and make adjustments to your agent's
              configuration as needed.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">4.</span>
            <span>
              <strong className="header-font">Return to this page</strong> anytime to update your agent's configuration
              or test new responses.
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => router.push("/")}
        className="flex items-center px-6 py-3 bg-[#94ABD6] text-white rounded-lg hover:bg-[#7a90ba] transition-colors mx-auto body-font"
      >
        <Home className="mr-2 h-5 w-5" />
        Return to Home
      </button>
    </div>
  )
}
