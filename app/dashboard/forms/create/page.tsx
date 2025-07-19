"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Eye,
  GripVertical,
  Type,
  AlignLeft,
  CheckSquare,
  Star,
  Settings,
  Sparkles,
  Copy,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Preview from "@/components/forms/preview"
import Sidebar from "@/components/forms/sidebar"

export interface Question {
  id: string
  type: "text" | "textarea" | "multiple-choice" | "rating"
  question: string
  required: boolean
  options?: string[]
  placeholder?: string
}

const questionTypes = [
  { value: "text", label: "Short Text", icon: Type, description: "Single line text input" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
  { value: "multiple-choice", label: "Multiple Choice", icon: CheckSquare, description: "Radio button options" },
  { value: "rating", label: "Rating", icon: Star, description: "1-5 star rating" },
]

export default function CreateFormPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(1)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      type: "text",
      question: "",
      required: true,
      placeholder: "Enter your answer...",
    },
  ])

  const [previewMode, setPreviewMode] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "text",
      question: "",
      required: false,
      placeholder: "Enter your answer...",
    }
    setQuestions([...questions, newQuestion])
    setExpandedQuestion(newQuestion.id)
  }

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find((q) => q.id === id)
    if (questionToDuplicate) {
      const newQuestion: Question = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        question: questionToDuplicate.question + " (Copy)",
      }
      const index = questions.findIndex((q) => q.id === id)
      const newQuestions = [...questions]
      newQuestions.splice(index + 1, 0, newQuestion)
      setQuestions(newQuestions)
      setExpandedQuestion(newQuestion.id)
    }
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
      if (expandedQuestion === id) {
        setExpandedQuestion(null)
      }
    }
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      const options = question.options || []
      updateQuestion(questionId, { options: [...options, ""] })
    }
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId)
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex)
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.title.trim()) {
      setError("Form title is required")
      setIsLoading(false)
      return
    }

    const validQuestions = questions.filter(q => q.question.trim() !== "")
    if (validQuestions.length === 0) {
      setError("At least one question is required")
      setIsLoading(false)
      return
    }

    try {
      const apiQuestions = validQuestions.map((q, index) => ({
        questionText: q.question,
        questionType: q.type.toUpperCase().replace('-', '_') as 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'RATING',
        isRequired: q.required,
        options: q.type === 'multiple-choice' ? q.options?.filter(opt => opt.trim() !== "") : undefined,
        orderIndex: index,
      }))

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          questions: apiQuestions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create form')
      }

      await response.json()
      
      router.push("/dashboard")
      
    } catch (error) {
      console.error('Error creating form:', error)
      setError(error instanceof Error ? error.message : 'Failed to create form')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId)
  }


  if (previewMode) {
    return (
    <Preview setPreviewMode={setPreviewMode} handleSubmit={handleSubmit} isLoading={isLoading} formData={formData} questions={questions} />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate">Create New Form</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Build your feedback form step by step</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Form Overview</SheetTitle>
                  <SheetDescription>Track your progress and get helpful tips</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Sidebar questions={questions} formData={formData} />
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
                          <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isLoading ? "Creating..." : "Save"}</span>
              </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
              <div
                className={`flex items-center space-x-2 flex-shrink-0 ${activeStep >= 1 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    activeStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="font-medium text-sm sm:text-base whitespace-nowrap">Form Details</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 min-w-4"></div>
              <div
                className={`flex items-center space-x-2 flex-shrink-0 ${activeStep >= 2 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    activeStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="font-medium text-sm sm:text-base whitespace-nowrap">Add Questions</span>
              </div>
            </div>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <CardTitle className="text-lg sm:text-xl">Form Details</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Give your form a title and description to help users understand its purpose
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Form Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Customer Satisfaction Survey"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value })
                      if (e.target.value && activeStep < 2) setActiveStep(2)
                    }}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this form is for..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Questions</CardTitle>
                      <CardDescription className="text-sm">
                        Add 3-5 questions to collect meaningful feedback
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                    {questions.length}/5   
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="group relative">
                    <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-400 cursor-move">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Q{index + 1}
                            </Badge>
                            <div className="flex items-center space-x-2 min-w-0">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                              />
                              <Label className="text-xs sm:text-sm whitespace-nowrap">Required</Label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestionExpansion(question.id)}
                              className="sm:hidden"
                            >
                              {expandedQuestion === question.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="hidden sm:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateQuestion(question.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {questions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(question.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex sm:hidden items-center space-x-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateQuestion(question.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {questions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(question.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`space-y-4 ${expandedQuestion === question.id ? "block" : "hidden sm:block"}`}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: Question["type"]) =>
                                  updateQuestion(question.id, { type: value })
                                }
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => {
                                    const Icon = type.icon
                                    return (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center space-x-2">
                                          <Icon className="h-4 w-4" />
                                          <div>
                                            <div className="font-medium text-sm">{type.label}</div>
                                            <div className="text-xs text-gray-500 hidden sm:block">
                                              {type.description}
                                            </div>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Placeholder Text</Label>
                              <Input
                                placeholder="Enter placeholder..."
                                value={question.placeholder || ""}
                                onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Question Text *</Label>
                            <Input
                              placeholder="Enter your question..."
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                              className="text-sm sm:text-base"
                            />
                          </div>

                          {question.type === "multiple-choice" && (
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                                <Label className="text-sm font-medium">Answer Options</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(question.id)}
                                  disabled={(question.options?.length || 0) >= 6}
                                  className="self-start sm:self-auto"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {(question.options || ["", ""]).map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                                    <Input
                                      placeholder={`Option ${optionIndex + 1}`}
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                      className="flex-1 text-sm"
                                    />
                                    {(question.options?.length || 0) > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(question.id, optionIndex)}
                                        className="text-red-600 hover:text-red-700 flex-shrink-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {questions.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full h-12 sm:h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-transparent text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Add New Question
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="hidden lg:block">
            <Sidebar questions={questions} formData={formData} />
          </div>
        </div>
      </div>
    </div>
  )
}
