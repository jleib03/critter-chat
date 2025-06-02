"use client"
import { useState } from "react"
import { ArrowRight, ArrowLeft, Copy, Check, Code } from "lucide-react"

type ImplementationStepProps = {
  professionalId: string
  agentConfig: {
    chatName: string
  }
  onNext: () => void
  onBack: () => void
}

export default function ImplementationStep({ professionalId, agentConfig, onNext, onBack }: ImplementationStepProps) {
  const [activeTab, setActiveTab] = useState("squarespace")
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getEmbedCode = (platform: string) => {
    const baseCode = `<div id="critter-support-widget" data-professional-id="${professionalId}"></div>
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 4: Implementation</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your custom support agent is ready to be added to your website. Follow the instructions below to implement it.
      </p>

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
              This ID is automatically included in the code snippets below.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap focus:outline-none ${
            activeTab === "squarespace"
              ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("squarespace")}
        >
          Squarespace
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap focus:outline-none ${
            activeTab === "wordpress"
              ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("wordpress")}
        >
          WordPress
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap focus:outline-none ${
            activeTab === "wix" ? "border-b-2 border-[#94ABD6] text-[#94ABD6]" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("wix")}
        >
          Wix
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm whitespace-nowrap focus:outline-none ${
            activeTab === "custom" ? "border-b-2 border-[#94ABD6] text-[#94ABD6]" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("custom")}
        >
          Custom HTML
        </button>
      </div>

      {/* Squarespace Instructions */}
      {activeTab === "squarespace" && (
        <div className="space-y-6">
          <ol className="list-decimal pl-5 space-y-4 body-font">
            <li>
              <p>Log in to your Squarespace account and go to your site editor.</p>
            </li>
            <li>
              <p>Click on "Settings" in the left sidebar, then select "Advanced" and "Code Injection".</p>
            </li>
            <li>
              <p>Paste the following code into the "Footer" section:</p>
              <div className="relative mt-2">
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {getEmbedCode("squarespace")}
                </pre>
                <button
                  onClick={() => handleCopy(getEmbedCode("squarespace"), "squarespace")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                  aria-label="Copy code"
                >
                  {copied === "squarespace" ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </li>
            <li>
              <p>Click "Save" to apply the changes.</p>
            </li>
          </ol>
        </div>
      )}

      {/* WordPress Instructions */}
      {activeTab === "wordpress" && (
        <div className="space-y-6">
          <ol className="list-decimal pl-5 space-y-4 body-font">
            <li>
              <p>Log in to your WordPress admin dashboard.</p>
            </li>
            <li>
              <p>
                You can either:
                <br />
                a) Install a plugin like "Header and Footer Scripts" and add the code to the footer section, or
                <br />
                b) Edit your theme's footer.php file and add the code just before the closing &lt;/body&gt; tag.
              </p>
            </li>
            <li>
              <p>Paste the following code:</p>
              <div className="relative mt-2">
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {getEmbedCode("wordpress")}
                </pre>
                <button
                  onClick={() => handleCopy(getEmbedCode("wordpress"), "wordpress")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                  aria-label="Copy code"
                >
                  {copied === "wordpress" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </li>
            <li>
              <p>Save your changes and refresh your site to see the chat widget.</p>
            </li>
          </ol>
        </div>
      )}

      {/* Wix Instructions */}
      {activeTab === "wix" && (
        <div className="space-y-6">
          <ol className="list-decimal pl-5 space-y-4 body-font">
            <li>
              <p>Log in to your Wix account and open your site in the editor.</p>
            </li>
            <li>
              <p>Click on the "+" button to add a new element, then search for and select "Embed HTML".</p>
            </li>
            <li>
              <p>Click "Enter Code" and paste the following:</p>
              <div className="relative mt-2">
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {getEmbedCode("wix")}
                </pre>
                <button
                  onClick={() => handleCopy(getEmbedCode("wix"), "wix")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                  aria-label="Copy code"
                >
                  {copied === "wix" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </li>
            <li>
              <p>Click "Update" and then publish your site to see the changes.</p>
            </li>
          </ol>
        </div>
      )}

      {/* Custom HTML Instructions */}
      {activeTab === "custom" && (
        <div className="space-y-6">
          <ol className="list-decimal pl-5 space-y-4 body-font">
            <li>
              <p>Open your website's HTML file or template in your preferred code editor.</p>
            </li>
            <li>
              <p>
                Locate the closing &lt;/body&gt; tag (usually near the bottom of the file) and paste the following code
                just before it:
              </p>
              <div className="relative mt-2">
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {getEmbedCode("custom")}
                </pre>
                <button
                  onClick={() => handleCopy(getEmbedCode("custom"), "custom")}
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
                  aria-label="Copy code"
                >
                  {copied === "custom" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </li>
            <li>
              <p>Save the file and upload it to your web server.</p>
            </li>
          </ol>
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
          onClick={onNext}
          className="flex items-center px-6 py-2 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors body-font"
        >
          Finish
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
