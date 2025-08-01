// Function to convert markdown to HTML
export function markdownToHtml(text: string): string {
  // Convert bold markdown (**text**) to HTML <strong> tags
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convert newlines to <br> tags
  html = html.replace(/\n/g, "<br>")

  return html
}

// Function to remove markdown formatting from text
export function removeMarkdown(text: string): string {
  // Remove bold markdown (**text**)
  return text.replace(/\*\*(.*?)\*\*/g, "$1")
}

// Enhanced function to format the message with better HTML handling
export function formatMessage(message: string, htmlMessage?: string): { text: string; html: string } {
  // If we already have an HTML message from the backend, use it directly
  if (htmlMessage) {
    return {
      text: removeMarkdown(message), // Still provide plain text for accessibility
      html: enhanceHtmlMessage(htmlMessage),
    }
  }

  // Create a clean text version without markdown
  const cleanText = removeMarkdown(message)

  // Check if this is a booking list message
  if (message.includes("Here are your existing bookings")) {
    // Check which format of booking list we have
    if (message.includes("Start Time:") && message.includes("End Time:")) {
      return formatDetailedBookingList(message, cleanText)
    } else {
      return formatSimpleBookingList(message, cleanText)
    }
  }

  // Check if this is an invoice list message
  if (message.includes("outstanding invoices")) {
    return formatInvoiceList(message, cleanText)
  }

  // Check if this is a professional or service listing
  if (
    (message.includes("professionals you work with") || message.includes("services offered by")) &&
    (message.includes("Email:") || message.includes("Duration:") || message.includes("Price:"))
  ) {
    return formatStructuredContent(message, cleanText)
  }

  // For other messages, just convert markdown to HTML with enhanced spacing
  return {
    text: cleanText,
    html: enhancedMarkdownToHtml(message),
  }
}

// Enhanced function to convert markdown to HTML with better formatting
function enhancedMarkdownToHtml(text: string): string {
  // Convert bold markdown (**text**) to HTML <strong> tags
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convert list-like items to bullet points
  html = convertListsToBullets(html)

  // Add spacing after questions
  html = html.replace(/(\?)\s*(\n|$)/g, "$1<br><br>$2")

  // Add spacing around selection prompts
  html = html.replace(/(please\s+(?:let\s+me\s+know|select|choose|pick)\s+(?:which|what).*?\.)/gi, "<br>$1<br>")

  // Convert newlines to <br> tags
  html = html.replace(/\n/g, "<br>")

  return html
}

// Function to convert list-like items to bullet points
function convertListsToBullets(html: string): string {
  // First, handle explicit lists (lines starting with -, *, or •)
  // This regex handles list items at the start of the string or on a new line.
  html = html.replace(/(^|\n)([-*•]) (.*?)(?=\n|$)/g, '$1<ul class="bullet-list"><li class="body-font">$3</li></ul>')

  // Combine adjacent list items
  html = html.replace(/<\/ul>\n<ul class="bullet-list">/g, "")

  // Handle numbered lists (lines starting with 1., 2., etc.)
  // This regex also handles lists at the start of the string.
  html = html.replace(/(^|\n)(\d+)\. (.*?)(?=\n|$)/g, '$1<ol class="numbered-list"><li class="body-font">$3</li></ol>')

  // Combine adjacent numbered list items
  html = html.replace(/<\/ol>\n<ol class="numbered-list">/g, "")

  // Convert list-like patterns (e.g., "Name: value" on separate lines)
  const listPatterns = [
    {
      pattern: /\n([A-Za-z0-9 ]+):\s*(.*?)(?=\n|$)/g,
      replacement: '\n<ul class="bullet-list"><li class="body-font"><strong>$1:</strong> $2</li></ul>',
    },
  ]

  listPatterns.forEach(({ pattern, replacement }) => {
    html = html.replace(pattern, replacement)
    // Combine adjacent items
    html = html.replace(/<\/ul>\n<ul class="bullet-list">/g, "")
  })

  return html
}

