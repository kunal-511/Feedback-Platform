"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2, RefreshCw, Clock } from "lucide-react"

interface FormData {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  totalResponses: number
  lastResponse: string | null
}

interface ResponsesHeaderProps {
  form: FormData
  onBack: () => void
  onExport: () => void
  onRefresh: () => void
  isExporting: boolean
}

export function ResponsesHeader({ form, onBack, onExport, onRefresh, isExporting }: ResponsesHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
          <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0 mt-1">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{form.title}</h1>
                <Badge variant={form.status === "ACTIVE" ? "default" : "secondary"} className="flex-shrink-0">
                  {form.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">{form.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last response{" "}
                  {form.lastResponse ? new Date(form.lastResponse).toLocaleDateString() : "No responses yet"}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Created {new Date(form.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Button variant="outline" size="sm" className="bg-transparent">
              <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
            </Button>
            <Button size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
