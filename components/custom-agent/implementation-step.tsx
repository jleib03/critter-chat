const generateEmbedCode = () => {
  const config = {
    professionalId: professionalId,
    webhookUrl: "https://jleib03.app.n8n.cloud/webhook-test/803d260b-1b17-4abf-8079-2d40225c29b0",
    chatName: agentConfig.chatName,
    welcomeMessage: agentConfig.chatWelcomeMessage,
    primaryColor: agentConfig.widgetConfig?.primaryColor || "#94ABD6",
    position: agentConfig.widgetConfig?.position || "bottom-right",
    size: agentConfig.widgetConfig?.size || "medium",
  }

  return `<!-- Critter Support Widget -->
<div id="critter-support-widget"></div>
<script>
(function() {
  // Widget configuration
  const CRITTER_CONFIG = ${JSON.stringify(config, null, 2)};
  
  // Message formatting function
  function formatMessage(message, htmlMessage) {
    if (htmlMessage) {
      return { text: removeMarkdown(message), html: enhanceHtmlMessage(htmlMessage) };
    }
    
    const cleanText = removeMarkdown(message);
    
    // Check for booking lists
    if (message.includes("Here are your existing bookings")) {
      return formatBookingList(message, cleanText);
    }
    
    // Check for invoice lists  
    if (message.includes("outstanding invoices")) {
      return formatInvoiceList(message, cleanText);
    }
    
    // Default formatting
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
    // Add styling classes
    html = html.replace(/<ul>/g, '<ul class="bullet-list ml-4">');
    html = html.replace(/<ol>/g, '<ol class="numbered-list ml-4">');
    html = html.replace(/<li>/g, '<li class="list-item">');
    html = html.replace(/<strong>/g, '<strong class="font-bold">');
    return html;
  }
  
  function formatBookingList(message, cleanText) {
    // Simplified booking list formatting for embedded widget
    const bookingRegex = /\\d+\\. \\*\\*(.*?)\\*\\*: (.*?)(?=\\n|$)/g;
    let match;
    const bookings = [];
    
    while ((match = bookingRegex.exec(message)) !== null) {
      bookings.push({ date: match[1], time: match[2] });
    }
    
    let htmlOutput = '<div class="bookings-list">';
    htmlOutput += '<strong>Your upcoming bookings:</strong><br><br>';
    htmlOutput += '<ul class="bullet-list ml-4">';
    
    bookings.forEach(booking => {
      htmlOutput += \`<li><strong>\${booking.date}</strong>: \${booking.time}</li>\`;
    });
    
    htmlOutput += '</ul></div>';
    
    return { text: cleanText, html: htmlOutput };
  }
  
  function formatInvoiceList(message, cleanText) {
    // Simplified invoice list formatting for embedded widget
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
    
    invoices.forEach(invoice => {
      htmlOutput += \`<li><strong>Invoice \${invoice.number}</strong><ul class="ml-4"><li>Status: \${invoice.status}</li><li>Due: \${invoice.dueDate}</li></ul></li>\`;
    });
    
    htmlOutput += '</ul></div>';
    
    return { text: cleanText, html: htmlOutput };
  }

  // Widget creation and chat functionality
  function createWidget() {
    const widgetContainer = document.getElementById('critter-support-widget');
    if (!widgetContainer) return;

    // Create widget HTML structure
    const widgetHTML = \`
      <div id="critter-chat-widget" style="
        position: fixed;
        \${CRITTER_CONFIG.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        \${CRITTER_CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Chat toggle button -->
        <div id="critter-chat-toggle" style="
          width: \${CRITTER_CONFIG.size === 'large' ? '70px' : CRITTER_CONFIG.size === 'small' ? '50px' : '60px'};
          height: \${CRITTER_CONFIG.size === 'large' ? '70px' : CRITTER_CONFIG.size === 'small' ? '50px' : '60px'};
          background-color: \${CRITTER_CONFIG.primaryColor};
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        
        <!-- Chat window -->
        <div id="critter-chat-window" style="
          display: none;
          position: absolute;
          bottom: 80px;
          right: 0;
          width: \${CRITTER_CONFIG.size === 'large' ? '400px' : CRITTER_CONFIG.size === 'small' ? '300px' : '350px'};
          height: \${CRITTER_CONFIG.size === 'large' ? '500px' : CRITTER_CONFIG.size === 'small' ? '400px' : '450px'};
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        ">
          <!-- Chat header -->
          <div style="
            background-color: \${CRITTER_CONFIG.primaryColor};
            color: white;
            padding: 16px;
            font-weight: 600;
            font-size: 16px;
          ">
            \${CRITTER_CONFIG.chatName}
          </div>
          
          <!-- Chat messages -->
          <div id="critter-chat-messages" style="
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            font-size: 14px;
            line-height: 1.5;
          ">
            <div style="
              background: #f3f4f6;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 12px;
            ">
              \${CRITTER_CONFIG.welcomeMessage}
            </div>
          </div>
          
          <!-- Chat input -->
          <div style="
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
          ">
            <input 
              id="critter-chat-input" 
              type="text" 
              placeholder="Type your message..."
              style="
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                outline: none;
                font-size: 14px;
              "
            />
            <button 
              id="critter-chat-send"
              style="
                background-color: \${CRITTER_CONFIG.primaryColor};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
              "
            >
              Send
            </button>
          </div>
        </div>
      </div>
    \`;

    widgetContainer.innerHTML = widgetHTML;

    // Add event listeners
    const toggle = document.getElementById('critter-chat-toggle');
    const window = document.getElementById('critter-chat-window');
    const input = document.getElementById('critter-chat-input');
    const sendBtn = document.getElementById('critter-chat-send');
    const messages = document.getElementById('critter-chat-messages');

    let isOpen = false;
    let sessionId = 'embedded_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      window.style.display = isOpen ? 'flex' : 'none';
    });

    async function sendMessage(messageText) {
      if (!messageText.trim()) return;

      // Add user message to chat
      addMessage(messageText, true);
      input.value = '';

      // Show typing indicator
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.style.cssText = 'background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px;';
      typingDiv.innerHTML = 'Typing...';
      messages.appendChild(typingDiv);
      messages.scrollTop = messages.scrollHeight;

      try {
        const response = await fetch(CRITTER_CONFIG.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'support_conversation',
            professionalId: CRITTER_CONFIG.professionalId,
            message: messageText,
            userInfo: {
              source: 'embedded_widget',
              sessionId: sessionId,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        
        // Remove typing indicator
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();

        // Format and add response message
        if (data.message) {
          const formattedMessage = formatMessage(data.message, data.htmlMessage);
          addMessage(formattedMessage.html || formattedMessage.text, false, true);
        } else {
          addMessage('Sorry, I encountered an error. Please try again.', false);
        }

      } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
        
        addMessage('Sorry, there was an error processing your request. Please try again later.', false);
      }
    }

    function addMessage(text, isUser, isHtml = false) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = \`
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        max-width: 85%;
        \${isUser 
          ? \`background-color: \${CRITTER_CONFIG.primaryColor}; color: white; margin-left: auto;\`
          : 'background: #f3f4f6; color: #374151; margin-right: auto;'
        }
      \`;
      
      if (isHtml) {
        messageDiv.innerHTML = text;
      } else {
        messageDiv.textContent = text;
      }
      
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage(input.value);
    });
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
</script>

<style>
/* Additional styles for embedded widget */
#critter-support-widget .bullet-list {
  list-style-type: disc;
  margin-left: 1rem;
}

#critter-support-widget .numbered-list {
  list-style-type: decimal;
  margin-left: 1rem;
}

#critter-support-widget .list-item {
  margin-bottom: 0.25rem;
}

#critter-support-widget .font-bold {
  font-weight: 600;
}

#critter-support-widget ul ul {
  margin-top: 0.5rem;
  margin-left: 1rem;
}
</style>`
}
