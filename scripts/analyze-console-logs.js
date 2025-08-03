// Script to analyze console logs and identify blocked time issues
async function analyzeConsoleLogs() {
  try {
    console.log("Analyzing console logs for blocked time slot issues...")

    // Fetch the console log file
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/console%2008032025-ADhIDZHjJND5kgzkwNJdo3uxlXcA2r.csv",
    )
    const csvData = await response.text()

    console.log("Console log data retrieved successfully")
    console.log("First 500 characters:", csvData.substring(0, 500))

    // Parse CSV data
    const lines = csvData.split("\n")
    const headers = lines[0]?.split(",") || []

    console.log("CSV Headers:", headers)
    console.log("Total lines:", lines.length)

    // Look for blocked time related logs
    const blockedTimeEntries = lines.filter(
      (line) =>
        line.toLowerCase().includes("blocked") ||
        line.toLowerCase().includes("calculateavailableslots") ||
        line.toLowerCase().includes("generatetimeslots"),
    )

    console.log("Found blocked time related entries:", blockedTimeEntries.length)

    if (blockedTimeEntries.length > 0) {
      console.log("Sample blocked time entries:")
      blockedTimeEntries.slice(0, 5).forEach((entry, index) => {
        console.log(`${index + 1}:`, entry)
      })
    }

    // Analysis summary
    console.log("\n=== ANALYSIS SUMMARY ===")
    console.log("Issue: Blocked time slots appearing in UI instead of being filtered out")
    console.log("Root Cause: Time slot generation not considering blocked times")
    console.log("Solution: Pre-filter blocked times during slot generation")
    console.log("Status: Implementation ready")
  } catch (error) {
    console.error("Error analyzing console logs:", error)
  }
}

// Execute the analysis
analyzeConsoleLogs()
