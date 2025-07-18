"use client"
import { useState } from "react"
import { Loader2, Copy, Check, Settings, MessageSquare, Calendar, ArrowRight, Eye, Globe, LinkIcon } from "lucide-react"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfessionalSetupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [professionalId, setProfessionalId] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleUniqueUrl, setScheduleUniqueUrl] = useState("")
  const [scheduleError, setScheduleError] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewUniqueUrl, setPreviewUniqueUrl] = useState("")
  const [previewError, setPreviewError] = useState("")

  // Custom URL states
  const [customUrl, setCustomUrl] = useState("")
  const [isCreatingUrl, setIsCreatingUrl] = useState(false)
  const [urlError, setUrlError] = useState("")
  const [urlSuccess, setUrlSuccess] = useState("")
  const [createdCustomUrl, setCreatedCustomUrl] = useState("")

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4"
  const CUSTOM_URL_WEBHOOK = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"
  const router = useRouter()

  // If not authenticated, show password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onAuthenticated={() => setIsAuthenticated(true)}
        title="Critter Professional Access"
        description="Enter your professional password to access setup tools and resources."
      />
    )
  }

  const handleSetupClick = () => {
    setShowModal(true)
    setError("")
    setBusinessName("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setError("")
    setBusinessName("")
    setIsSubmitting(false)
  }

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setError("Please enter your business name")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        action: "get-url",
        businessName: businessName.trim(),
        timestamp: new Date().toISOString(),
        source: "professional_setup_page",
      }

      console.log("Sending request to get professional ID:", payload)

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response:", data)

      // Handle the response format: [{"id":"151"}]
      let professionalId = null

      if (Array.isArray(data) && data.length > 0 && data[0].id) {
        professionalId = data[0].id
      } else if (data.professionalId) {
        professionalId = data.professionalId
      } else if (data.id) {
        professionalId = data.id
      }

      if (professionalId) {
        setProfessionalId(professionalId)
        setShowModal(false)
        setShowResults(true)
      } else {
        setError("Business not found. Please check the spelling and try again.")
      }
    } catch (error) {
      console.error("Error getting professional ID:", error)
      setError("There was an error processing your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCustomUrl = async () => {
    if (!customUrl.trim()) {
      setUrlError("Please enter a custom URL")
      return
    }

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-_]+$/
    if (!urlPattern.test(customUrl.trim())) {
      setUrlError("URL can only contain letters, numbers, hyphens, and underscores")
      return
    }

    setIsCreatingUrl(true)
    setUrlError("")
    setUrlSuccess("")

    try {
      const payload = {
        action: "create-url",
        professionalId: professionalId,
        customUrl: customUrl.trim(),
        timestamp: new Date().toISOString(),
        source: "professional_setup_page",
      }

      console.log("Sending request to create custom URL:", payload)

      const response = await fetch(CUSTOM_URL_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response:", data)

      // Handle the new response format: [{"status":"success","message":"URL created successfully","url_id":5,"professional_id":"152","unique_url":"sully","date_modified":"2025-07-18T22:09:00.742Z"}]
      let isSuccess = false
      let responseMessage = ""
      let createdUrl = ""

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        if (firstItem.status === "success") {
          isSuccess = true
          responseMessage = firstItem.message || "URL created successfully"
          createdUrl = firstItem.unique_url || customUrl.trim()
        } else {
          responseMessage = firstItem.message || "Failed to create custom URL"
        }
      } else if (data.success) {
        // Fallback for old response format
        isSuccess = true
        responseMessage = data.message || "URL created successfully"
        createdUrl = customUrl.trim()
      } else {
        responseMessage = data.message || "Failed to create custom URL"
      }

      if (isSuccess) {
        setCreatedCustomUrl(createdUrl)
        setUrlSuccess(
          `Custom URL created successfully! Your page is now available at: booking.critter.pet/${createdUrl}`,
        )
        setCustomUrl("")
      } else {
        setUrlError(responseMessage || "Failed to create custom URL. It may already be taken.")
      }
    } catch (error) {
      console.error("Error creating custom URL:", error)
      setUrlError("There was an error creating your custom URL. Please try again.")
    } finally {
      setIsCreatingUrl(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const landingUrl = `https://booking.critter.pet/${professionalId}`

  const handleScheduleSetupClick = () => {
    setShowScheduleModal(true)
    setScheduleError("")
    setScheduleUniqueUrl("")
  }

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false)
    setScheduleError("")
    setScheduleUniqueUrl("")
  }

  const handleScheduleSubmit = () => {
    if (!scheduleUniqueUrl.trim()) {
      setScheduleError("Please enter your unique URL")
      return
    }

    // Navigate directly to schedule setup page using unique URL
    router.push(`/schedule/set-up/${scheduleUniqueUrl.trim()}`)
  }

  const handlePreviewClick = () => {
    setShowPreviewModal(true)
    setPreviewError("")
    setPreviewUniqueUrl("")
  }

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false)
    setPreviewError("")
    setPreviewUniqueUrl("")
  }

  const handlePreviewSubmit = () => {
    if (!previewUniqueUrl.trim()) {
      setPreviewError("Please enter your unique URL")
      return
    }

    // Navigate directly to the professional landing page using unique URL
    window.open(`https://booking.critter.pet/${previewUniqueUrl.trim()}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-4 flex flex-col page-content">
          {!showResults ? (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl title-font mb-4">Professional Setup</h1>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto body-font">
                  Tools and resources to enhance your Critter professional experience
                </p>
                {/* Add this new callout */}
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="bg-[#E75837]/10 border border-[#E75837]/30 rounded-lg p-4">
                    <p className="text-[#E75837] body-font text-center">
                      <strong>First time here?</strong> Check out our{" "}
                      <a href="/pro/how-to-use" className="text-[#E75837] hover:text-[#d04e30] underline font-medium">
                        step-by-step help guide
                      </a>{" "}
                      to walk you through setting up all your professional tools.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Tiles Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Critter Landing Page Setup Tile - Clickable */}
                <div
                  onClick={handleSetupClick}
                  className="bg-white rounded-xl shadow-md p-6 text-center transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-[#E75837]/20"
                >
                  <div className="w-12 h-12 bg-[#fff8f6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-[#E75837]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 header-font">Critter Landing Page Set-Up</h3>
                  <p className="text-gray-600 body-font mb-4">
                    Generate a custom link for your Critter landing page to share with customers and showcase your
                    services.
                  </p>
                  <span className="inline-flex items-center text-[#E75837] text-sm font-medium">
                    Set up now <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>

                {/* Custom Support Agent Tile - Coming Soon */}
                <div
                  onClick={() => router.push("/pro/custom-agent")}
                  className="bg-white rounded-xl shadow-md p-6 text-center transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-[#94ABD6]/20"
                >
                  <div className="w-12 h-12 bg-[#f5f8fd] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-[#94ABD6]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 header-font">Custom Support Agent</h3>
                  <p className="text-gray-600 body-font mb-4">
                    Create a personalized AI support agent trained on your business policies and FAQs.
                  </p>
                  <span className="inline-flex items-center text-[#94ABD6] text-sm font-medium">
                    Set up now <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>

                {/* Schedule Setup Tile - Replaces Under Construction */}
                <div
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-white rounded-xl shadow-md p-6 text-center transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-[#745E25]/20"
                >
                  <div className="w-12 h-12 bg-[#f9f7f2] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-[#745E25]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 header-font">Schedule Setup</h3>
                  <p className="text-gray-600 body-font mb-4">
                    Configure your team, working hours, capacity rules, and blocked time for appointment scheduling.
                  </p>
                  <span className="inline-flex items-center text-[#745E25] text-sm font-medium">
                    Set up now <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>

              {/* Preview Landing Page Button */}
              <div className="text-center mb-12">
                <button
                  onClick={handlePreviewClick}
                  className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md body-font font-medium"
                >
                  <Eye className="h-5 w-5 mr-3 text-gray-600" />
                  Preview Landing Page
                </button>
                <p className="text-sm text-gray-500 mt-3 body-font">
                  See how your professional landing page looks to customers
                </p>
              </div>
            </>
          ) : (
            /* Results Section */
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E75837] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl title-font mb-4">Set Up Your Landing Page</h1>
                <p className="text-xl text-gray-700 body-font">
                  Your Professional ID has been found. Now create your custom landing page URL.
                </p>
              </div>

              {/* Professional ID */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 header-font">Your Professional ID</h2>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-lg font-mono text-[#E75837]">{professionalId}</code>
                  <button
                    onClick={() => copyToClipboard(professionalId, "professionalId")}
                    className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    {copiedStates.professionalId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 body-font">
                  This is your unique identifier that connects customers to your Critter account.
                </p>
              </div>

              {/* Custom URL Creation Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 header-font flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Create Custom URL
                </h2>
                <p className="text-gray-600 mb-4 body-font">
                  Create a personalized URL for your landing page that's easier to remember and share.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customUrl" className="body-font">
                      Custom URL *
                    </Label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 body-font mr-2">booking.critter.pet/</span>
                      <Input
                        id="customUrl"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="your-business-name"
                        className="flex-1"
                        disabled={isCreatingUrl}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 body-font">
                      Use letters, numbers, hyphens, and underscores only. Example: "sally-grooming" or "best_pet_care"
                    </p>
                  </div>

                  {urlError && <div className="text-sm text-red-600 body-font">{urlError}</div>}

                  {urlSuccess && (
                    <>
                      <div className="text-sm text-green-600 body-font">{urlSuccess}</div>

                      {/* Show the landing page link after successful custom URL creation */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-bold mb-2 text-green-800 header-font">
                          Your Landing Page is Ready!
                        </h3>
                        <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <code className="text-sm font-mono text-[#E75837] break-all">
                            https://booking.critter.pet/{createdCustomUrl}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(`https://booking.critter.pet/${createdCustomUrl}`, "customLandingUrl")
                            }
                            className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors ml-2"
                          >
                            {copiedStates.customLandingUrl ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-green-700 mt-2 body-font">
                          Share this link with customers to showcase your services and accept bookings.
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleCreateCustomUrl}
                    disabled={isCreatingUrl || !customUrl.trim()}
                    className="w-full bg-[#E75837] text-white px-4 py-3 rounded-lg hover:bg-[#d04e30] transition-colors body-font flex items-center justify-center disabled:opacity-50"
                  >
                    {isCreatingUrl ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating URL...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Create Custom URL
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setProfessionalId("")
                    setCopiedStates({})
                    setCustomUrl("")
                    setUrlError("")
                    setUrlSuccess("")
                    setCreatedCustomUrl("")
                  }}
                  className="text-gray-600 hover:text-gray-800 underline body-font"
                >
                  Set up for a different business
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Landing Page Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 header-font">Enter Your Business Name</h3>
            <p className="text-gray-600 mb-4 body-font">
              Please enter your business name exactly as it appears in your Critter professional account.
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] body-font"
                disabled={isSubmitting}
              />
              {error && <p className="mt-2 text-sm text-red-600 body-font">{error}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !businessName.trim()}
                className="px-6 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Link...
                  </>
                ) : (
                  "Get My Link"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Setup Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 header-font">Schedule Setup</h3>
            <p className="text-gray-600 mb-4 body-font">
              Enter your unique URL to access your schedule configuration. This will set up your team, working hours,
              and booking capacity.
            </p>

            <div className="mb-4">
              <Label htmlFor="scheduleUniqueUrl" className="body-font">
                Unique URL *
              </Label>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500 body-font mr-2">booking.critter.pet/</span>
                <Input
                  id="scheduleUniqueUrl"
                  value={scheduleUniqueUrl}
                  onChange={(e) => setScheduleUniqueUrl(e.target.value)}
                  placeholder="sally-grooming"
                  className="flex-1"
                />
              </div>
              {scheduleError && <p className="mt-2 text-sm text-red-600 body-font">{scheduleError}</p>}
              <p className="text-xs text-gray-500 mt-2 body-font">
                Enter your custom URL that you created above, or your professional ID if you haven't created a custom
                URL yet.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseScheduleModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                disabled={!scheduleUniqueUrl.trim()}
                className="px-6 py-2 bg-[#745E25] text-white rounded-lg hover:bg-[#5d4a1e] transition-colors body-font flex items-center disabled:opacity-50"
              >
                Access Schedule Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Landing Page Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 header-font">Preview Landing Page</h3>
            <p className="text-gray-600 mb-4 body-font">
              Enter your unique URL to preview how your landing page appears to customers.
            </p>

            <div className="mb-4">
              <Label htmlFor="previewUniqueUrl" className="body-font">
                Unique URL *
              </Label>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500 body-font mr-2">booking.critter.pet/</span>
                <Input
                  id="previewUniqueUrl"
                  value={previewUniqueUrl}
                  onChange={(e) => setPreviewUniqueUrl(e.target.value)}
                  placeholder="sally-grooming"
                  className="flex-1"
                />
              </div>
              {previewError && <p className="mt-2 text-sm text-red-600 body-font">{previewError}</p>}
              <p className="text-xs text-gray-500 mt-2 body-font">
                Enter just the URL portion after the slash (e.g., "sally-grooming" or "151")
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClosePreviewModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
              >
                Cancel
              </button>
              <button
                onClick={handlePreviewSubmit}
                disabled={!previewUniqueUrl.trim()}
                className="px-6 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font flex items-center disabled:opacity-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
