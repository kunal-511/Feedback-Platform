import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageSquare, Star, ArrowLeft } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FeedbackHub</span>
            <Badge variant="secondary">Demo</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Demo Form Preview</h2>
              <p className="text-blue-700 text-sm">
                This is a sample feedback form to demonstrate how FeedbackHub works. All fields are for preview only.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Customer Satisfaction Survey</CardTitle>
              <CardDescription className="text-base">
                Help us improve our service by sharing your feedback
              </CardDescription>
            </CardHeader>
          </Card>


          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                    1
                  </span>
                  What is your name?
                  <span className="text-red-500 ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Your answer..." disabled />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                    2
                  </span>
                  How would you rate our service?
                  <span className="text-red-500 ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup disabled>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" disabled />
                    <Label htmlFor="excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" disabled />
                    <Label htmlFor="good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average" id="average" disabled />
                    <Label htmlFor="average">Average</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" disabled />
                    <Label htmlFor="poor">Poor</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                    3
                  </span>
                  Rate your overall experience (1-5 stars)
                  <span className="text-red-500 ml-1">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 text-gray-300 cursor-not-allowed" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                    4
                  </span>
                  Any additional comments or suggestions?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Your answer..." rows={4} disabled />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" size="lg" disabled>
                  Submit Feedback
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  This is a demo form - submissions are not processed
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to create your own feedback forms?</h3>
              <p className="mb-4 opacity-90">Start collecting valuable feedback from your customers in minutes</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
