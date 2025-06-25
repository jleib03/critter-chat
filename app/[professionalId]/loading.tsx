import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
        <p className="text-gray-600 body-font">Loading professional information...</p>
      </div>
    </div>
  )
}
