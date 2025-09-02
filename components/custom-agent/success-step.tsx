"use client"
import { useState } from "react"
import { Home, CheckCircle, Copy, Check, Code } from "lucide-react"
import { useRouter } from "next/navigation"
import { getWebhookEndpoint } from "@/types/webhook-endpoints"

type SuccessStepProps = {
  professionalName: string
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
}

export default function SuccessStep({ professionalName, professionalId, agentConfig }: SuccessStepProps) {
  const router = useRouter()
  const [activePlatform, setActivePlatform] = useState("squarespace")
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateEmbedCode = (platform: string) => {
    const config = {
      professionalId: professionalId,
      webhookUrl: getWebhookEndpoint("CHAT_CONFIG"),
      chatName: agentConfig.chatName,
      welcomeMessage: agentConfig.chatWelcomeMessage,
      primaryColor: agentConfig.widgetConfig?.primaryColor || "#94ABD6",
      position: agentConfig.widgetConfig?.position || "bottom-right",
      size: agentConfig.widgetConfig?.size || "medium",
    }

    const embedCode = ` Critter Support Widget 
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
        return ` Add this code to your Squarespace site in Code Injection or Custom HTML Block 
${embedCode}`
      case "wordpress":
        return ` Add this code to your WordPress site using a Custom HTML block or in your theme's footer.php 
${embedCode}`
      case "wix":
        return ` Add this code to your Wix site using the Custom Code (HTML iframe) element 
${embedCode}`
      case "custom":
        return ` Add this code to your website's HTML, ideally just before the closing </body> tag 
${embedCode}`
      default:
        return embedCode
    }
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4 header-font">Setup Complete!</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto body-font">
        Congratulations, {professionalName}! Your custom support agent is now ready to assist your customers.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mb-8">
        <h3 className="text-lg font-medium text-blue-800 mb-4 header-font">Your Configuration Summary</h3>
        <div className="text-left text-blue-700 space-y-2 body-font text-sm">
          <div>
            <strong>Professional ID:</strong> {professionalId}
          </div>
          <div>
            <strong>Agent Name:</strong> {agentConfig.chatName}
          </div>
          <div>
            <strong>Widget Color:</strong>{" "}
            <span
              className="inline-block w-4 h-4 rounded-full ml-1"
              style={{ backgroundColor: agentConfig.widgetConfig?.primaryColor }}
            ></span>{" "}
            {agentConfig.widgetConfig?.primaryColor}
          </div>
          <div>
            <strong>Position:</strong> {agentConfig.widgetConfig?.position?.replace("-", " ")}
          </div>
          <div>
            <strong>Size:</strong> {agentConfig.widgetConfig?.size}
          </div>
        </div>
      </div>

      {/* Implementation Code Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Code className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 header-font">Your Widget Code</h3>
          </div>
          <p className="text-gray-600 mb-4 body-font text-sm">
            Copy and paste this code into your website to add your customized support widget.
          </p>

          {/* Platform Tabs */}
          <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
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

          {/* Code Block */}
          <div className="relative">
            <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64">
              {generateEmbedCode(activePlatform)}
            </pre>
            <button
              onClick={() => handleCopy(generateEmbedCode(activePlatform), activePlatform)}
              className="absolute top-2 right-2 p-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600"
              aria-label="Copy code"
            >
              {copied === activePlatform ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mb-8">
        <h3 className="text-lg font-medium text-green-800 mb-4 header-font">Next Steps</h3>
        <ul className="list-disc pl-5 text-left text-green-700 space-y-2 body-font">
          <li>Add the chat widget to your website using the code above</li>
          <li>Test the widget on your live website to ensure it's working correctly</li>
          <li>Update your agent's knowledge as your business policies change</li>
          <li>Monitor customer interactions to improve your agent's responses</li>
        </ul>
      </div>

      <button
        onClick={() => router.push("/")}
        className="flex items-center px-6 py-3 rounded-lg bg-[#94ABD6] text-white hover:bg-[#7a90ba] transition-colors mx-auto body-font"
      >
        <Home className="mr-2 h-5 w-5" />
        Return to Home
      </button>
    </div>
  )
}
