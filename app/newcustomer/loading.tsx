import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-[#745E25] rounded-xl flex items-center justify-center mx-auto">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 header-font">Loading...</h2>
          <p className="text-gray-600 body-font">Setting up your new customer experience</p>
        </div>
      </div>
    </div>
  )
}
