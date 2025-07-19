import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/forms/[publicUrl] - Get public form by URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  try {
    const resolvedParams = await params
    const { publicUrl } = resolvedParams

    const form = await prisma.form.findFirst({
      where: { 
        publicUrl,
        status: 'ACTIVE' 
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        user: {
          select: {
            name: true,
            company: true,
          }
        }
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or not available' }, 
        { status: 404 }
      )
    }

    
    const publicFormData = {
      id: form.id,
      title: form.title,
      description: form.description,
      questions: form.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        isRequired: q.isRequired,
        options: q.options,
        orderIndex: q.orderIndex,
      })),
      author: {
        name: form.user.name,
        company: form.user.company,
      },
      createdAt: form.createdAt,
    }

    return NextResponse.json(publicFormData)

  } catch (error) {
    console.error('Error fetching public form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 