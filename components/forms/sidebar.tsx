import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Question } from '@/app/dashboard/forms/create/page'
interface FormData {
    title: string
    description: string
  }
  

const Sidebar = ({questions,formData}:{questions:Question[],formData:FormData}) => {
  return (
    <div className="space-y-6">
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Form Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Questions</span>
          <Badge variant="secondary" className="text-xs">
            {questions.length}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Required fields</span>
          <Badge variant="secondary" className="text-xs">
            {questions.filter((q) => q.required).length}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estimated time</span>
          <Badge variant="secondary" className="text-xs">
            {Math.max(1, Math.ceil(questions.length * 0.5))} min
          </Badge>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-sm font-medium">Completion Progress</Label>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (formData.title ? 30 : 0) + questions.filter((q) => q.question).length * 15)}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {formData.title ? "Title added" : "Add a title"} • {questions.filter((q) => q.question).length} questions
            completed
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
          Pro Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-gray-600">
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <p>Keep questions clear and specific for better responses</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <p>Mix different question types to keep users engaged</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <p>Use rating questions for quantitative feedback</p>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <p>Preview your form before publishing</p>
        </div>
      </CardContent>
    </Card>
  </div>
  )
}

export default Sidebar
