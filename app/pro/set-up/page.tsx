"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Route } from "lucide-react"
import User from "lucide-react/dist/esm/icons/User" // Import User component

const ProSetupPage = () => {
  const router = useRouter()
  const [professionalId, setProfessionalId] = useState("")
  const [showProfessionalIdModal, setShowProfessionalIdModal] = useState(false)
  const [selectedTile, setSelectedTile] = useState<string | null>(null)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [routeProfessionalId, setRouteProfessionalId] = useState("")
  const [routeError, setRouteError] = useState("")

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

  const handleRouteClick = () => {
    setShowRouteModal(true)
    setRouteError("")
    setRouteProfessionalId("")
  }

  const handleCloseRouteModal = () => {
    setShowRouteModal(false)
    setRouteError("")
    setRouteProfessionalId("")
  }

  const handleRouteSubmit = () => {
    if (!routeProfessionalId.trim()) {
      setRouteError("Please enter your Professional ID")
      return
    }

    // Navigate directly to route optimization page
    router.push(`/pro/route-optimization/${routeProfessionalId.trim()}`)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6 text-center">Pro Setup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Route Optimization Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 header-font">Route Optimization</h3>
            <p className="text-gray-600 mb-4 body-font">
              Enter your Professional ID to access intelligent route optimization. This will analyze your bookings and
              employee data to create the most efficient daily routes.
            </p>

            <div className="mb-4">
              <Label htmlFor="routeProfId" className="body-font">
                Professional ID *
              </Label>
              <Input
                id="routeProfId"
                value={routeProfessionalId}
                onChange={(e) => setRouteProfessionalId(e.target.value)}
                placeholder="e.g., 22, 151, etc."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A085] body-font"
              />
              {routeError && <p className="mt-2 text-sm text-red-600 body-font">{routeError}</p>}
              <p className="text-xs text-gray-500 mt-2 body-font">
                This will load your bookings and employee data to create optimized routes and schedules.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseRouteModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors body-font"
              >
                Cancel
              </button>
              <button
                onClick={handleRouteSubmit}
                disabled={!routeProfessionalId.trim()}
                className="px-6 py-2 bg-[#16A085] text-white rounded-lg hover:bg-[#138f7a] transition-colors body-font flex items-center disabled:opacity-50"
              >
                <Route className="h-4 w-4 mr-2" />
                Optimize Routes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProSetupPage
