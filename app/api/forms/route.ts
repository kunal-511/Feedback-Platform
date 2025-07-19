import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  questions: z.array(z.object({
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.enum(['TEXT', 'TEXTAREA', 'MULTIPLE_CHOICE', 'RATING']),
    isRequired: z.boolean(),
    options: z.array(z.string()).optional(),
    orderIndex: z.number(),
  })).min(1, 'At least one question is required'),
})

// GET /api/forms - Get all forms for the authenticated user
export async function GET() {
  try {
    const userId = await validateSession()

    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        responses: {
          select: { id: true }, 
        },
      },
      orderBy: { createdAt: 'desc' },
    })


    const formsWithResponseCount = forms.map(form => ({
      ...form,
      responseCount: form.responses.length,
      responses: undefined, 
    }))

    return NextResponse.json(formsWithResponseCount)

  } catch (error) {
    console.error('Error fetching forms:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const userId = await validateSession()
    const body = await request.json()

    const validationResult = createFormSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { title, description, questions } = validationResult.data

    const publicUrl = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uuidv4().substring(0, 8)}`

    const form = await prisma.$transaction(async (tx) => {
      const newForm = await tx.form.create({
        data: {
          title,
          description: description || null,
          userId,
          publicUrl,
          status: 'DRAFT',
        },
      })

      const questionPromises = questions.map((question, index) =>
        tx.question.create({
          data: {
            formId: newForm.id,
            questionText: question.questionText,
            questionType: question.questionType,
            isRequired: question.isRequired,
            options: question.options || undefined,
            orderIndex: question.orderIndex || index,
          },
        })
      )

      await Promise.all(questionPromises)

      return newForm
    })

    const completeForm = await prisma.form.findUnique({
      where: { id: form.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Form created successfully',
        form: completeForm,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating form:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 