// Function to format structured content like professional or service listings
function formatStructuredContent(message: string, cleanText: string): { text: string; html: string } {
  try {
    // Extract the intro text
    const introMatch = message.match(/(.*?)(?=\n\n)/s)
    const introText = introMatch ? introMatch[1].trim() : ""

    // Format professional listings
    let formattedHtml = formatProfessionalListings(message)

    // Format service listings
    formattedHtml = formatServiceListings(formattedHtml)

    // Add spacing after questions
    formattedHtml = formattedHtml.replace(/(\?)\s*(\n|$)/g, "$1<br><br>$2")

    // Add spacing around selection prompts
    formattedHtml = formattedHtml.replace(
      /(please\s+(?:let\s+me\s+know|select|choose|pick)\s+(?:which|what).*?\.)/gi,
      "<br>$1<br>",
    )

    // Convert newlines to <br> tags
    formattedHtml = formattedHtml.replace(/\n/g, "<br>")

    return {
      text: cleanText,
      html: formattedHtml,
    }
  } catch (error) {
    console.log("Error formatting structured content:", error)
    // If there's an error, just convert markdown to HTML and return
    return {
      text: cleanText,
      html: enhancedMarkdownToHtml(message),
    }
  }
}

// Update the formatProfessionalListings function to ensure proper font weight hierarchy

function formatProfessionalListings(html: string): string {
  // Match patterns like "Name\nEmail: email@example.com\nDescription"
  const professionalPattern =
    /([A-Za-z0-9][A-Za-z0-9\s']+)\n(Email:.*?)\n(.*?)(?=\n[A-Za-z0-9][A-Za-z0-9\s']+\nEmail:|\n(?:Please|Which|Select|Choose)|$)/gs

  return html.replace(professionalPattern, (match, name, email, description) => {
    const emailValue = email.replace(/Email:\s*/, "").trim()
    return `<div class="professional-listing mb-4">
      <div class="font-medium header-font">${name}</div>
      <ul class="bullet-list ml-4 mt-2">
        <li class="body-font"><strong class="header-font">Email:</strong> ${emailValue}</li>
        <li class="body-font">${description}</li>
      </ul>
    </div>`
  })
}

// Update the formatServiceListings function to ensure proper font weight hierarchy

function formatServiceListings(html: string): string {
  // First, identify service categories
  html = html.replace(
    /(Main Service|Add-On Service|Add-Ons)(\n)/g,
    '<div class="service-category font-medium mt-4 mb-2 header-font">$1</div>$2',
  )

  // Then format individual services
  const servicePattern =
    /([A-Za-z0-9][A-Za-z0-9\s'-]+)\n(Duration:.*?)\n(Price:.*?)(?:\n(.*?))?(?=\n[A-Za-z0-9][A-Za-z0-9\s'-]+\nDuration:|\n(?:Which|Please|Select|Choose)|$)/gs

  return html.replace(servicePattern, (match, name, duration, price, description = "") => {
    const durationValue = duration.replace(/Duration:\s*/, "").trim()
    const priceValue = price.replace(/Price:\s*/, "").trim()

    return `<div class="service-listing mb-4">
      <div class="font-medium header-font">${name}</div>
      <ul class="bullet-list ml-4 mt-2">
        <li class="body-font"><strong class="header-font">Duration:</strong> ${durationValue}</li>
        <li class="body-font"><strong class="header-font">Price:</strong> ${priceValue}</li>
        ${description ? `<li class="body-font">${description}</li>` : ""}
      </ul>
    </div>`
  })
}

// Update the enhanceHtmlMessage function to properly handle general-list class

