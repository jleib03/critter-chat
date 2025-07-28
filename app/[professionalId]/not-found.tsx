import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 header-font">Professional Not Found</h2>
          <p className="text-gray-600 mb-6 body-font">
            We couldn't find the professional you're looking for. They may have moved or the link might be incorrect.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#E75837] text-white px-6 py-3 rounded-lg hover:bg-[#d04e30] transition-colors body-font w-full justify-center"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/findprofessional"
              className="inline-flex items-center gap-2 bg-white text-[#E75837] border-2 border-[#E75837] px-6 py-3 rounded-lg hover:bg-[#E75837] hover:text-white transition-colors body-font w-full justify-center"
            >
              <Search className="w-4 h-4" />
              Find a Professional
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
