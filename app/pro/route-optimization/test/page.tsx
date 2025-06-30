"use client"

import Header from "@/components/header"
import { RouteTest } from "@/components/route-optimization/route-test"

export default function RouteOptimizationTestPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Header />

      <main className="pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Optimization Test</h1>
            <p className="text-gray-600">Test the route optimization functionality with sample data</p>
          </div>

          <RouteTest />
        </div>
      </main>
    </div>
  )
}