function enhanceHtmlMessage(html: string): string {
  // Add any additional styling or modifications to the HTML here

  // Add classes to lists for better styling
  html = html.replace(/<ol>/g, '<ol class="numbered-list ml-4">')
  html = html.replace(/<ol class="general-list">/g, '<ol class="general-list bullet-list ml-4">')
  html = html.replace(/<ul>/g, '<ul class="bullet-list ml-4">')
  html = html.replace(/<ul class="professionals-list">/g, '<ul class="professionals-list bullet-list ml-2">')
  html = html.replace(/<ul class="services-list">/g, '<ul class="services-list bullet-list ml-2">')
  html = html.replace(/<ul class="pets-list">/g, '<ul class="pets-list bullet-list ml-2">')

  // Add classes to list items for better styling
  html = html.replace(/<li>/g, '<li class="list-item body-font">')
  html = html.replace(/<li class="list-item">/g, '<li class="list-item body-font">')
  html = html.replace(/<li class="professional-item">/g, '<li class="professional-item list-item body-font">')
  html = html.replace(/<li class="service-item">/g, '<li class="service-item list-item body-font">')
  html = html.replace(/<li class="pet-item">/g, '<li class="pet-item list-item body-font">')

  // Enhance strong elements
  html = html.replace(/<strong>/g, '<strong class="font-bold header-font">')

  // Add font styling to headings while preserving existing classes
  html = html.replace(/<h1/g, '<h1 class="title-font"')
  html = html.replace(/<h2/g, '<h2 class="header-font"')
  html = html.replace(/<h3/g, '<h3 class="header-font"')

  // Add font styling to paragraphs while preserving existing classes
  html = html.replace(/<p class="/g, '<p class="body-font ')
  html = html.replace(/<p>/g, '<p class="body-font">')

  // Add font styling to specific div elements that contain text
  html = html.replace(/<div class="message-intro">/g, '<div class="message-intro body-font">')
  html = html.replace(/<div class="message-footer">/g, '<div class="message-footer body-font">')
  html = html.replace(/<div class="professional-email">/g, '<div class="professional-email body-font ml-2">')
  html = html.replace(
    /<div class="professional-description">/g,
    '<div class="professional-description body-font ml-2">',
  )
  html = html.replace(/<div class="service-details">/g, '<div class="service-details body-font ml-2">')
  html = html.replace(/<div class="service-description">/g, '<div class="service-description body-font ml-2">')

  // Preserve specific formatting for booking lists and invoice lists
  html = html.replace(/<div>📆 <strong>/g, '<div class="body-font">📆 <strong class="header-font">')
  html = html.replace(/<div>📅 <strong>/g, '<div class="body-font">📅 <strong class="header-font">')

  // Ensure booking and invoice details have proper formatting
  html = html.replace(/<li class="booking-item">/g, '<li class="booking-item body-font">')
  html = html.replace(/<li class="invoice-item">/g, '<li class="invoice-item body-font">')

  // Ensure strong tags within lists maintain header font
  html = html.replace(/<strong>(.*?)<\/strong>/g, '<strong class="header-font">$1</strong>')

  return html
}

// Function to format simple booking lists (old format)
function formatSimpleBookingList(message: string, cleanText: string): { text: string; html: string } {
  try {
    // Extract the intro text (everything before the first numbered item)
    const introMatch = message.match(/(.*?)(?=\n\n1\. \*\*)/s)
    const introText = introMatch ? introMatch[1].trim() : "Here are your existing bookings:"

    // Extract the footer text (everything after the last booking)
    const footerMatch = message.match(/\n\n(If you need.*?)$/s)
    const footerText = footerMatch ? footerMatch[1].trim() : ""

    // Extract all booking entries using regex
    const bookingRegex = /\d+\. \*\*(.*?)\*\*: (.*?)(?=\n|$)/g
    let match
    const bookings: any[] = []

    while ((match = bookingRegex.exec(message)) !== null) {
      const date = match[1] // e.g., "Thursday, April 3, 2025"
      const time = match[2] // e.g., "11:00 PM - 11:30 PM"

      // Extract month, day, and year for sorting
      const dateMatch = date.match(/([A-Za-z]+), ([A-Za-z]+) (\d+), (\d+)/)
      if (dateMatch) {
        const dayOfWeek = dateMatch[1]
        const month = dateMatch[2]
        const day = Number.parseInt(dateMatch[3], 10)
        const year = Number.parseInt(dateMatch[4], 10)

        // Create a Date object for sorting (note: month is 0-indexed in JS Date)
        const monthIndex = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].indexOf(month)

        const dateObj = new Date(year, monthIndex, day)

        bookings.push({
          date,
          time,
          month,
          day,
          year,
          dateObj,
          fullDate: `${date}: ${time}`,
        })
      }
    }

    // Sort bookings chronologically
    bookings.sort((a, b) => a.dateObj - b.dateObj)

    return formatBookingOutput(introText, bookings, footerText)
  } catch (error) {
    console.log("Error formatting simple booking list:", error)
    // If there's an error, just convert markdown to HTML and return
    return {
      text: cleanText,
      html: markdownToHtml(message),
    }
  }
}

