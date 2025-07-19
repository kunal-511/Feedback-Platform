import React, { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Star, Loader2, Type, AlignLeft, CheckSquare } from "lucide-react"

interface Question {
  id: string
  questionText: string
  questionType: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'RATING'
  isRequired: boolean
  options?: string[] | null
  orderIndex: number
}

interface FormWithQuestions {
  id: string
  title: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  publicUrl: string
  createdAt: string
  responseCount: number
  questions?: Question[]
}

interface PreviewProps {
  form: {
    id: string
    title: string
    description: string | null
    status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
    publicUrl: string
    createdAt: string
    responseCount: number
  }
}

const Preview: React.FC<PreviewProps> = ({ form }) => {
  const [formData, setFormData] = useState<FormWithQuestions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchFormDetails = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/forms/${form.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch form details')
      }
      
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Error fetching form details:', error)
      setError("Failed to load form preview")
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return Type
      case 'TEXTAREA':
        return AlignLeft
      case 'MULTIPLE_CHOICE':
        return CheckSquare
      case 'RATING':
        return Star
      default:
        return Type
    }
  }

  const renderQuestion = (question: Question, index: number) => {
    const Icon = getQuestionIcon(question.questionType)
    
    return (
      <div key={question.id} className="space-y-3">
        <div className="flex items-start space-x-3">
          <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-2">
              <Icon className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <Label className="text-sm sm:text-base font-medium leading-tight">
                {question.questionText}
                {question.isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
          </div>
        </div>

        <div className="ml-8 sm:ml-10">
          {question.questionType === "TEXT" && (
            <Input placeholder="Enter your answer..." disabled />
          )}

          {question.questionType === "TEXTAREA" && (
            <Textarea placeholder="Enter your answer..." rows={3} disabled />
          )}

          {question.questionType === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {(question.options || ["Option 1", "Option 2"]).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                  <span className="text-sm sm:text-base text-gray-700">
                    {option}
                  </span>
                </div>
              ))}
            </div>
          )}

          {question.questionType === "RATING" && (
            <div className="flex space-x-1 sm:space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" onClick={fetchFormDetails}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </SheetTrigger>
             <SheetContent className="overflow-y-auto" style={{ width: '85vw', maxWidth: '85vw' }}>
        <SheetHeader>
          <SheetTitle>Form Preview</SheetTitle>
          <SheetDescription>
            This is how your form will appear to respondents
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading preview...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchFormDetails}>
                Try Again
              </Button>
            </div>
          ) : formData ? (
            <div className="min-h-screen bg-gray-50 p-4">
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl sm:text-2xl">{formData.title}</CardTitle>
                  {formData.description && (
                    <CardDescription className="text-sm sm:text-base">
                      {formData.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {formData.questions && formData.questions.length > 0 ? (
                    formData.questions
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((question, index) => renderQuestion(question, index))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No questions added to this form yet
                    </div>
                  )}
                  <Button className="w-full mt-6 sm:mt-8" disabled>
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Click to load preview
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Preview
