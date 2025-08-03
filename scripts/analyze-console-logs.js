// Script to fetch and analyze the console logs
async function analyzeConsoleLogs() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/console%2008032025-ADhIDZHjJND5kgzkwNJdo3uxlXcA2r.csv",
    )
    const csvText = await response.text()

    console.log("=== CONSOLE LOG ANALYSIS ===")
    console.log("Total log entries:", csvText.split("\n").length - 1)

    // Parse CSV manually since it's console logs
    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    console.log("CSV Headers:", headers)

    // Look for capacity calculation related logs
    const capacityLogs = lines.filter(
      (line) =>
        line.includes("calculateAvailableSlots") ||
        line.includes("blocked") ||
        line.includes("capacity") ||
        line.includes("Layer"),
    )

    console.log("\n=== CAPACITY CALCULATION LOGS ===")
    capacityLogs.forEach((log, index) => {
      console.log(`${index + 1}:`, log)
    })

    // Look for blocked time related logs
    const blockedTimeLogs = lines.filter(
      (line) => line.includes("blocked") || line.includes("Block") || line.includes("isBlocked"),
    )

    console.log("\n=== BLOCKED TIME LOGS ===")
    blockedTimeLogs.forEach((log, index) => {
      console.log(`${index + 1}:`, log)
    })

    // Look for time slot generation logs
    const timeSlotLogs = lines.filter(
      (line) => line.includes("generateTimeSlots") || line.includes("time slot") || line.includes("slot"),
    )

    console.log("\n=== TIME SLOT GENERATION LOGS ===")
    timeSlotLogs.slice(0, 20).forEach((log, index) => {
      console.log(`${index + 1}:`, log)
    })

    return {
      totalLogs: lines.length - 1,
      capacityLogs: capacityLogs.length,
      blockedTimeLogs: blockedTimeLogs.length,
      timeSlotLogs: timeSlotLogs.length,
    }
  } catch (error) {
    console.error("Error analyzing console logs:", error)
  }
}

// Execute the analysis
analyzeConsoleLogs()
