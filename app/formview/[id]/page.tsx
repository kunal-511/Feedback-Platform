"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageSquare, Star, AlertCircle, Loader2 } from "lucide-react"
import SuccessPage from "@/components/forms/success-page"

interface Question {
  id: string
  questionText: string
  questionType: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'RATING'
  isRequired: boolean
  options: string[] | null
  orderIndex: number
}

interface FormData {
  id: string
  title: string
  description: string | null
  questions: Question[]
  author: {
    name: string
    company: string | null
  }
  createdAt: string
}

export default function PublicFormPage() {
  const params = useParams()
  const publicUrl = params.id as string 
  
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [ratings, setRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true)
        setError("")
        
        const response = await fetch(`/api/public/forms/${publicUrl}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Form not found or no longer available")
          } else {
            setError("Failed to load form")
          }
          return
        }
        
        const data = await response.json()
        setFormData(data)
      } catch (error) {
        console.error('Error fetching form:', error)
        setError("Failed to load form")
      } finally {
        setIsLoading(false)
      }
    }

    if (publicUrl) {
      fetchForm()
    }
  }, [publicUrl])

  const handleInputChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleRatingChange = (questionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }))
    setResponses((prev) => ({ ...prev, [questionId]: value.toString() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    if (!formData) return

    try {
      const requiredQuestions = formData.questions.filter(q => q.isRequired)
      const missingRequired = requiredQuestions.filter(q => !responses[q.id] || responses[q.id].trim() === '')
      
      if (missingRequired.length > 0) {
        setSubmitError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      const answers = Object.entries(responses)
        .filter(([, value]) => value.trim() !== '')
        .map(([questionId, answerText]) => ({
          questionId,
          answerText: answerText.trim()
        }))

      const response = await fetch(`/api/public/forms/${publicUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Form...</h2>
            <p className="text-gray-600">Please wait while we fetch the form.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Available</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  if (submitted) {
    return (
     <SuccessPage />
    )
  }

  if (!formData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{formData.title}</CardTitle>
            <CardDescription className="text-base">{formData.description}</CardDescription>
            {formData.author.company && (
              <p className="text-sm text-gray-500 mt-2">by {formData.author.company}</p>
            )}
          </CardHeader>
        </Card>


        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{submitError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.questions.map((question: Question, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                    {index + 1}
                  </span>
                  {question.questionText}
                  {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.questionType === "TEXT" && (
                  <Input
                    placeholder="Your answer..."
                    value={responses[question.id] || ""}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                  />
                )}

                {question.questionType === "TEXTAREA" && (
                  <Textarea
                    placeholder="Your answer..."
                    rows={4}
                    value={responses[question.id] || ""}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                  />
                )}

                {question.questionType === "MULTIPLE_CHOICE" && (
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleInputChange(question.id, value)}
                    required={question.isRequired}
                  >
                    {question.options?.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.questionType === "RATING" && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(question.id, star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= (ratings[question.id] || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Your responses are anonymous and will help us improve our service.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
