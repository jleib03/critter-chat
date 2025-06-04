"use client"
import { useState } from "react"
import { ArrowRight, ArrowLeft, Copy, Check, Code, Palette, MessageSquare, Settings } from "lucide-react"

type ImplementationStepProps = {
  professionalId: string
  agentConfig: {
    chatName: string
    chatWelcomeMessage: string
    widgetConfig?: {
      primaryColor: string
      position: string
      size: string
    }
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
    primaryColor: agentConfig.widgetConfig?.primaryColor || "#94ABD6",
    position: agentConfig.widgetConfig?.position || "bottom-right",
    size: agentConfig.widgetConfig?.size || "medium",
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

    // Update the main agent config for all fields
    if (setAgentConfig) {
      if (field === "chatName" || field === "chatWelcomeMessage") {
        setAgentConfig({
          ...agentConfig,
          [field]: value,
        })
      } else {
        // Handle widget-specific config (primaryColor, position, size)
        setAgentConfig({
          ...agentConfig,
          widgetConfig: {
            ...agentConfig.widgetConfig,
            [field]: value,
          },
        })
      }
    }
  }

  const generateEmbedCode = (platform: string) => {
    const config = {
      professionalId: professionalId,
      webhookUrl: "https://jleib03.app.n8n.cloud/webhook-test/803d260b-1b17-4abf-8079-2d40225c29b0",
      chatName: widgetConfig.chatName,
      welcomeMessage: widgetConfig.chatWelcomeMessage,
      primaryColor: widgetConfig.primaryColor,
      position: widgetConfig.position,
      size: widgetConfig.size,
    }

    const embedCode = `<!-- Critter Support Widget -->
<div id="critter-support-widget"></div>
<script>
(function() {
  const CRITTER_CONFIG = ${JSON.stringify(config, null, 2)};
  
  function formatMessage(message, htmlMessage) {
    if (htmlMessage) {
      return { text: removeMarkdown(message), html: enhanceHtmlMessage(htmlMessage) };
    }
    
    const cleanText = removeMarkdown(message);
    
    if (message.includes("Here are your existing bookings")) {
      return formatBookingList(message, cleanText);
    }
    
    if (message.includes("outstanding invoices")) {
      return formatInvoiceList(message, cleanText);
    }
    
    return { text: cleanText, html: markdownToHtml(message) };
  }
  
  function removeMarkdown(text) {
    return text.replace(/\\*\\*(.*?)\\*\\*/g, "$1");
  }
  
  function markdownToHtml(text) {
    let html = text.replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>");
    html = html.replace(/\\n/g, "<br>");
    return html;
  }
  
  function enhanceHtmlMessage(html) {
    html = html.replace(/<ul>/g, '<ul class="bullet-list ml-4">');
    html = html.replace(/<ol>/g, '<ol class="numbered-list ml-4">');
    html = html.replace(/<li>/g, '<li class="list-item">');
    html = html.replace(/<strong>/g, '<strong class="font-bold">');
    return html;
  }
  
  function formatBookingList(message, cleanText) {
    const bookingRegex = /\\d+\\. \\*\\*(.*?)\\*\\*: (.*?)(?=\\n|$)/g;
    let match;
    const bookings = [];
    
    while ((match = bookingRegex.exec(message)) !== null) {
      bookings.push({ date: match[1], time: match[2] });
    }
    
    let htmlOutput = '<div class="bookings-list">';
    htmlOutput += '<strong>Your upcoming bookings:</strong><br><br>';
    htmlOutput += '<ul class="bullet-list ml-4">';
    
    bookings.forEach(function(booking) {
      htmlOutput += '<li><strong>' + booking.date + '</strong>: ' + booking.time + '</li>';
    });
    
    htmlOutput += '</ul></div>';
    
    return { text: cleanText, html: htmlOutput };
  }
  
  function formatInvoiceList(message, cleanText) {
    const invoiceRegex = /(\\d+)\\. \\*\\*Invoice Number:\\*\\* (.*?) \\| \\*\\*Status:\\*\\* (.*?) \\| \\*\\*Due Date:\\*\\* (.*?)(?=\\n|$)/g;
    let match;
    const invoices = [];
    
    while ((match = invoiceRegex.exec(message)) !== null) {
      invoices.push({
        number: match[2],
        status: match[3], 
        dueDate: match[4]
      });
    }
    
    let htmlOutput = '<div class="invoices-list">';
    htmlOutput += '<strong>Your outstanding invoices:</strong><br><br>';
    htmlOutput += '<ul class="bullet-list ml-4">';
    
    invoices.forEach(function(invoice) {
      htmlOutput += '<li><strong>Invoice ' + invoice.number + '</strong><ul class="ml-4"><li>Status: ' + invoice.status + '</li><li>Due: ' + invoice.dueDate + '</li></ul></li>';
    });
    
    htmlOutput += '</ul></div>';
    
    return { text: cleanText, html: htmlOutput };
  }

  function createWidget() {
    const widgetContainer = document.getElementById('critter-support-widget');
    if (!widgetContainer) return;

    const positionStyle = CRITTER_CONFIG.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;';
    const horizontalStyle = CRITTER_CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;';
    const buttonSize = CRITTER_CONFIG.size === 'large' ? '70px' : CRITTER_CONFIG.size === 'small' ? '50px' : '60px';
    const windowWidth = CRITTER_CONFIG.size === 'large' ? '400px' : CRITTER_CONFIG.size === 'small' ? '300px' : '350px';
    const windowHeight = CRITTER_CONFIG.size === 'large' ? '500px' : CRITTER_CONFIG.size === 'small' ? '400px' : '450px';

    const widgetHTML = '<div id="critter-chat-widget" style="position: fixed; ' + positionStyle + ' ' + horizontalStyle + ' z-index: 9999; font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, sans-serif;">' +
      '<div id="critter-chat-toggle" style="width: ' + buttonSize + '; height: ' + buttonSize + '; background-color: ' + CRITTER_CONFIG.primaryColor + '; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease;">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>' +
      '</div>' +
      '<div id="critter-chat-window" style="display: none; position: absolute; bottom: 80px; right: 0; width: ' + windowWidth + '; height: ' + windowHeight + '; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); flex-direction: column; overflow: hidden;">' +
        '<div style="background-color: ' + CRITTER_CONFIG.primaryColor + '; color: white; padding: 16px; font-weight: 600; font-size: 16px;">' + CRITTER_CONFIG.chatName + '</div>' +
        '<div id="critter-chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; font-size: 14px; line-height: 1.5;">' +
          '<div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px;">' + CRITTER_CONFIG.welcomeMessage + '</div>' +
        '</div>' +
        '<div style="padding: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px;">' +
          '<input id="critter-chat-input" type="text" placeholder="Type your message..." style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; font-size: 14px;" />' +
          '<button id="critter-chat-send" style="background-color: ' + CRITTER_CONFIG.primaryColor + '; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Send</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    widgetContainer.innerHTML = widgetHTML;

    const toggle = document.getElementById('critter-chat-toggle');
    const window = document.getElementById('critter-chat-window');
    const input = document.getElementById('critter-chat-input');
    const sendBtn = document.getElementById('critter-chat-send');
    const messages = document.getElementById('critter-chat-messages');

    let isOpen = false;
    let sessionId = 'embedded_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    toggle.addEventListener('click', function() {
      isOpen = !isOpen;
      window.style.display = isOpen ? 'flex' : 'none';
    });

    function sendMessage(messageText) {
      if (!messageText.trim()) return;

      addMessage(messageText, true);
      input.value = '';

      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px;';
      typingDiv.innerHTML = 'Typing...';
      messages.appendChild(typingDiv);
      messages.scrollTop = messages.scrollHeight;

      fetch(CRITTER_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'support_conversation',
          professionalId: CRITTER_CONFIG.professionalId,
          message: messageText,
          userInfo: {
            source: 'embedded_widget',
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          }
        })
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();

        if (data.message) {
          const formattedMessage = formatMessage(data.message, data.htmlMessage);
          addMessage(formattedMessage.html || formattedMessage.text, false, true);
        } else {
          addMessage('Sorry, I encountered an error. Please try again.', false);
        }
      })
      .catch(function(error) {
        console.error('Error:', error);
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        addMessage('Sorry, there was an error processing your request.', false);
      });
    }

    function addMessage(text, isUser, isHtml) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = 'padding: 12px; border-radius: 8px; margin-bottom: 12px; max-width: 85%;' +
        (isUser ? 'background-color: ' + CRITTER_CONFIG.primaryColor + '; color: white; margin-left: auto;' : 'background: #f3f4f6; color: #374151; margin-right: auto;');
      
      if (isHtml) {
        messageDiv.innerHTML = text;
      } else {
        messageDiv.textContent = text;
      }
      
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    sendBtn.addEventListener('click', function() { sendMessage(input.value); });
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage(input.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
</script>

<style>
#critter-support-widget .bullet-list { list-style-type: disc; margin-left: 1rem; }
#critter-support-widget .numbered-list { list-style-type: decimal; margin-left: 1rem; }
#critter-support-widget .list-item { margin-bottom: 0.25rem; }
#critter-support-widget .font-bold { font-weight: 600; }
#critter-support-widget ul ul { margin-top: 0.5rem; margin-left: 1rem; }
</style>`

    switch (platform) {
      case "squarespace":
        return `<!-- Add this code to your Squarespace site in Code Injection or Custom HTML Block -->
${embedCode}`
      case "wordpress":
        return `<!-- Add this code to your WordPress site using a Custom HTML block or in your theme's footer.php -->
${embedCode}`
      case "wix":
        return `<!-- Add this code to your Wix site using the Custom Code (HTML iframe) element -->
${embedCode}`
      case "custom":
        return `<!-- Add this code to your website's HTML, ideally just before the closing </body> tag -->
${embedCode}`
      default:
        return embedCode
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
                {generateEmbedCode(activePlatform)}
              </pre>
              <button
                onClick={() => handleCopy(generateEmbedCode(activePlatform), activePlatform)}
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