// Function to format detailed booking lists (new format with start/end times)
function formatDetailedBookingList(message: string, cleanText: string): { text: string; html: string } {
  try {
    // Extract the intro text (everything before the first numbered item)
    const introMatch = message.match(/(.*?)(?=\n\n1\.)/s)
    const introText = introMatch ? introMatch[1].trim() : "Here are your existing bookings:"

    // Extract the footer text (everything after the last booking)
    const footerMatch = message.match(/\n\n(Is there anything else.*?)$/s)
    const footerText = footerMatch ? footerMatch[1].trim() : ""

    // Split the message into sections by double newlines
    const sections = message.split("\n\n")

    // Skip the intro (first section) and footer (last section if it exists)
    const bookingSections = sections.slice(1, footerMatch ? -1 : undefined)

    const bookings: any[] = []

    // Process each booking section
    bookingSections.forEach((section) => {
      // Split the section into lines
      const lines = section.split("\n")

      // The first line contains the date and number
      const dateLine = lines[0].trim()
      const dateMatch = dateLine.match(/\d+\.\s+(.*?)$/)

      if (dateMatch) {
        const date = dateMatch[1].trim() // e.g., "Thursday, April 3, 2025"
        let startTime = ""
        let endTime = ""

        // Process the remaining lines to find start and end times
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line.includes("Start Time:")) {
            startTime = line.replace(/.*Start Time:\s*/, "").trim()
          } else if (line.includes("End Time:")) {
            endTime = line.replace(/.*End Time:\s*/, "").trim()
          }
        }

        // Format the time as "start - end"
        const time = startTime && endTime ? `${startTime} - ${endTime}` : ""

        // Extract month, day, and year for sorting
        const fullDateMatch = date.match(/([A-Za-z]+), ([A-Za-z]+) (\d+), (\d+)/)
        if (fullDateMatch) {
          const dayOfWeek = fullDateMatch[1]
          const month = fullDateMatch[2]
          const day = Number.parseInt(fullDateMatch[3], 10)
          const year = Number.parseInt(fullDateMatch[4], 10)

          // Create a Date object for sorting (note: month is 0-indexed in JS Date)
          const monthIndex = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].indexOf(month)

          const dateObj = new Date(year, monthIndex, day)

          bookings.push({
            date,
            time,
            month,
            day,
            year,
            dateObj,
            startTime,
            endTime,
            fullDate: `${date}: ${time}`,
          })
        }
      }
    })

    // Sort bookings chronologically
    bookings.sort((a, b) => a.dateObj - b.dateObj)

    return formatBookingOutput(introText, bookings, footerText)
  } catch (error) {
    console.log("Error formatting detailed booking list:", error)
    // If there's an error, just convert markdown to HTML and return
    return {
      text: cleanText,
      html: markdownToHtml(message),
    }
  }
}

