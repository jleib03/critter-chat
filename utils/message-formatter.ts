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

  // Check if this is a services list message
  if (
    message.includes("services we offer") ||
    message.includes("available services") ||
    message.includes("service options")
  ) {
    return formatServicesList(message, cleanText)
  }

  // For other messages, just convert markdown to HTML
  return {
    text: cleanText,
    html: markdownToHtml(message),
  }
}

// Function to enhance HTML messages with additional styling
function enhanceHtmlMessage(html: string): string {
  // Add any additional styling or modifications to the HTML here

  // Add classes to lists for better styling
  html = html.replace(/<ol>/g, '<ol class="numbered-list">')
  html = html.replace(/<ul>/g, '<ul class="bullet-list">')

  // Convert service lists to numbered lists
  html = html.replace(/<ul class="services-list">/g, '<ol class="services-list numbered-list">')

  // Make sure service items are in a numbered list
  html = html.replace(/<div class="service-category">/g, '<div class="service-category"><ol class="numbered-list">')
  html = html.replace(
    /<\/div>(\s*)<div class="service-category">/g,
    '</ol></div>$1<div class="service-category"><ol class="numbered-list">',
  )
  html = html.replace(/<\/div>(\s*)<\/div>(\s*)<\/div>/g, "</ol></div>$1</div>$2</div>")

  // Add classes to list items for better styling
  html = html.replace(/<li>/g, '<li class="list-item">')

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

  // Preserve specific formatting for booking lists and invoice lists
  html = html.replace(/<div>📆 <strong>/g, '<div class="body-font">📆 <strong class="header-font">')
  html = html.replace(/<div>📅 <strong>/g, '<div class="body-font">📅 <strong class="header-font">')

  // Add service list specific formatting
  html = html.replace(/<div>🛠️ <strong>/g, '<div class="body-font">🛠️ <strong class="header-font">')
  html = html.replace(/<div>📋 <strong>/g, '<div class="body-font">📋 <strong class="header-font">')

  // Ensure booking and invoice details have proper formatting
  html = html.replace(/<li class="booking-item">/g, '<li class="booking-item body-font">')
  html = html.replace(/<li class="invoice-item">/g, '<li class="invoice-item body-font">')
  html = html.replace(/<li class="service-item">/g, '<li class="service-item body-font">')

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
    const bookings: any[] = []
    let match

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
  htmlOutput += '<ol class="bookings-list numbered-list" style="margin-left: 20px; margin-top: 10px;">'
  for (let i = 0; i < Math.min(detailedBookingsCount, bookings.length); i++) {
    const booking = bookings[i]

    if (booking.startTime && booking.endTime) {
      // Detailed format with start and end times
      htmlOutput += `<li class="booking-item body-font"><strong class="header-font">${booking.date}</strong><ul class="booking-details bullet-list" style="margin-top: 5px;">`
      htmlOutput += `<li class="body-font"><strong class="header-font">Start Time:</strong> ${booking.startTime}</li>`
      htmlOutput += `<li class="body-font"><strong class="header-font">End Time:</strong> ${booking.endTime}</li>`
      htmlOutput += `</ul></li>`
    } else {
      // Simple format with combined time
      htmlOutput += `<li class="booking-item body-font"><strong class="header-font">${booking.date}</strong>: ${booking.time}</li>`
    }
  }
  htmlOutput += "</ol><br>"

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
    htmlOutput += '<ul class="month-summary bullet-list" style="margin-left: 20px; margin-top: 10px;">'
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
    htmlOutput += '<ol class="invoices-list numbered-list" style="margin-left: 20px; margin-top: 10px;">'

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
      htmlOutput += `<li class="invoice-item body-font"><strong class="header-font">Invoice Number:</strong> ${invoiceNumber}<ul class="invoice-details bullet-list" style="margin-top: 5px;">`
      htmlOutput += `<li class="body-font"><strong class="header-font">Status:</strong> ${status}</li>`
      htmlOutput += `<li class="body-font"><strong class="header-font">Due Date:</strong> ${dueDate}</li>`
      htmlOutput += `</ul></li>`
    }

    // Close the main list
    htmlOutput += "</ol>"

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

// New function to format services lists
function formatServicesList(message: string, cleanText: string): { text: string; html: string } {
  try {
    // Extract the intro text (everything before the first category or service)
    const introMatch = message.match(/(.*?)(?=\n\n\*\*)/s)
    const introText = introMatch ? introMatch[1].trim() : "Here are our services:"

    // Extract the footer text (everything after the last service item)
    const footerMatch = message.match(/\n\n(Is there anything else.*?)$/s)
    const footerText = footerMatch ? footerMatch[1].trim() : ""

    // Build HTML output
    let htmlOutput = `<div class="body-font">${markdownToHtml(introText)}</div><br>`

    // Add a header for the services list
    htmlOutput += `<div class="body-font">🛠️ <strong class="header-font">Our Services:</strong></div><br>`

    // Split the message into sections by double newlines
    const sections = message.split("\n\n")

    // Skip the intro (first section) and footer (last section if it exists)
    const serviceSections = sections.slice(1, footerMatch ? -1 : undefined)

    // Track the current category
    let currentCategory = ""
    let serviceNumber = 1

    // Create a container for the services
    htmlOutput += '<div class="services-container">'

    // Process each section
    serviceSections.forEach((section) => {
      // Check if this is a category header (starts with **)
      if (section.startsWith("**") && section.includes("**:")) {
        // If we were in a category, close its list
        if (currentCategory) {
          htmlOutput += "</ol></div>"
        }

        // Extract the category name
        const categoryMatch = section.match(/\*\*(.*?)\*\*:/)
        currentCategory = categoryMatch ? categoryMatch[1] : "Services"

        // Start a new category section
        htmlOutput += `<div class="service-category"><h3 class="category-title header-font">${currentCategory}</h3><ol class="numbered-list">`

        // Reset service number for this category
        serviceNumber = 1
      }
      // Otherwise, this is a service item
      else if (section.trim()) {
        // If we're not in a category yet, create a default one
        if (!currentCategory) {
          currentCategory = "Services"
          htmlOutput += `<div class="service-category"><h3 class="category-title header-font">${currentCategory}</h3><ol class="numbered-list">`
        }

        // Format the service item
        // Check if it's already numbered
        const numberedItemMatch = section.match(/^\d+\.\s+(.*)/)

        if (numberedItemMatch) {
          // It's already numbered, just format it
          const serviceText = numberedItemMatch[1]
          htmlOutput += `<li class="service-item body-font">${markdownToHtml(serviceText)}</li>`
        } else {
          // It's not numbered, add our own number
          htmlOutput += `<li class="service-item body-font">${markdownToHtml(section)}</li>`
          serviceNumber++
        }
      }
    })

    // Close the last category if there was one
    if (currentCategory) {
      htmlOutput += "</ol></div>"
    }

    // Close the services container
    htmlOutput += "</div>"

    // Add footer if present
    if (footerText) {
      htmlOutput += `<br><div class="message-footer body-font">${markdownToHtml(footerText)}</div>`
    }

    return {
      text: cleanText,
      html: htmlOutput,
    }
  } catch (error) {
    console.log("Error formatting services list:", error)
    // If there's an error, just convert markdown to HTML and return
    return {
      text: cleanText,
      html: markdownToHtml(message),
    }
  }
}
