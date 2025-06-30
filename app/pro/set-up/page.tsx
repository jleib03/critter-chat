"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Route } from "lucide-react"

const ProSetupPage = () => {
  const router = useRouter()
  const [professionalId, setProfessionalId] = useState("")
  const [showProfessionalIdModal, setShowProfessionalIdModal] = useState(false)
  const [selectedTile, setSelectedTile] = useState<string | null>(null)

  const handleTileClick = (tileType: string) => {
    if (tileType === "route-optimization") {
      setShowProfessionalIdModal(true)
      setSelectedTile("route-optimization")
    } else if (tileType === "custom-agent") {
      setShowProfessionalIdModal(true)
      setSelectedTile("custom-agent")
    }
  }

  const handleContinue = () => {
    if (selectedTile === "route-optimization") {
      router.push(`/pro/route-optimization/${professionalId}`)
    } else if (selectedTile === "custom-agent") {
      router.push(`/pro/custom-agent/${professionalId}`)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6 text-center">Pro Setup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Custom Agent */}
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-[#16A085]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Agent</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Create a custom AI agent tailored to your specific business needs.
                </p>
              </div>
              <Button
                onClick={() => handleTileClick("custom-agent")}
                className="w-full bg-[#16A085] hover:bg-[#138f7a] text-white"
              >
                Create Agent
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Optimization */}
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-[#16A085]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Route className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Route Optimization</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Optimize employee routes and schedules based on customer locations for maximum efficiency
                </p>
              </div>
              <Button
                onClick={() => handleTileClick("route-optimization")}
                className="w-full bg-[#16A085] hover:bg-[#138f7a] text-white"
              >
                Optimize Routes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showProfessionalIdModal} onOpenChange={setShowProfessionalIdModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Professional ID Required</DialogTitle>
            <DialogDescription>To proceed, please enter your Professional ID.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professionalId" className="text-right">
                Professional ID
              </Label>
              <Input
                type="text"
                id="professionalId"
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleContinue} className="bg-[#16A085] hover:bg-[#138f7a] text-white">
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProSetupPage
