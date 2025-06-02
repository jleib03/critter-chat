"use client"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Copy, Check, Code } from "lucide-react"

type AgentConfig = {
  cancellationPolicy: string
  newCustomerProcess: string
  animalRestrictions: string
  serviceDetails: string
  additionalInfo: string
  chatName: string
  chatWelcomeMessage: string
}

type ImplementationStepProps = {
  professionalId: string
  agentConfig: AgentConfig
  onNext: () => void
  onBack: () => void
}

export default function ImplementationStep({ professionalId, agentConfig, onNext, onBack }: ImplementationStepProps) {
  const [activeTab, setActiveTab] = useState<"squarespace" | "wordpress" | "wix" | "custom">("squarespace")
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

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

  // Generate the embed code
  const generateEmbedCode = () => {
    return `<script>
  (function() {
    // Critter Custom Support Agent
    var script = document.createElement('script');
    script.src = 'https://cdn.critter.pet/support-agent.js';
    script.async = true;
    script.setAttribute('data-professional-id', '${professionalId}');
    script.setAttribute('data-agent-name', '${agentConfig.chatName}');
    document.head.appendChild(script);
  })();
</script>

<div id="critter-support-agent"></div>`
  }

  // Generate the WordPress plugin code
  const generateWordPressCode = () => {
    return `// Add this to your functions.php file or in a custom plugin

function critter_support_agent_script() {
  wp_enqueue_script(
    'critter-support-agent', 
    'https://cdn.critter.pet/support-agent.js', 
    array(), 
    null, 
    true
  );
  
  wp_add_inline_script('critter-support-agent', '
    document.addEventListener("DOMContentLoaded", function() {
      window.CritterAgent = {
        professionalId: "${professionalId}",
        agentName: "${agentConfig.chatName}"
      };
    });
  ');
}
add_action('wp_enqueue_scripts', 'critter_support_agent_script');

function critter_support_agent_container() {
  echo '<div id="critter-support-agent"></div>';
}
add_action('wp_footer', 'critter_support_agent_container');`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 header-font">Step 4: Implementation</h2>
      <p className="text-gray-600 mb-6 body-font">
        Your custom support agent is ready to be added to your website. Follow the instructions below based on your
        website platform.
      </p>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none header-font ${
              activeTab === "squarespace"
                ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("squarespace")}
          >
            Squarespace
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none header-font ${
              activeTab === "wordpress"
                ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("wordpress")}
          >
            WordPress
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none header-font ${
              activeTab === "wix" ? "border-b-2 border-[#94ABD6] text-[#94ABD6]" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("wix")}
          >
            Wix
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm focus:outline-none header-font ${
              activeTab === "custom"
                ? "border-b-2 border-[#94ABD6] text-[#94ABD6]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("custom")}
          >
            Custom HTML
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "squarespace" && (
            <div>
              <h3 className="text-lg font-medium mb-3 header-font">Squarespace Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 body-font">
                <li>Log in to your Squarespace account and go to your site editor</li>
                <li>Navigate to the page where you want to add the support agent</li>
                <li>Add a new "Code" block by clicking the "+" icon and selecting "Code" from the "More" section</li>
                <li>Copy the code below and paste it into the Code block</li>
                <li>Save and publish your changes</li>
              </ol>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 header-font">Embed Code</label>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(), "squarespace")}
                    className="flex items-center text-sm text-[#94ABD6] hover:text-[#7a90ba]"
                  >
                    {copiedStates.squarespace ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">{generateEmbedCode()}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wordpress" && (
            <div>
              <h3 className="text-lg font-medium mb-3 header-font">WordPress Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 body-font">
                <li>Log in to your WordPress admin dashboard</li>
                <li>
                  Go to Appearance &gt; Theme Editor (or use a custom plugin if you're familiar with WordPress
                  development)
                </li>
                <li>
                  Add the following code to your theme's functions.php file or create a custom plugin with this code
                </li>
                <li>Save your changes</li>
              </ol>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 header-font">WordPress Code</label>
                  <button
                    onClick={() => copyToClipboard(generateWordPressCode(), "wordpress")}
                    className="flex items-center text-sm text-[#94ABD6] hover:text-[#7a90ba]"
                  >
                    {copiedStates.wordpress ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">{generateWordPressCode()}</pre>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2 header-font">Alternative: WordPress Plugin</h4>
                <p className="text-blue-700 body-font">
                  For an easier installation, you can use our WordPress plugin. Simply search for "Critter Support
                  Agent" in the WordPress plugin directory and install it. Then, go to the plugin settings and enter
                  your Professional ID: <strong>{professionalId}</strong>
                </p>
              </div>
            </div>
          )}

          {activeTab === "wix" && (
            <div>
              <h3 className="text-lg font-medium mb-3 header-font">Wix Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 body-font">
                <li>Log in to your Wix account and go to your site editor</li>
                <li>Click the "+" button to add a new element</li>
                <li>Search for "Embed" and select "Embed HTML"</li>
                <li>Copy the code below and paste it into the HTML box</li>
                <li>Click "Update" and then publish your site</li>
              </ol>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 header-font">Embed Code</label>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(), "wix")}
                    className="flex items-center text-sm text-[#94ABD6] hover:text-[#7a90ba]"
                  >
                    {copiedStates.wix ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">{generateEmbedCode()}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div>
              <h3 className="text-lg font-medium mb-3 header-font">Custom HTML Instructions</h3>
              <p className="mb-4 body-font">
                If you have a custom website or use a different platform, add the following code to your website's HTML,
                ideally just before the closing <code>&lt;/body&gt;</code> tag:
              </p>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 header-font">Embed Code</label>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(), "custom")}
                    className="flex items-center text-sm text-[#94ABD6] hover:text-[#7a90ba]"
                  >
                    {copiedStates.custom ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">{generateEmbedCode()}</pre>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-amber-800 font-medium mb-2 header-font">Need Help?</h4>
                <p className="text-amber-700 body-font">
                  If you need assistance implementing the support agent on your website, please contact our support team
                  at support@critter.pet with your Professional ID: <strong>{professionalId}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Code className="h-5 w-5 text-gray-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800 header-font">Your Professional ID</h3>
            <p className="mt-1 text-sm text-gray-600 body-font">
              Make sure to keep your Professional ID for reference: <strong>{professionalId}</strong>
            </p>
            <button
              onClick={() => copyToClipboard(professionalId, "professionalId")}
              className="mt-2 flex items-center text-sm text-[#94ABD6] hover:text-[#7a90ba]"
            >
              {copiedStates.professionalId ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy ID
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <button
          onClick={onNext}
          className="flex items-center px-6 py-2 rounded-lg text-white bg-[#94ABD6] hover:bg-[#7a90ba] transition-colors body-font"
        >
          Complete Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
