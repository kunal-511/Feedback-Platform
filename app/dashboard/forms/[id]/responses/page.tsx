"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { ResponsesHeader } from "@/components/dashboard/response/responses-header"
import { StatsCards } from "@/components/dashboard/response/stats-cards"
import { ResponsesContent } from "@/components/dashboard/response/responses-content"


interface FormData {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  totalResponses: number
  lastResponse: string | null
}

interface Question {
  id: string
  questionText: string
  questionType: string
  isRequired: boolean
  options?: string[] | null
  orderIndex: number
}

interface ResponseData {
  id: string
  submittedAt: string
  timeAgo: string
  ipAddress?: string
  userAgent?: string
  answers: Record<string, string>
  rating?: number | null
  sentiment: string
}

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

interface ApiResponse {
  form: FormData
  questions: Question[]
  responses: ResponseData[]
  analytics: Analytics
  questionSummaries: Record<string, Record<string, number>>
}

export default function ResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch(`/api/forms/${formId}/responses`)
      if (!response.ok) {
        throw new Error("Failed to fetch response data")
      }
      const responseData = await response.json()
      setData(responseData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load response data")
    } finally {
      setIsLoading(false)
    }
  }, [formId])

  const exportCSV = async () => {
    try {
      setIsExporting(true)
      const response = await fetch(`/api/forms/${formId}/export`)
      if (!response.ok) {
        throw new Error("Failed to export data")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data?.form.title || "form"}_responses.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      setError("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (formId) {
      fetchData()
    }
  }, [formId, fetchData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading response data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || "Failed to load response data"}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsesHeader
        form={data.form}
        onBack={() => router.back()}
        onExport={exportCSV}
        onRefresh={fetchData}
        isExporting={isExporting}
      />

      <div className="px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        <StatsCards totalResponses={data.form.totalResponses} analytics={data.analytics} />

        <ResponsesContent
          questions={data.questions}
          responses={data.responses}
          analytics={data.analytics}
          questionSummaries={data.questionSummaries}
          totalResponses={data.form.totalResponses}
        />
      </div>
    </div>
  )
}
