"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, BarChart3, Star, Clock } from "lucide-react"

interface Analytics {
  responseRate: number
  avgRating: number
  completionRate: number
  avgTimeToComplete: string
  topKeywords: string[]
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
}

interface StatsCardsProps {
  totalResponses: number
  analytics: Analytics
}

export function StatsCards({ totalResponses, analytics }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalResponses}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Real-time data
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.responseRate}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Form completion
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.avgRating || "N/A"}</p>
              <div className="flex items-center mt-1">
                {analytics.avgRating > 0 ? (
                  [...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(analytics.avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No ratings yet</span>
                )}
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Full responses
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
