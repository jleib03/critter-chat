"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Construction, Users, UserPlus, User } from "lucide-react"

type LandingPageProps = {
  onExistingCustomer: () => void
  onNewCustomer: () => void
}

export default function LandingPage({ onExistingCustomer, onNewCustomer }: LandingPageProps) {
  const [showComingSoon, setShowComingSoon] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl title-font mb-6">Book pet care with Critter</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font">
          Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and simple
          booking. If your pet services provider uses Critter, you can use this site to request bookings and answer
          questions about upcoming care and invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Option 1: Existing Customer */}
        <div
          onClick={onExistingCustomer}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer border border-gray-100"
        >
          <div className="bg-[#E75837] h-2 w-full"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-[#fff8f6] rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-[#E75837]" />
            </div>
            <h3 className="text-xl font-bold mb-3 header-font">Existing Customer</h3>
            <p className="text-gray-600 mb-4 body-font">
              Already use Critter? Book services, manage appointments, and check invoices.
            </p>
            <button className="flex items-center text-[#E75837] font-medium header-font">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Option 2: New Customer with Professional */}
        <div
          onClick={onNewCustomer}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer border border-gray-100"
        >
          <div className="bg-[#745E25] h-2 w-full"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-[#f9f7f2] rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-[#745E25]" />
            </div>
            <h3 className="text-xl font-bold mb-3 header-font">New Customer</h3>
            <p className="text-gray-600 mb-4 body-font">
              Know your Critter professional? Get the onboarding and booking request process started.
            </p>
            <button className="flex items-center text-[#745E25] font-medium header-font">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Option 3: Looking for Professional (Coming Soon) */}
        <div
          onClick={() => setShowComingSoon(true)}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer border border-gray-100"
        >
          <div className="bg-[#94ABD6] h-2 w-full"></div>
          <div className="p-6">
            <div className="w-12 h-12 bg-[#f5f8fd] rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-[#94ABD6]" />
            </div>
            <h3 className="text-xl font-bold mb-3 header-font">Find a Professional</h3>
            <p className="text-gray-600 mb-4 body-font">
              Looking for pet care services? We'll help you find the perfect match.
            </p>
            <button className="flex items-center text-[#94ABD6] font-medium header-font">
              Explore <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* App Store Links */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-6 header-font">Get the Critter App</h2>
        <div className="flex justify-center space-x-4">
          <Link
            href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
          >
            <div className="mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.0754 12.3674C17.0654 10.4494 18.0434 9.0384 19.9794 8.0774C18.9154 6.5514 17.2734 5.7254 15.1904 5.6294C13.2274 5.5354 11.1044 6.8354 10.3174 6.8354C9.5004 6.8354 7.6364 5.6854 6.1454 5.6854C3.4024 5.7354 0.599365 7.7834 0.599365 11.9574C0.599365 13.3154 0.860365 14.7154 1.3824 16.1574C2.0824 18.0894 4.3584 22.2074 6.7364 22.1334C8.0514 22.1034 8.9784 21.1914 10.6604 21.1914C12.2974 21.1914 13.1544 22.1334 14.6094 22.1334C16.9994 22.0934 19.0384 18.3594 19.6984 16.4214C16.4334 14.8814 17.0754 12.4414 17.0754 12.3674ZM14.0884 3.7974C15.6854 1.9254 15.5174 0.2374 15.4734 0.0374C14.1044 0.1054 12.5074 1.0174 11.6504 2.0374C10.7034 3.1374 10.1834 4.4374 10.3174 5.6054C11.8084 5.7054 13.1784 4.8374 14.0884 3.7974Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs">Download on the</div>
              <div className="text-xl font-semibold">App Store</div>
            </div>
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
          >
            <div className="mr-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.60938 2.60156C3.22656 3.01562 3 3.64844 3 4.46875V19.5312C3 20.3516 3.22656 20.9844 3.60938 21.3984L3.72656 21.5156L13.3594 11.8828V11.5L3.72656 1.48438L3.60938 2.60156Z"
                  fill="#00F076"
                />
                <path
                  d="M17.0625 15.5859L13.3594 11.8828V11.5L17.0625 7.79688L17.2031 7.88281L21.6094 10.4062C22.7969 11.0625 22.7969 12.0234 21.6094 12.6797L17.2031 15.5L17.0625 15.5859Z"
                  fill="#FFCF47"
                />
                <path
                  d="M17.2031 15.5L13.3594 11.6562L3.60938 21.3984C4.03125 21.8438 4.73438 21.8906 5.53125 21.4453L17.2031 15.5Z"
                  fill="#FF554A"
                />
                <path
                  d="M17.2031 7.88281L5.53125 1.9375C4.73438 1.49219 4.03125 1.53906 3.60938 1.98438L13.3594 11.6562L17.2031 7.88281Z"
                  fill="#00AAF0"
                />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs">GET IT ON</div>
              <div className="text-xl font-semibold">Google Play</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowComingSoon(false)}
        >
          <div className="bg-white p-8 rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#f5f8fd] rounded-full flex items-center justify-center">
                <Construction className="h-8 w-8 text-[#94ABD6]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 header-font">Coming Soon!</h3>
            <p className="text-gray-600 text-center mb-6 body-font">
              We're working hard to bring you a professional matching service. Sign up for our newsletter to be the
              first to know when it launches.
            </p>
            <div className="flex mb-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              />
              <button className="bg-[#94ABD6] text-white px-4 py-3 rounded-r-lg hover:bg-[#7a90ba] transition-colors">
                Notify Me
              </button>
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full text-gray-600 text-sm hover:text-gray-800 transition-colors body-font"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
