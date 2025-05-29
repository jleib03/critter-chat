"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Construction,
  Users,
  UserPlus,
  User,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  FileText,
  PenLine,
  X,
} from "lucide-react"

type UserInfo = {
  email: string
  firstName: string
  lastName: string
}

type LandingPageProps = {
  webhookUrl: string
  onExistingCustomer?: (userInfo: UserInfo) => void
  onNewCustomer?: () => void
}

export default function LandingPage({ webhookUrl, onExistingCustomer, onNewCustomer }: LandingPageProps) {
  const router = useRouter()
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [showUserForm, setShowUserForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })
  const [formErrors, setFormErrors] = useState<{
    email?: string
    firstName?: string
    lastName?: string
  }>({})

  // Function to validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Function to handle action card click
  const handleActionCardClick = (action: "existing" | "new" | "find") => {
    if (action === "find") {
      router.push("/findprofessional")
      return
    }

    if (action === "new") {
      // For new customers, go directly to the URL without popup
      if (onNewCustomer) {
        onNewCustomer()
      } else {
        router.push("/newcustomer")
      }
      return
    }

    if (action === "existing") {
      // Only show the form popup for existing customers
      setShowUserForm(true)
    }
  }

  // Function to validate form
  const validateForm = () => {
    const errors: typeof formErrors = {}

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Function to handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Function to handle form submit (only for existing customers)
  const handleFormSubmit = () => {
    if (!validateForm()) {
      return
    }

    const userInfo: UserInfo = {
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    }

    if (onExistingCustomer) {
      onExistingCustomer(userInfo)
    } else {
      router.push("/existing")
    }
  }

  // Function to close the form
  const handleCloseForm = () => {
    setShowUserForm(false)
    setFormData({ email: "", firstName: "", lastName: "" })
    setFormErrors({})
  }

  // Function to handle the notify me submission
  const handleNotifySubmit = async () => {
    // Reset states
    setSubmitStatus("idle")
    setErrorMessage("")

    // Validate email
    if (!notifyEmail) {
      setErrorMessage("Please enter your email address")
      return
    }

    if (!isValidEmail(notifyEmail)) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Create a unique user ID for this submission
      const userId = `web_user_${Math.random().toString(36).substring(2, 10)}`

      // Prepare the payload
      const payload = {
        message: {
          text: "Notification request for professional matching service",
          userId: userId,
          timestamp: new Date().toISOString(),
          userInfo: {
            email: notifyEmail,
            selectedAction: "notify_me",
          },
          source: "critter_booking_site",
        },
      }

      console.log("Sending notification request to webhook:", webhookUrl)
      console.log("Payload:", payload)

      // Send the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle successful response
      console.log("Notification request sent successfully")
      setSubmitStatus("success")
      setNotifyEmail("") // Clear the email field
    } catch (error) {
      console.error("Error sending notification request:", error)
      setSubmitStatus("error")
      setErrorMessage("There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to close the modal and reset states
  const handleCloseModal = () => {
    setShowComingSoon(false)
    setNotifyEmail("")
    setSubmitStatus("idle")
    setErrorMessage("")
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-4xl md:text-5xl title-font">Book pet care with Critter</h1>
        </div>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font">
          Welcome to Critter's online booking portal, an extension of Critter's mobile app designed for fast and simple
          booking.
        </p>
      </div>

      {/* User Information Form Modal - Only for Existing Customers */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 transform transition-all animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold header-font">Welcome back!</h3>
              <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6 body-font">Enter your information to access your bookings and services.</p>

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email address*"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.email}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="First name*"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.firstName && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.firstName}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Last name*"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font ${
                    formErrors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.lastName && <p className="mt-1 text-sm text-red-500 body-font">{formErrors.lastName}</p>}
              </div>

              <button
                onClick={handleFormSubmit}
                className="w-full bg-[#E75837] text-white py-3 px-4 rounded-lg hover:bg-[#d04e30] transition-colors body-font"
              >
                Continue to Booking
              </button>

              <div className="mt-3 text-center">
                <button onClick={handleCloseForm} className="text-sm text-gray-500 hover:text-gray-700 body-font">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Cards - Main Center Section */}
      <div className="mb-16">
        {/* All Actions in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Existing Customer Card */}
          <div
            onClick={() => handleActionCardClick("existing")}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer border border-gray-100 h-full flex flex-col relative group"
          >
            <div className="bg-gradient-to-r from-[#E75837] to-[#f07a5f] h-2 w-full"></div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="w-12 h-12 bg-[#fff8f6] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E75837] group-hover:text-white transition-colors">
                <User className="h-6 w-6 text-[#E75837] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 header-font">I'm an existing customer</h3>
              <p className="text-gray-600 mb-6 flex-grow body-font">
                Already use Critter? Book services, manage appointments, and check invoices.
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <Calendar className="w-4 h-4 mr-1" /> Book or view appointments
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <FileText className="w-4 h-4 mr-1" /> Check invoices
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <PenLine className="w-4 h-4 mr-1" /> Make changes to bookings
                </div>
              </div>
              <div className="flex items-center text-[#E75837] font-medium mt-6 header-font group-hover:text-[#d04e30]">
                Continue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* New Customer Card */}
          <div
            onClick={() => handleActionCardClick("new")}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer border border-gray-100 h-full flex flex-col relative group"
          >
            <div className="bg-gradient-to-r from-[#745E25] to-[#8b7030] h-2 w-full"></div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="w-12 h-12 bg-[#f9f7f2] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#745E25] group-hover:text-white transition-colors">
                <UserPlus className="h-6 w-6 text-[#745E25] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 header-font">I'm a new customer</h3>
              <p className="text-gray-600 mb-6 flex-grow body-font">
                Know your Critter professional? Get the onboarding and booking request process started.
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <UserPlus className="w-4 h-4 mr-1" /> Complete quick onboarding
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <FileText className="w-4 h-4 mr-1" /> Provide detailed information to improve the ability to find
                  services to fit your needs
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <Calendar className="w-4 h-4 mr-1" /> Book your first appointment
                </div>
              </div>
              <div className="flex items-center text-[#745E25] font-medium mt-6 header-font group-hover:text-[#5d4b1e]">
                Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Find Professional Card */}
          <div
            onClick={() => handleActionCardClick("find")}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-lg cursor-pointer border border-gray-100 h-full flex flex-col relative group"
          >
            <div className="bg-gradient-to-r from-[#94ABD6] to-[#b0c1e3] h-2 w-full"></div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="w-12 h-12 bg-[#f5f8fd] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#94ABD6] group-hover:text-white transition-colors">
                <Users className="h-6 w-6 text-[#94ABD6] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 header-font">I need to find a professional</h3>
              <p className="text-gray-600 mb-6 flex-grow body-font">
                Looking for pet care services? We'll help you find the perfect match in your area.
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <Users className="w-4 h-4 mr-1" /> Browse professionals
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <Check className="w-4 h-4 mr-1" /> View profiles & reviews
                </div>
                <div className="flex items-center text-gray-500 text-sm body-font">
                  <Calendar className="w-4 h-4 mr-1" /> Check availability
                </div>
              </div>
              <div className="flex items-center text-[#94ABD6] font-medium mt-6 header-font group-hover:text-[#7a90ba]">
                Find a professional{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Store Links */}
      <div className="text-center">
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

      {/* Coming Soon Modal - Keep this for users who click from the landing page */}
      {showComingSoon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
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

            {submitStatus === "success" ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                <p className="body-font">Thank you! We'll notify you when this feature launches.</p>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="body-font">{errorMessage}</p>
                  </div>
                )}
                <div className="flex mb-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                  />
                  <button
                    onClick={handleNotifySubmit}
                    disabled={isSubmitting}
                    className="bg-[#94ABD6] text-white px-4 py-3 rounded-r-lg hover:bg-[#7a90ba] transition-colors flex items-center justify-center min-w-[100px]"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Notify Me"}
                  </button>
                </div>
              </>
            )}
            <button
              onClick={handleCloseModal}
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
