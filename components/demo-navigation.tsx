"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Brain, UserCheck, Eye, RotateCcw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function DemoNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  const getCurrentView = () => {
    if (pathname.includes("/concierge")) return "customer"
    if (pathname.includes("/admin")) return "admin"
    if (pathname.includes("/pro")) return "professional"
    return "demo"
  }

  const currentView = getCurrentView()

  const views = [
    {
      id: "customer",
      label: "Customer View",
      icon: Heart,
      path: "/concierge",
      color: "bg-pink-500",
      description: "Pet owner experience",
    },
    {
      id: "admin",
      label: "Admin View",
      icon: Brain,
      path: "/admin/concierge",
      color: "bg-blue-500",
      description: "Concierge dashboard",
    },
    {
      id: "professional",
      label: "Professional View",
      icon: UserCheck,
      path: "/pro/opportunities",
      color: "bg-green-500",
      description: "Professional portal",
    },
  ]

  if (pathname === "/demo") return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="border-2 border-[#E75837] shadow-lg bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-[#E75837] text-white body-font">
              <Eye className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>

            <div className="flex items-center gap-2">
              {views.map((view) => {
                const IconComponent = view.icon
                const isActive = currentView === view.id

                return (
                  <Button
                    key={view.id}
                    onClick={() => router.push(view.path)}
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={`${
                      isActive
                        ? `${view.color} text-white hover:opacity-90`
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    } body-font transition-all duration-200`}
                  >
                    <IconComponent className="w-4 h-4 mr-1" />
                    {view.label}
                  </Button>
                )
              })}
            </div>

            <div className="border-l border-gray-300 pl-3 ml-2">
              <Button
                onClick={() => router.push("/demo")}
                size="sm"
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 body-font"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Demo Home
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 body-font mb-2">Current scenario:</p>
              <p className="text-sm font-medium text-gray-700 body-font">
                Luna (German Shepherd) needs post-surgical care in Lincoln Park, Chicago
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
