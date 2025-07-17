import { loadProfessionalLandingData } from "@/utils/professional-landing-config"
import ProfessionalPageClient from "./ProfessionalPageClient"

interface ProfessionalPageProps {
  params: {
    uniqueUrl: string
  }
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  return <ProfessionalPageClient params={params} />
}

export async function generateMetadata({ params }: ProfessionalPageProps) {
  const { uniqueUrl } = params

  try {
    const professionalData = await loadProfessionalLandingData(uniqueUrl)

    if (!professionalData) {
      return {
        title: "Professional Not Found",
        description: "The requested professional page could not be found.",
      }
    }

    return {
      title: `${professionalData.name} - Professional Pet Care Services`,
      description:
        professionalData.description ||
        `Book professional pet care services with ${professionalData.name}. ${professionalData.tagline || "Quality care for your pets."}`,
      keywords: `pet care, ${professionalData.name}, professional services, ${professionalData.specialties?.join(", ") || ""}`,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Professional Pet Care Services",
      description: "Book professional pet care services for your pets.",
    }
  }
}
