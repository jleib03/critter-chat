export interface ProfessionalLandingData {
  name: string
  title: string
  company: string
  address: string
  phone: string
  email: string
  website: string
  about: string
  serviceAreas: string[]
  certifications: string[]
  licenses: string[]
  awards: string[]
  socialLinks: {
    facebook?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  logo?: string
  heroImage?: string
}

export const loadProfessionalLandingData = async (
  /* identifier: string */
  // Removed identifier for simplicity
): Promise<ProfessionalLandingData> => {
  // Mock data - replace with actual data fetching logic
  const name = "John Doe"
  const title = "Senior Consultant"
  const company = "Acme Corp"
  let address = "123 Main St, Anytown, USA"
  const phone = "555-123-4567"
  const email = "john.doe@example.com"
  const website = "https://www.example.com"
  const about = "John Doe is a senior consultant with over 10 years of experience in the industry."
  const serviceAreas = ["90210", "90211", "90212"]
  const certifications = ["Certified Professional", "Expert Certification"]
  const licenses = ["License #12345", "License #67890"]
  const awards = ["Award 1", "Award 2"]
  const socialLinks = {
    facebook: "https://www.facebook.com/johndoe",
    linkedin: "https://www.linkedin.com/in/johndoe",
  }
  const logo = "/images/acme-logo.png"
  const heroImage = "/images/hero-image.jpg"

  // Set address from service areas (just the zip codes, no prefix)
  address = serviceAreas.join(", ")

  return {
    name,
    title,
    company,
    address,
    phone,
    email,
    website,
    about,
    serviceAreas,
    certifications,
    licenses,
    awards,
    socialLinks,
    logo,
    heroImage,
  }
}
