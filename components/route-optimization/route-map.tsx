import type { OptimizedRoute } from "@/types/geo-scheduling"

interface RouteMapProps {
  routes: OptimizedRoute[]
}

export default function RouteMap({ routes }: RouteMapProps) {
  const colors = ["#E75837", "#16A085", "#745E25", "#94ABD6", "#8E44AD", "#E67E22"]

  // Calculate map bounds
  const allCoordinates = routes.flatMap((route) => [...route.bookings.map((booking) => booking.location.coordinates)])

  if (allCoordinates.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No routes to display</p>
      </div>
    )
  }

  const minLat = Math.min(...allCoordinates.map((c) => c.lat))
  const maxLat = Math.max(...allCoordinates.map((c) => c.lat))
  const minLng = Math.min(...allCoordinates.map((c) => c.lng))
  const maxLng = Math.max(...allCoordinates.map((c) => c.lng))

  const mapWidth = 800
  const mapHeight = 600
  const padding = 50

  const scaleX = (mapWidth - 2 * padding) / (maxLng - minLng)
  const scaleY = (mapHeight - 2 * padding) / (maxLat - minLat)

  const projectCoordinate = (lat: number, lng: number) => ({
    x: padding + (lng - minLng) * scaleX,
    y: mapHeight - padding - (lat - minLat) * scaleY,
  })

  return (
    <div className="w-full">
      <svg width={mapWidth} height={mapHeight} className="border rounded-lg bg-gray-50">
        {/* Routes */}
        {routes.map((route, routeIndex) => {
          const color = colors[routeIndex % colors.length]
          const points = route.bookings.map((booking) =>
            projectCoordinate(booking.location.coordinates.lat, booking.location.coordinates.lng),
          )

          return (
            <g key={route.employeeId}>
              {/* Route lines */}
              {points.map((point, index) => {
                if (index === 0) return null
                const prevPoint = points[index - 1]
                return (
                  <line
                    key={index}
                    x1={prevPoint.x}
                    y1={prevPoint.y}
                    x2={point.x}
                    y2={point.y}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )
              })}

              {/* Booking markers */}
              {route.bookings.map((booking, index) => {
                const point = projectCoordinate(booking.location.coordinates.lat, booking.location.coordinates.lng)
                return (
                  <g key={booking.id}>
                    <circle cx={point.x} cy={point.y} r="8" fill={color} stroke="white" strokeWidth="2" />
                    <text x={point.x} y={point.y + 4} textAnchor="middle" className="text-xs font-bold fill-white">
                      {index + 1}
                    </text>

                    {/* Tooltip */}
                    <title>
                      {booking.customerName} - {booking.serviceType}
                      {"\n"}
                      {booking.location.address}
                      {"\n"}
                      {booking.startTime}
                    </title>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, index) => (
          <div key={route.employeeId} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <div>
              <p className="font-medium">{route.employeeName}</p>
              <p className="text-sm text-gray-600">
                {route.bookings.length} stops • {route.efficiency}% efficient
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
