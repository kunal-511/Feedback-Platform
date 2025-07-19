import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formSubmissionLimiter, getClientIP } from '@/lib/rate-limit'
import { z } from 'zod'

const submitFormSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answerText: z.string().min(1, 'Answer cannot be empty'),
  })).min(1, 'At least one answer is required'),
})



// POST /api/public/forms/[publicUrl]/submit - Submit form response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicUrl: string }> }
) {
  try {
    const resolvedParams = await params
    const publicUrl = resolvedParams.publicUrl
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    const rateLimitResult = formSubmissionLimiter(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many submissions. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
          }
        }
      )
    }

    const body = await request.json()
    
    const validationResult = submitFormSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid submission data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { answers } = validationResult.data

  

    const form = await prisma.form.findFirst({
      where: { 
        publicUrl,
        status: 'ACTIVE'
      },
      include: {
        questions: true,
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or not available' },
        { status: 404 }
      )
    }

    const questionIds = form.questions.map(q => q.id)
    const answerQuestionIds = answers.map(a => a.questionId)
    
    const invalidQuestionIds = answerQuestionIds.filter(id => !questionIds.includes(id))
    if (invalidQuestionIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid question IDs in submission' },
        { status: 400 }
      )
    }
    const requiredQuestions = form.questions.filter(q => q.isRequired)
    const answeredQuestionIds = new Set(answerQuestionIds)
    
    const missingRequired = requiredQuestions.filter(q => !answeredQuestionIds.has(q.id))
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required answers',
          missingQuestions: missingRequired.map(q => ({
            id: q.id,
            questionText: q.questionText
          }))
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const response = await tx.response.create({
        data: {
          formId: form.id,
          ipAddress: clientIP,
          userAgent: userAgent,
        },
      })

      const answerPromises = answers.map(answer =>
        tx.answer.create({
          data: {
            responseId: response.id,
            questionId: answer.questionId,
            answerText: answer.answerText,
          },
        })
      )

      await Promise.all(answerPromises)

      return response
    })

    return NextResponse.json(
      {
        message: 'Response submitted successfully',
        responseId: result.id,
        submittedAt: result.submittedAt,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error submitting form response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 