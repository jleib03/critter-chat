"use client"
import Header from "../../components/header"
import ProfessionalJourney from "../../components/professional-journey"

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex flex-col">
      <Header />

      <main className="pt-8 flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto px-4 flex flex-col page-content">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl title-font mb-4 font-sangbleu">Critter Professional Learning Hub</h1>
          </div>

          {/* Journey Content - Only showing Professional Journey */}
          <div className="flex-1">
            <ProfessionalJourney />
          </div>
        </div>
      </main>
    </div>
  )
}
