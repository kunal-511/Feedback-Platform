import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, userOwnsForm } from '@/lib/auth'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']),
})

// PUT /api/forms/[id]/status - Update form status
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

    const validationResult = statusUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid status value',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { status } = validationResult.data

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: { status },
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
      ...updatedForm,
      responseCount: updatedForm.responses.length,
      responses: undefined,
    }

    const statusMessages = {
      DRAFT: 'Form saved as draft',
      ACTIVE: 'Form published successfully',
      INACTIVE: 'Form unpublished',
    }

    return NextResponse.json({
      message: statusMessages[status],
      form: formWithResponseCount,
    })

  } catch (error) {
    console.error('Error updating form status:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 