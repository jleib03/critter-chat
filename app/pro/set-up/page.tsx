"use client"
import { useState } from "react"
import { Loader2, Copy, Check, Settings, Users, MessageSquare, Construction, ArrowRight } from "lucide-react"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"

export default function ProfessionalSetupPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [professionalId, setProfessionalId] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4"
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

  const intakeUrl = `https://booking.critter.pet/newcustomer/${professionalId}`

  const buttonHtml = `<a href="${intakeUrl}" target="_blank" style="display: inline-block; background-color: #E75837; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Start Your Critter Intake</a>`

  const buttonCode = `<!-- Critter Customer Intake Button -->
${buttonHtml}`

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
              </div>

              {/* Feature Tiles Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Customer Intake Tile - Clickable */}
                <div
                  onClick={handleSetupClick}
                  className="bg-white rounded-xl shadow-md p-6 text-center transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border border-transparent hover:border-[#E75837]/20"
                >
                  <div className="w-12 h-12 bg-[#fff8f6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-[#E75837]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 header-font">Customer Intake</h3>
                  <p className="text-gray-600 body-font mb-4">
                    Generate a custom intake link and button for your website to streamline new customer onboarding.
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

                {/* Under Construction Tile */}
                <div className="bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      In Development
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-[#f9f7f2] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Construction className="h-6 w-6 text-[#745E25]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 header-font">New Feature</h3>
                  <p className="text-gray-600 body-font mb-4">
                    We're working on something exciting to help you manage your business more effectively.
                  </p>
                  <span className="inline-flex items-center text-gray-400 text-sm font-medium">Stay tuned</span>
                </div>
              </div>
            </>
          ) : (
            /* Results Section */
            <div className="space-y-8">
              {/* Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-4xl title-font mb-4">Setup Complete!</h1>
                <p className="text-xl text-gray-700 body-font">
                  Your custom customer intake link is ready. Follow the instructions below to add it to your website.
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

              {/* Direct Link */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 header-font">Your Customer Intake Link</h2>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between mb-4">
                  <code className="text-sm font-mono text-[#E75837] break-all">{intakeUrl}</code>
                  <button
                    onClick={() => copyToClipboard(intakeUrl, "intakeUrl")}
                    className="flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors ml-2"
                  >
                    {copiedStates.intakeUrl ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 body-font">
                  Share this link directly with customers or use the button code below to embed it on your website.
                </p>
              </div>

              {/* Button Preview */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 header-font">Button Preview</h2>
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-4">
                  <div dangerouslySetInnerHTML={{ __html: buttonHtml }} />
                </div>
                <p className="text-sm text-gray-600 body-font">
                  This is how the button will appear on your website. You can customize the styling to match your brand.
                </p>
              </div>

              {/* Button Code */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 header-font">Button Code</h2>
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{buttonCode}</code>
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(buttonCode, "buttonCode")}
                  className="flex items-center px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors"
                >
                  {copiedStates.buttonCode ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Button Code
                    </>
                  )}
                </button>
              </div>

              {/* Platform Instructions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-6 header-font">Platform-Specific Instructions</h2>

                <div className="space-y-6">
                  {/* Squarespace */}
                  <div className="border-l-4 border-[#E75837] pl-4">
                    <h3 className="text-lg font-bold mb-2 header-font">Squarespace</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm body-font">
                      <li>Go to your Squarespace editor</li>
                      <li>Add a "Code Block" where you want the button</li>
                      <li>Paste the button code above into the code block</li>
                      <li>Save and publish your changes</li>
                    </ol>
                  </div>

                  {/* Wix */}
                  <div className="border-l-4 border-[#745E25] pl-4">
                    <h3 className="text-lg font-bold mb-2 header-font">Wix</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm body-font">
                      <li>Open your Wix editor</li>
                      <li>Click the "+" button to add an element</li>
                      <li>Select "Embed Code" → "HTML iframe"</li>
                      <li>Paste the button code and click "Apply"</li>
                      <li>Position the button where you want it and publish</li>
                    </ol>
                  </div>

                  {/* WordPress */}
                  <div className="border-l-4 border-[#94ABD6] pl-4">
                    <h3 className="text-lg font-bold mb-2 header-font">WordPress</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm body-font">
                      <li>Edit the page or post where you want the button</li>
                      <li>Add a "Custom HTML" block</li>
                      <li>Paste the button code into the HTML block</li>
                      <li>Update/publish your page</li>
                    </ol>
                  </div>

                  {/* Generic HTML */}
                  <div className="border-l-4 border-gray-400 pl-4">
                    <h3 className="text-lg font-bold mb-2 header-font">Other Websites</h3>
                    <p className="text-sm body-font">
                      For any website that allows custom HTML, simply paste the button code wherever you want the button
                      to appear. If you need help with implementation, contact your web developer or platform support.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 text-blue-800 header-font">💡 Pro Tips</h2>
                <ul className="space-y-2 text-sm text-blue-700 body-font">
                  <li>• Place the button prominently on your homepage or services page</li>
                  <li>• Consider adding text like "New customers start here" above the button</li>
                  <li>• You can customize the button colors by editing the CSS in the code</li>
                  <li>• Test the button after adding it to make sure it works correctly</li>
                </ul>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setProfessionalId("")
                    setCopiedStates({})
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

      {/* Modal */}
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
    </div>
  )
}
