import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, userOwnsForm } from '@/lib/auth'
import { z } from 'zod'

interface FormUpdateData {
  title?: string
  description?: string
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
}

const updateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
  questions: z.array(z.object({
    id: z.string().optional(),
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.enum(['TEXT', 'TEXTAREA', 'MULTIPLE_CHOICE', 'RATING']),
    isRequired: z.boolean(),
    options: z.array(z.string()).optional(),
    orderIndex: z.number(),
  })).optional(),
})

// GET /api/forms/[id] - Get a specific form
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
          select: { id: true },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const formWithResponseCount = {
      ...form,
      responseCount: form.responses.length,
      responses: undefined,
    }

    return NextResponse.json(formWithResponseCount)

  } catch (error) {
    console.error('Error fetching form:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/forms/[id] - Update a specific form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await validateSession()
    const resolvedParams = await params
    const formId = resolvedParams.id
    const body = await request.json()

    const hasAccess = await userOwnsForm(formId, userId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    const validationResult = updateFormSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { title, description, status, questions } = validationResult.data

    await prisma.$transaction(async (tx) => {
      const formUpdate: FormUpdateData = {}
      if (title !== undefined) formUpdate.title = title
      if (description !== undefined) formUpdate.description = description
      if (status !== undefined) formUpdate.status = status

      await tx.form.update({
        where: { id: formId },
        data: formUpdate,
      })

      if (questions) {
        await tx.question.deleteMany({
          where: { formId },
        })

         const questionPromises = questions.map((question, index) =>
           tx.question.create({
             data: {
               formId,
               questionText: question.questionText,
               questionType: question.questionType,
               isRequired: question.isRequired,
               options: question.options ? question.options : undefined,
               orderIndex: question.orderIndex || index,
             },
           })
         )

        await Promise.all(questionPromises)
      }
    })

    const completeForm = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        responses: {
          select: { id: true },
        },
      },
    })

    const formWithResponseCount = {
      ...completeForm,
      responseCount: completeForm?.responses.length || 0,
      responses: undefined,
    }

    return NextResponse.json({
      message: 'Form updated successfully',
      form: formWithResponseCount,
    })

  } catch (error) {
    console.error('Error updating form:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[id] - Delete a specific form
export async function DELETE(
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

    await prisma.form.delete({
      where: { id: formId },
    })

    return NextResponse.json({
      message: 'Form deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting form:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 