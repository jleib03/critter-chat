"use client"
import { useState } from "react"
import { ArrowRight, ArrowLeft, Copy, Check, Code, Palette, MessageSquare, Settings } from "lucide-react"

type ImplementationStepProps = {
  professionalId: string
  agentConfig: {
    chatName: string
    chatWelcomeMessage: string
  }
  setAgentConfig?: (config: any) => void
  onNext: () => void
  onBack: () => void
}

export default function ImplementationStep({
  professionalId,
  agentConfig,
  setAgentConfig,
  onNext,
  onBack,
}: ImplementationStepProps) {
  const [activeTab, setActiveTab] = useState("customize")
  const [activePlatform, setActivePlatform] = useState("squarespace")
  const [copied, setCopied] = useState<string | null>(null)
  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: "#94ABD6",
    position: "bottom-right",
    size: "medium",
    chatName: agentConfig.chatName,
    chatWelcomeMessage: agentConfig.chatWelcomeMessage,
  })

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleWidgetConfigChange = (field: string, value: string) => {
    const newConfig = { ...widgetConfig, [field]: value }
    setWidgetConfig(newConfig)

    // Update the main agent config if the function is available
    if (setAgentConfig && (field === "chatName" || field === "chatWelcomeMessage")) {
      setAgentConfig({
        ...agentConfig,
        [field]: value,
      })
    }
  }

  const getEmbedCode = (platform: string) => {
    const baseCode = `<div id="critter-support-widget" 
  data-professional-id="${professionalId}"
  data-primary-color="${widgetConfig.primaryColor}"
  data-position="${widgetConfig.position}"
  data-size="${widgetConfig.size}">
</div>
<script src="https://critter.com/support-widget.js" async></script>`

    switch (platform) {
      case "squarespace":
        return `<!-- Add this code to your Squarespace site in Code Injection or Custom HTML Block -->
${baseCode}`
      case "wordpress":
        return `<!-- Add this code to your WordPress site using a Custom HTML block or in your theme's footer.php -->
${baseCode}`
      case "wix":
        return `<!-- Add this code to your Wix site using the Custom Code (HTML iframe) element -->
${baseCode}`
      case "custom":
        return `<!-- Add this code to your website's HTML, ideally just before the closing </body> tag -->
${baseCode}`
      default:
        return baseCode
    }
  }

  const getPositionStyle = () => {
    switch (widgetConfig.position) {
      case "bottom-left":
        return "bottom-4 left-4"
      case "bottom-right":
        return "bottom-4 right-4"
      case "top-left":
        return "top-4 left-4"
      case "top-right":
        return "top-4 right-4"
      default:
        return "bottom-4 right-4"
    }
  }

  const getSizeClasses = () => {
    switch (widgetConfig.size) {
      case "small":
        return "w-64 h-80"
      case "medium":
        return "w-80 h-96"
      case "large":
        return "w-96 h-[28rem]"
      default:
        return "w-80 h-96"
    }
  }

  // Handle next step with widget config
  const handleNext = () => {
    // Update the main agent config with all widget settings
    if (setAgentConfig) {
      setAgentConfig({
        ...agentConfig,
        chatName: widgetConfig.chatName,
        chatWelcomeMessage: widgetConfig.chatWelcomeMessage,
        widgetConfig: {
          primaryColor: widgetConfig.primaryColor,
          position: widgetConfig.position,
          size: widgetConfig.size,
        },
      })
    }
    onNext()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 3: Customization & Implementation</h2>
      <p className="text-gray-600 mb-6 body-font">
        Customize your chat widget appearance and get the code to add it to your website.
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "customize"
              ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("customize")}
        >
          <Palette className="inline w-4 h-4 mr-2" />
          Customize Widget
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "install" ? "border-b-2 border-[#94ABD6] text-[#94ABD6]" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("install")}
        >
          <Code className="inline w-4 h-4 mr-2" />
          Installation Code
        </button>
      </div>

      {/* Customize Tab */}
      {activeTab === "customize" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Chat Agent Name</label>
              <input
                type="text"
                value={widgetConfig.chatName}
                onChange={(e) => handleWidgetConfigChange("chatName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                placeholder="Name your chat agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Welcome Message</label>
              <textarea
                value={widgetConfig.chatWelcomeMessage}
                onChange={(e) => handleWidgetConfigChange("chatWelcomeMessage", e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                placeholder="The first message customers will see"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => handleWidgetConfigChange("primaryColor", e.target.value)}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => handleWidgetConfigChange("primaryColor", e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                  placeholder="#94ABD6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Widget Position</label>
              <select
                value={widgetConfig.position}
                onChange={(e) => handleWidgetConfigChange("position", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 header-font">Widget Size</label>
              <select
                value={widgetConfig.size}
                onChange={(e) => handleWidgetConfigChange("size", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
              >
                <option value="small">Small (320x400px)</option>
                <option value="medium">Medium (384x480px)</option>
                <option value="large">Large (448x560px)</option>
              </select>
            </div>
          </div>

          {/* Live Preview */}
          <div className="relative">
            <h3 className="text-lg font-medium text-gray-900 mb-4 header-font">Live Preview</h3>
            <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden border-2 border-gray-200">
              {/* Simulated website background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Chat Widget Preview */}
              <div className={`absolute ${getPositionStyle()}`}>
                <div className={`${getSizeClasses()} bg-white rounded-lg shadow-xl border overflow-hidden`}>
                  {/* Widget Header */}
                  <div
                    className="p-4 text-white flex items-center justify-between"
                    style={{ backgroundColor: widgetConfig.primaryColor }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {widgetConfig.chatName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{widgetConfig.chatName}</div>
                        <div className="text-xs opacity-90">Online</div>
                      </div>
                    </div>
                    <Settings className="w-4 h-4 opacity-75" />
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 p-4 space-y-3 bg-gray-50">
                    <div className="flex">
                      <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                        <div className="text-sm body-font">
                          {widgetConfig.chatWelcomeMessage || "Hello! How can I help you today?"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-3 border-t bg-white">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        disabled
                      />
                      <button
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: widgetConfig.primaryColor }}
                        disabled
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Installation Tab */}
      {activeTab === "install" && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 header-font">Your Professional ID</h3>
                <p className="mt-1 text-sm text-blue-700 body-font">
                  Your unique Professional ID is: <span className="font-mono font-bold">{professionalId}</span>
                </p>
                <p className="mt-1 text-sm text-blue-700 body-font">
                  This ID and your customization settings are automatically included in the code snippets below.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            {[
              { id: "squarespace", name: "Squarespace" },
              { id: "wordpress", name: "WordPress" },
              { id: "wix", name: "Wix" },
              { id: "custom", name: "Custom HTML" },
            ].map((platform) => (
              <button
                key={platform.id}
                className={`py-2 px-4 font-medium text-sm whitespace-nowrap focus:outline-none ${
                  activePlatform === platform.id
                    ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActivePlatform(platform.id)}
              >
                {platform.name}
              </button>
            ))}
          </div>

          {/* Installation Instructions */}
          <div className="space-y-6">
            <div className="relative">
              <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {getEmbedCode(activePlatform)}
              </pre>
              <button
                onClick={() => handleCopy(getEmbedCode(activePlatform), activePlatform)}
                className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                aria-label="Copy code"
              >
                {copied === activePlatform ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Installation Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• The widget will automatically load with your custom colors and settings</li>
                <li>• You can change the position and size by updating the data attributes</li>
                <li>• The widget is responsive and will adapt to different screen sizes</li>
                <li>• Test the widget on your site to ensure it appears correctly</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors body-font"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-2 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors body-font"
        >
          Next: Test Your Agent
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
