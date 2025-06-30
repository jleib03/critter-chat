"use client"

import { useState } from "react"
import type { OptimizedRoute } from "@/types/geo-scheduling"

interface RouteMapProps {
  routes: OptimizedRoute[]
}

export function RouteMap({ routes }: RouteMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  // Calculate map bounds
  const allLocations = routes.flatMap((route) => route.route_coordinates)

  if (allLocations.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No route data available</p>
      </div>
    )
  }

  const minLat = Math.min(...allLocations.map((loc) => loc.lat))
  const maxLat = Math.max(...allLocations.map((loc) => loc.lat))
  const minLng = Math.min(...allLocations.map((loc) => loc.lng))
  const maxLng = Math.max(...allLocations.map((loc) => loc.lng))

  const mapWidth = 800
  const mapHeight = 500
  const padding = 50

  // Convert lat/lng to SVG coordinates
  const latToY = (lat: number) => {
    return padding + ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 2 * padding)
  }

  const lngToX = (lng: number) => {
    return padding + ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 2 * padding)
  }

  const routeColors = ["#E75837", "#16A085", "#745E25", "#94ABD6", "#F39C12", "#8E44AD"]

  return (
    <div className="w-full">
      {/* Route Legend */}
      <div className="mb-4 flex flex-wrap gap-4">
        {routes.map((route, index) => (
          <button
            key={route.employee_id}
            onClick={() => setSelectedRoute(selectedRoute === route.employee_id ? null : route.employee_id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              selectedRoute === route.employee_id ? "bg-gray-100 border-gray-300" : "hover:bg-gray-50"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: routeColors[index % routeColors.length] }}
            />
            <span className="text-sm font-medium">{route.employee_name}</span>
            <span className="text-xs text-gray-500">({route.bookings.length} stops)</span>
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <svg width={mapWidth} height={mapHeight} className="w-full h-auto">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Routes */}
          {routes.map((route, routeIndex) => {
            const color = routeColors[routeIndex % routeColors.length]
            const isSelected = selectedRoute === null || selectedRoute === route.employee_id
            const opacity = isSelected ? 1 : 0.3

            return (
              <g key={route.employee_id} opacity={opacity}>
                {/* Route lines */}
                {route.route_coordinates.map((location, index) => {
                  if (index === route.route_coordinates.length - 1) return null

                  const nextLocation = route.route_coordinates[index + 1]
                  return (
                    <line
                      key={`${route.employee_id}-line-${index}`}
                      x1={lngToX(location.lng)}
                      y1={latToY(location.lat)}
                      x2={lngToX(nextLocation.lng)}
                      y2={latToY(nextLocation.lat)}
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray={index === 0 ? "5,5" : "none"}
                    />
                  )
                })}

                {/* Home base (first point) */}
                <circle
                  cx={lngToX(route.route_coordinates[0].lng)}
                  cy={latToY(route.route_coordinates[0].lat)}
                  r="8"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={lngToX(route.route_coordinates[0].lng)}
                  y={latToY(route.route_coordinates[0].lat)}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-xs font-bold fill-white"
                >
                  H
                </text>

                {/* Customer locations */}
                {route.bookings.map((booking, bookingIndex) => {
                  const location = booking.location
                  return (
                    <g key={`${route.employee_id}-booking-${bookingIndex}`}>
                      <circle
                        cx={lngToX(location.lng)}
                        cy={latToY(location.lat)}
                        r="6"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text
                        x={lngToX(location.lng)}
                        y={latToY(location.lat)}
                        textAnchor="middle"
                        dy="0.3em"
                        className="text-xs font-bold"
                        fill={color}
                      >
                        {bookingIndex + 1}
                      </text>

                      {/* Tooltip on hover */}
                      <title>
                        {booking.customer.first_name} {booking.customer.last_name}
                        {"\n"}
                        {booking.start_time} - {booking.end_time}
                        {"\n"}
                        {booking.services.join(", ")}
                        {"\n"}
                        {location.address}
                      </title>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
            <span className="text-xs font-bold text-white">H</span>
          </div>
          <span>Home Base</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400">1</span>
          </div>
          <span>Customer Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-gray-400"></div>
          <span>Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-0.5 bg-gray-400"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, transparent, transparent 3px, #9ca3af 3px, #9ca3af 6px)",
            }}
          ></div>
          <span>To First Stop</span>
        </div>
      </div>
    </div>
  )
}
