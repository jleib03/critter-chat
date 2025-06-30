"use client"

import { useEffect, useRef } from "react"
import type { RouteOptimization } from "@/types/geo-scheduling"

type RouteMapProps = {
  routes: RouteOptimization[]
  className?: string
}

// Color palette for different routes
const ROUTE_COLORS = [
  "#E75837", // Critter Orange
  "#16A085", // Teal
  "#745E25", // Brown
  "#94ABD6", // Light Blue
  "#8E44AD", // Purple
  "#E67E22", // Orange
  "#27AE60", // Green
  "#E74C3C", // Red
]

export function RouteMap({ routes, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return

    // For demo purposes, we'll create a simple SVG-based map
    // In production, you would integrate with Google Maps, Mapbox, or similar
    renderSVGMap()
  }, [routes])

  const renderSVGMap = () => {
    if (!mapRef.current) return

    // Calculate bounds from all route coordinates
    const allCoords = routes.flatMap((route) => route.route_coordinates)
    if (allCoords.length === 0) return

    const bounds = {
      minLat: Math.min(...allCoords.map((c) => c.lat)),
      maxLat: Math.max(...allCoords.map((c) => c.lat)),
      minLng: Math.min(...allCoords.map((c) => c.lng)),
      maxLng: Math.max(...allCoords.map((c) => c.lng)),
    }

    // Add padding to bounds
    const latPadding = (bounds.maxLat - bounds.minLat) * 0.1
    const lngPadding = (bounds.maxLng - bounds.minLng) * 0.1

    bounds.minLat -= latPadding
    bounds.maxLat += latPadding
    bounds.minLng -= lngPadding
    bounds.maxLng += lngPadding

    const mapWidth = 800
    const mapHeight = 600

    // Convert lat/lng to SVG coordinates
    const coordToSVG = (lat: number, lng: number) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapWidth
      const y = mapHeight - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * mapHeight
      return { x, y }
    }

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
    svg.style.background = "#f8f9fa"
    svg.style.border = "1px solid #e9ecef"
    svg.style.borderRadius = "8px"

    // Add grid lines for reference
    const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    gridGroup.setAttribute("stroke", "#e9ecef")
    gridGroup.setAttribute("stroke-width", "1")
    gridGroup.setAttribute("opacity", "0.5")

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      const x = (i / 10) * mapWidth
      line.setAttribute("x1", x.toString())
      line.setAttribute("y1", "0")
      line.setAttribute("x2", x.toString())
      line.setAttribute("y2", mapHeight.toString())
      gridGroup.appendChild(line)
    }

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      const y = (i / 10) * mapHeight
      line.setAttribute("x1", "0")
      line.setAttribute("y1", y.toString())
      line.setAttribute("x2", mapWidth.toString())
      line.setAttribute("y2", y.toString())
      gridGroup.appendChild(line)
    }

    svg.appendChild(gridGroup)

    // Draw routes
    routes.forEach((route, routeIndex) => {
      const color = ROUTE_COLORS[routeIndex % ROUTE_COLORS.length]

      if (route.route_coordinates.length === 0) return

      // Draw route line
      if (route.route_coordinates.length > 1) {
        const pathData = route.route_coordinates
          .map((coord, index) => {
            const { x, y } = coordToSVG(coord.lat, coord.lng)
            return `${index === 0 ? "M" : "L"} ${x} ${y}`
          })
          .join(" ")

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("d", pathData)
        path.setAttribute("stroke", color)
        path.setAttribute("stroke-width", "3")
        path.setAttribute("fill", "none")
        path.setAttribute("stroke-dasharray", "5,5")
        path.setAttribute("opacity", "0.8")
        svg.appendChild(path)
      }

      // Draw booking markers
      route.bookings.forEach((booking, bookingIndex) => {
        const { x, y } = coordToSVG(booking.location.lat, booking.location.lng)

        // Marker circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        circle.setAttribute("cx", x.toString())
        circle.setAttribute("cy", y.toString())
        circle.setAttribute("r", "8")
        circle.setAttribute("fill", color)
        circle.setAttribute("stroke", "white")
        circle.setAttribute("stroke-width", "2")
        svg.appendChild(circle)

        // Booking number
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("x", x.toString())
        text.setAttribute("y", (y + 4).toString())
        text.setAttribute("text-anchor", "middle")
        text.setAttribute("fill", "white")
        text.setAttribute("font-size", "10")
        text.setAttribute("font-weight", "bold")
        text.textContent = (bookingIndex + 1).toString()
        svg.appendChild(text)

        // Tooltip on hover
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
        title.textContent = `${booking.customer.first_name} ${booking.customer.last_name}\n${booking.location.address}\n${booking.services.join(", ")}\n${booking.start_time} - ${booking.end_time}`
        circle.appendChild(title)
      })

      // Add employee home base if available
      if (route.route_coordinates.length > 0) {
        const homeCoord = route.route_coordinates[0] // Assuming first coordinate is home base
        const { x, y } = coordToSVG(homeCoord.lat, homeCoord.lng)

        // Home base marker (square)
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        rect.setAttribute("x", (x - 6).toString())
        rect.setAttribute("y", (y - 6).toString())
        rect.setAttribute("width", "12")
        rect.setAttribute("height", "12")
        rect.setAttribute("fill", color)
        rect.setAttribute("stroke", "white")
        rect.setAttribute("stroke-width", "2")
        rect.setAttribute("opacity", "0.8")
        svg.appendChild(rect)

        const homeTitle = document.createElementNS("http://www.w3.org/2000/svg", "title")
        homeTitle.textContent = `${route.employee_name} - Home Base`
        rect.appendChild(homeTitle)
      }
    })

    // Clear previous content and add new SVG
    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(svg)
  }

  if (routes.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Routes to Display</h3>
          <p className="text-gray-600">Run route optimization to see employee routes on the map.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-96" />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border max-w-xs">
        <h4 className="font-medium text-sm mb-2">Route Legend</h4>
        <div className="space-y-1">
          {routes.map((route, index) => (
            <div key={route.employee_id} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: ROUTE_COLORS[index % ROUTE_COLORS.length] }}
              />
              <span className="truncate">{route.employee_name}</span>
              <span className="text-gray-500">({route.bookings.length})</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Customer Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400" />
            <span>Employee Home Base</span>
          </div>
        </div>
      </div>
    </div>
  )
}
