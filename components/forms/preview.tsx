import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlignLeft, ArrowLeft, CheckSquare, Save, Star, Type } from "lucide-react"
import { Question } from '@/app/dashboard/forms/create/page'

interface FormData {
  title: string
  description: string
}
const questionTypes = [
  { value: "text", label: "Short Text", icon: Type, description: "Single line text input" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
  { value: "multiple-choice", label: "Multiple Choice", icon: CheckSquare, description: "Radio button options" },
  { value: "rating", label: "Rating", icon: Star, description: "1-5 star rating" },
]

interface PreviewProps {
  setPreviewMode: (mode: boolean) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  formData: FormData
  questions: Question[]
}


const Preview: React.FC<PreviewProps> = ({ setPreviewMode, handleSubmit, isLoading, formData, questions }) => {
  const getQuestionIcon = (type: string) => {
    const questionType = questionTypes.find((t) => t.value === type)
    return questionType?.icon || Type
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)}>
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Editor</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <Badge variant="secondary" className="text-xs">
                Preview
              </Badge>
            </div>
            <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{isLoading ? "Creating..." : "Save Form"}</span>
              <span className="sm:hidden">{isLoading ? "..." : "Save"}</span>
            </Button>
          </div>
        </header>
      <div className="px-4 py-6 sm:py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">{formData.title || "Untitled Form"}</CardTitle>
            {formData.description && (
              <CardDescription className="text-sm sm:text-base">{formData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {questions.map((question, index) => {
              const Icon = getQuestionIcon(question.type)
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
                          {question.question || `Question ${index + 1}`}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="ml-8 sm:ml-10">
                    {question.type === "text" && <Input placeholder={question.placeholder} disabled />}

                    {question.type === "textarea" && (
                      <Textarea placeholder={question.placeholder} rows={3} disabled />
                    )}

                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {(question.options || ["Option 1", "Option 2"]).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                            <span className="text-sm sm:text-base text-gray-700">
                              {option || `Option ${optionIndex + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === "rating" && (
                      <div className="flex space-x-1 sm:space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <Button className="w-full mt-6 sm:mt-8" disabled>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Preview
