"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Star, MessageSquare, CheckCircle, AlertCircle, Info, BarChart3 } from "lucide-react"

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

interface ResponsesContentProps {
  questions: Question[]
  responses: ResponseData[]
  analytics: Analytics
  questionSummaries: Record<string, Record<string, number>>
  totalResponses: number
}

export function ResponsesContent({
  questions,
  responses,
  analytics,
  questionSummaries,
  totalResponses,
}: ResponsesContentProps) {
  const [activeTab, setActiveTab] = useState("responses")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = Object.values(response.answers).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterBy === "all" || response.sentiment === filterBy
    return matchesSearch && matchesFilter
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50"
      case "negative":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="h-3 w-3" />
      case "negative":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-3">
              <TabsTrigger value="responses" className="text-xs sm:text-sm">
                All Responses
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="summary" className="text-xs sm:text-sm">
                Summary
              </TabsTrigger>
            </TabsList>
            {activeTab === "responses" && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 text-sm"
                  />
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Responses</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="responses" className="mt-6">
            <div className="block sm:hidden space-y-4">
              {filteredResponses.map((response) => (
                <Card key={response.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getSentimentColor(response.sentiment)}`}>
                          {getSentimentIcon(response.sentiment)}
                          <span className="ml-1 capitalize">{response.sentiment}</span>
                        </Badge>
                        {response.rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < response.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{response.timeAgo}</span>
                    </div>
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div key={question.id} className="border-l-2 border-gray-100 pl-3">
                          <p className="text-xs text-gray-500 mb-1 font-medium">{question.questionText}</p>
                          <p className="text-sm text-gray-900">{response.answers[question.id] || "No response"}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden sm:block">
              <ScrollArea className="w-full">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Submitted</TableHead>
                        <TableHead className="w-24">Sentiment</TableHead>
                        <TableHead className="w-24">Rating</TableHead>
                        {questions.map((question) => (
                          <TableHead key={question.id} className="min-w-40">
                            <div className="truncate" title={question.questionText}>
                              {question.questionText}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResponses.map((response) => (
                        <TableRow key={response.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-sm">
                            <div>
                              <div>{response.timeAgo}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(response.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${getSentimentColor(response.sentiment)}`}>
                              {getSentimentIcon(response.sentiment)}
                              <span className="ml-1 capitalize">{response.sentiment}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {response.rating ? (
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < response.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm ml-1">({response.rating})</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No rating</span>
                            )}
                          </TableCell>
                          {questions.map((question) => (
                            <TableCell key={question.id} className="text-sm">
                              <div className="max-w-xs">
                                <div className="truncate" title={response.answers[question.id] || "No response"}>
                                  {response.answers[question.id] || "-"}
                                </div>
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>

            {filteredResponses.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterBy !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Responses will appear here once people start submitting feedback."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                  <CardDescription>Overall sentiment of responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Positive</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${analytics.sentimentBreakdown.positive}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{analytics.sentimentBreakdown.positive}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Neutral</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${analytics.sentimentBreakdown.neutral}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{analytics.sentimentBreakdown.neutral}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Negative</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${analytics.sentimentBreakdown.negative}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{analytics.sentimentBreakdown.negative}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Keywords</CardTitle>
                  <CardDescription>Most mentioned words in responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topKeywords.length > 0 ? (
                      analytics.topKeywords.map((keyword: string, index: number) => (
                        <Badge key={`${keyword}-${index}`} variant="secondary" className="text-sm">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No keywords found</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <div className="grid gap-6">
              {questions
                .filter((q) => q.questionType === "MULTIPLE_CHOICE" || q.questionType === "RATING")
                .map((question) => {
                  const questionSummary = questionSummaries[question.id] || {}
                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{question.questionText}</CardTitle>
                        <CardDescription>
                          {totalResponses} responses •{" "}
                          {question.questionType === "RATING" ? "Rating" : "Multiple choice"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(questionSummary).map(([option, count]) => (
                            <div key={option} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <span className="font-medium text-sm sm:text-base truncate">
                                  {question.questionType === "RATING"
                                    ? `${option} star${option !== "1" ? "s" : ""}`
                                    : option}
                                </span>
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {count} responses
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-3 flex-shrink-0">
                                <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: totalResponses > 0 ? `${(count / totalResponses) * 100}%` : "0%",
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8 text-right">
                                  {totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              {questions.filter((q) => q.questionType === "MULTIPLE_CHOICE" || q.questionType === "RATING").length ===
                0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Summary Data</h3>
                    <p className="text-gray-600">
                      Summary statistics are only available for multiple choice and rating questions.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
}
