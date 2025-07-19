"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageSquare, Users, BarChart3, LogOut,  Trash2, Link2, Copy, Check } from "lucide-react"
import Preview from "@/components/dashboard/preview"

interface Form {
  id: string
  title: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
  publicUrl: string
  createdAt: string
  responseCount: number
}

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState("")
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null)

  const fetchForms = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch('/api/forms')
      if (!response.ok) {
        throw new Error('Failed to fetch forms')
      }

      const formsData = await response.json()
      setForms(formsData)
    } catch (error) {
      console.error('Error fetching forms:', error)
      setError('Failed to load forms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete form')
      }

      setForms(forms.filter(form => form.id !== formId))
    } catch (error) {
      console.error('Error deleting form:', error)
      setError('Failed to delete form')
    }
  }

  const handleToggleStatus = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    try {
      const response = await fetch(`/api/forms/${formId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update form status')
      }

      const result = await response.json()

      setForms(forms.map(form =>
        form.id === formId
          ? { ...form, status: result.form.status }
          : form
      ))
    } catch (error) {
      console.error('Error updating form status:', error)
      setError('Failed to update form status')
    }
  }

  const handleCopyLink = async (form: Form) => {
    if (form.status !== 'ACTIVE') {
      setError('Form must be published to share the link')
      return
    }

    try {
      const publicUrl = `${window.location.origin}/formview/${form.publicUrl}`
      await navigator.clipboard.writeText(publicUrl)
      setCopiedFormId(form.id)


      setTimeout(() => {
        setCopiedFormId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      setError('Failed to copy link to clipboard')
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FeedbackHub</span>
          </div>
          <div className="flex items-center space-x-4 ">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">Active feedback forms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.reduce((sum, form) => sum + form.responseCount, 0)}</div>
              <p className="text-xs text-muted-foreground">Feedback submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forms.length > 0 && forms.reduce((sum, form) => sum + form.responseCount, 0) > 0
                  ? Math.round((forms.reduce((sum, form) => sum + form.responseCount, 0) / (forms.length * 10)) * 100) + '%'
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">Estimated response rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Forms</h1>
          <Button asChild>
            <Link href="/dashboard/forms/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchForms}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-6">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{form.title}</CardTitle>
                      <CardDescription className="mt-2">{form.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={form.status === "ACTIVE" ? "default" : "secondary"}>
                        {form.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {form.status === 'ACTIVE' ? (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 mb-1">Public Form URL</p>
                          <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded break-all">
                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/formview/${form.publicUrl}`}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(form)}
                          className="ml-2 h-8 w-8 p-0"
                          title="Copy link to clipboard"
                        >
                          {copiedFormId === form.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Link2 className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Form Link</p>
                          <p className="text-xs text-gray-500">Publish this form to generate a public sharing link</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <span>{form.responseCount} responses</span>
                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/forms/${form.id}/responses`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Responses
                        </Link>
                      </Button>
                       <Preview form={form} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(form)}
                        disabled={form.status !== 'ACTIVE'}
                        className={form.status !== 'ACTIVE' ? 'opacity-50' : ''}
                      >
                        {copiedFormId === form.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(form.id, form.status)}
                      >
                        {form.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                      </Button>
                    
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-red-600 hover:text-red-700 hover:cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && forms.length === 0 && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-4">Create your first feedback form to get started.</p>
              <Button asChild>
                <Link href="/dashboard/forms/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
