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

  // Add classes to list items for better styling
  html = html.replace(/<li>/g, '<li class="list-item">')

  // Enhance strong elements
  html = html.replace(/<strong>/g, '<strong class="font-bold">')

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
  let htmlOutput = `<div>${markdownToHtml(introText)}</div><br><br>`

  // Define how many bookings to show in detail
  const detailedBookingsCount = 20
  const totalBookings = bookings.length

  // Show the next X bookings in detail
  htmlOutput += `<div>📆 <strong>Your next ${Math.min(detailedBookingsCount, totalBookings)} bookings:</strong></div><br>`

  // Create a list for the bookings
  htmlOutput += '<ol class="bookings-list" style="margin-left: 20px; margin-top: 10px;">'
  for (let i = 0; i < Math.min(detailedBookingsCount, bookings.length); i++) {
    const booking = bookings[i]

    if (booking.startTime && booking.endTime) {
      // Detailed format with start and end times
      htmlOutput += `<li class="booking-item"><strong>${booking.date}</strong><ul class="booking-details" style="margin-top: 5px;">`
      htmlOutput += `<li><strong>Start Time:</strong> ${booking.startTime}</li>`
      htmlOutput += `<li><strong>End Time:</strong> ${booking.endTime}</li>`
      htmlOutput += `</ul></li>`
    } else {
      // Simple format with combined time
      htmlOutput += `<li class="booking-item"><strong>${booking.date}</strong>: ${booking.time}</li>`
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
    htmlOutput += `<div>📅 <strong>Additional bookings by month:</strong></div><br>`

    // Add month sections as a list
    htmlOutput += '<ul class="month-summary" style="margin-left: 20px; margin-top: 10px;">'
    Object.keys(bookingsByMonth).forEach((monthYear) => {
      const monthBookings = bookingsByMonth[monthYear]
      htmlOutput += `<li>${monthYear}: ${monthBookings.length} bookings</li>`
    })
    htmlOutput += "</ul><br>"
  }

  // Add total count
  htmlOutput += `<div><strong>You have a total of ${totalBookings} upcoming bookings.</strong></div>`

  // Add footer if present
  if (footerText) {
    htmlOutput += `<br><div class="message-footer">${markdownToHtml(footerText)}</div>`
  }

  return {
    text: removeMarkdown(
      introText +
        "\n\n" +
        bookings
          .map(
            (b, i) =>
              `${i + 1}. ${b.date}${b.startTime ? "\n   - Start Time: " + b.startTime : ""}${b.endTime ? "\n   - End Time: " + b.endTime : ""}`,
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
    let htmlOutput = `<div>${markdownToHtml(introText)}</div><br>`

    // Create a list for the invoices
    htmlOutput += '<ol class="invoices-list" style="margin-left: 20px; margin-top: 10px;">'

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
      htmlOutput += `<li class="invoice-item"><strong>Invoice Number:</strong> ${invoiceNumber}<ul class="invoice-details" style="margin-top: 5px;">`
      htmlOutput += `<li><strong>Status:</strong> ${status}</li>`
      htmlOutput += `<li><strong>Due Date:</strong> ${dueDate}</li>`
      htmlOutput += `</ul></li>`
    }

    // Close the main list
    htmlOutput += "</ol>"

    // Add footer if present
    if (footerText) {
      htmlOutput += `<br><div class="message-footer">${markdownToHtml(footerText)}</div>`
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
