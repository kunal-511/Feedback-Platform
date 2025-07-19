import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, userOwnsForm } from '@/lib/auth'
import { createObjectCsvWriter } from 'csv-writer'
import { promises as fs } from 'fs'
import path from 'path'
import { tmpdir } from 'os'

interface QuestionWithData {
  id: string
  questionText: string
  questionType: string
  orderIndex: number
}

interface AnswerWithQuestion {
  questionId: string
  answerText: string | null
  question: {
    id: string
    questionText: string
    questionType: string
    orderIndex: number
  }
}

interface ResponseWithAnswers {
  id: string
  submittedAt: Date
  answers: AnswerWithQuestion[]
}

interface FormWithData {
  id: string
  title: string
  questions: QuestionWithData[]
  responses: ResponseWithAnswers[]
}

// GET /api/forms/[id]/export - Export form responses as CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await validateSession()
    const resolvedParams = await params
    const formId = resolvedParams.id

    const hasAccess = await userOwnsForm(formId, userId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        responses: {
          include: {
            answers: {
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    orderIndex: true
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const csvBuffer = await generateCSV(form as FormWithData)
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.csv"`)

    return new NextResponse(csvBuffer, { headers })

  } catch (error) {
    console.error('Error exporting form responses:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateCSV(form: FormWithData): Promise<Buffer> {
  const tempDir = tmpdir()
  const tempFilePath = path.join(tempDir, `form_${form.id}_${Date.now()}.csv`)

  try {
    const headers = [
      { id: 'responseId', title: 'Response ID' },
      { id: 'submittedAt', title: 'Submitted At' },
      ...form.questions.map((q: QuestionWithData) => ({
        id: `question_${q.id}`,
        title: `${q.questionText}`
      }))
    ]

    const writer = createObjectCsvWriter({
      path: tempFilePath,
      header: headers,
      encoding: 'utf8'
    })

    const records = form.responses.map((response: ResponseWithAnswers) => {
      const answerMap: Record<string, string> = {}
      response.answers.forEach((answer: AnswerWithQuestion) => {
        answerMap[answer.questionId] = answer.answerText || ''
      })

      const record: Record<string, string> = {
        responseId: response.id,
        submittedAt: new Date(response.submittedAt).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })
      }

      form.questions.forEach((question: QuestionWithData) => {
        record[`question_${question.id}`] = answerMap[question.id] || ''
      })

      return record
    })

    await writer.writeRecords(records)

    const csvBuffer = await fs.readFile(tempFilePath)

    await fs.unlink(tempFilePath)

    return csvBuffer

  } catch (error) {
    try {
      await fs.unlink(tempFilePath)
    } catch {
    }
    throw error
  }
} 