// Common function to format booking output
function formatBookingOutput(introText: string, bookings: any[], footerText: string): { text: string; html: string } {
  // Build HTML output
  let htmlOutput = `<div class="body-font">${markdownToHtml(introText)}</div><br><br>`

  // Define how many bookings to show in detail
  const detailedBookingsCount = 20
  const totalBookings = bookings.length

  // Show the next X bookings in detail
  htmlOutput += `<div class="body-font">📆 <strong class="header-font">Your next ${Math.min(detailedBookingsCount, totalBookings)} bookings:</strong></div><br>`

  // Create a list for the bookings
  htmlOutput += '<ul class="bookings-list bullet-list ml-4 mt-3">'
  for (let i = 0; i < Math.min(detailedBookingsCount, bookings.length); i++) {
    const booking = bookings[i]

    if (booking.startTime && booking.endTime) {
      // Detailed format with start and end times
      htmlOutput += `<li class="booking-item body-font"><strong class="header-font">${booking.date}</strong><ul class="booking-details bullet-list ml-4 mt-2">`
      htmlOutput += `<li class="body-font"><strong class="header-font">Start Time:</strong> ${booking.startTime}</li>`
      htmlOutput += `<li class="body-font"><strong class="header-font">End Time:</strong> ${booking.endTime}</li>`
      htmlOutput += `</ul></li>`
    } else {
      // Simple format with combined time
      htmlOutput += `<li class="booking-item body-font"><strong class="header-font">${booking.date}</strong>: ${booking.time}</li>`
    }
  }
  htmlOutput += "</ul><br>"

  // If there are more bookings, show month summaries
  if (bookings.length > detailedBookingsCount) {
    // Group remaining bookings by month and year
    const remainingBookings = bookings.slice(detailedBookingsCount)
    const bookingsByMonth: { [key: string]: any[] } = {}

    remainingBookings.forEach((booking) => {
      const key = `${booking.month} ${booking.year}`
      if (!bookingsByMonth[key]) {
        bookingsByMonth[key] = []
      }
      bookingsByMonth[key].push(booking)
    })

    // Add a summary section
    htmlOutput += `<div class="body-font">📅 <strong class="header-font">Additional bookings by month:</strong></div><br>`

    // Add month sections as a list
    htmlOutput += '<ul class="month-summary bullet-list ml-4 mt-3">'
    Object.keys(bookingsByMonth).forEach((monthYear) => {
      const monthBookings = bookingsByMonth[monthYear]
      htmlOutput += `<li class="body-font">${monthYear}: ${monthBookings.length} bookings</li>`
    })
    htmlOutput += "</ul><br>"
  }

  // Add total count
  htmlOutput += `<div class="body-font"><strong class="header-font">You have a total of ${totalBookings} upcoming bookings.</strong></div>`

  // Add footer if present
  if (footerText) {
    htmlOutput += `<br><div class="message-footer body-font">${markdownToHtml(footerText)}</div>`
  }

  return {
    text: removeMarkdown(
      introText +
        "\n\n" +
        bookings
          .map(
            (b, i) =>
              `${i + 1}. ${b.date}${b.startTime ? "\n   - Start Time: " + b.startTime : ""}${
                b.endTime ? "\n   - End Time: " + b.endTime : ""
              }`,
          )
          .join("\n\n") +
        (footerText ? "\n\n" + footerText : ""),
    ),
    html: htmlOutput,
  }
}

// Function to format invoice lists - UPDATED to handle the pipe-delimited format
function formatInvoiceList(message: string, cleanText: string): { text: string; html: string } {
  try {
    // Extract the intro text (everything before the first numbered item)
    const introMatch = message.match(/(.*?)(?=\n\n1\. \*\*)/s)
    const introText = introMatch ? introMatch[1].trim() : "Here are your outstanding invoices:"

    // Extract the footer text (everything after the last invoice item)
    const footerMatch = message.match(/\n\n(Is there anything else.*?)$/s)
    const footerText = footerMatch ? footerMatch[1].trim() : ""

    // Build HTML output
    let htmlOutput = `<div class="body-font">${markdownToHtml(introText)}</div><br>`

    // Create a list for the invoices
    htmlOutput += '<ul class="invoices-list bullet-list ml-4 mt-3">'

    // Extract all invoice entries using regex - updated for pipe-delimited format
    // Format: "1. **Invoice Number:** 240830-0002 | **Status:** Overdue | **Due Date:** August 31, 2024"
    const invoiceRegex =
      /(\d+)\. \*\*Invoice Number:\*\* (.*?) \| \*\*Status:\*\* (.*?) \| \*\*Due Date:\*\* (.*?)(?=\n|$)/g
    let match

    while ((match = invoiceRegex.exec(message)) !== null) {
      const number = match[1] // e.g., "1"
      const invoiceNumber = match[2] // e.g., "240830-0002"
      const status = match[3] // e.g., "Overdue"
      const dueDate = match[4] // e.g., "August 31, 2024"

      // Add the invoice to the HTML output
      htmlOutput += `<li class="invoice-item body-font"><strong class="header-font">Invoice Number:</strong> ${invoiceNumber}<ul class="invoice-details bullet-list ml-4 mt-2">`
      htmlOutput += `<li class="body-font"><strong class="header-font">Status:</strong> ${status}</li>`
      htmlOutput += `<li class="body-font"><strong class="header-font">Due Date:</strong> ${dueDate}</li>`
      htmlOutput += `</ul></li>`
    }

    // Close the main list
    htmlOutput += "</ul>"

    // Add footer if present
    if (footerText) {
      htmlOutput += `<br><div class="message-footer body-font">${markdownToHtml(footerText)}</div>`
    }

    return {
      text: cleanText,
      html: htmlOutput,
    }
  } catch (error) {
    console.log("Error formatting invoice list:", error)
    // If there's an error, just convert markdown to HTML and return
    return {
      text: cleanText,
      html: markdownToHtml(message),
    }
  }
}
