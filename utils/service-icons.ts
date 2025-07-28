// utils/service-icons.ts

// Function to determine the primary service icon based on the professional's services
function getPrimaryServiceIcon(services: string[]): string {
  if (services.includes("Web Development")) {
    return "web-dev-icon"
  } else if (services.includes("Graphic Design")) {
    return "graphic-design-icon"
  } else if (services.includes("Marketing")) {
    return "marketing-icon"
  } else {
    return "default-icon"
  }
}

// Export the function for use in other modules
export { getPrimaryServiceIcon }
