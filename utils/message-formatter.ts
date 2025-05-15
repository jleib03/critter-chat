export function formatMessage(message: string, htmlMessage?: string): { text: string; html: string } {
  // If we already have an HTML message from the backend, use it directly
  if (htmlMessage) {
    return {
      text: removeMarkdown(message), // Provide plain text for accessibility
      html: htmlMessage,
    }
  }

  // Create a clean text version without markdown
  const cleanText = removeMarkdown(message)

  // For other messages, just convert markdown to HTML
  return {
    text: cleanText,
    html: markdownToHtml(message),
  }
}

// Function to convert markdown to HTML
export function markdownToHtml(text: string): string {
  // Convert bold markdown (**text**) to HTML <strong> tags
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Add spacing before and after lists or options
  html = html.replace(/(\n[*-] .*?)(\n[^*-])/g, "$1\n$2") // Add space after list items
  html = html.replace(/(\n[^*-].*?)(\n[*-])/g, "$1\n$2") // Add space before list items

  // Add spacing around questions
  html = html.replace(/(\?)\s*(\n)/g, "$1\n\n$2")

  // Add spacing around options or selections
  html = html.replace(/(select|choose|option|pick)([^.]*?)(\.)/gi, "<p>$1$2$3</p>")

  // Convert newlines to <br> tags
  html = html.replace(/\n\n/g, "</p><p>")
  html = html.replace(/\n/g, "<br>")

  // Wrap in paragraph if not already
  if (!html.startsWith("<p>")) {
    html = "<p>" + html + "</p>"
  }

  return html
}

// Function to remove markdown formatting from text
export function removeMarkdown(text: string): string {
  // Remove bold markdown (**text**)
  return text.replace(/\*\*(.*?)\*\*/g, "$1")
}
