import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, userOwnsForm } from '@/lib/auth'


interface Question {
  id: string
  questionText: string
  questionType: 'TEXT' | 'TEXTAREA' | 'MULTIPLE_CHOICE' | 'RATING'
  isRequired: boolean
  options: string[] | null
  orderIndex: number
}
// GET /api/forms/[id]/responses - Get form responses 
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

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const sentiment = url.searchParams.get('sentiment') || 'all'

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
                    questionText: true,
                    questionType: true,
                    options: true
                  }
                }
              }
            }
          },
          orderBy: { submittedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const totalResponses = await prisma.response.count({
      where: { formId }
    })

    const processedResponses = form.responses.map(response => {
      const answers: Record<string, string> = {}
      const textAnswers: string[] = []
      let hasRating = false
      let rating = 0

      response.answers.forEach(answer => {
        answers[answer.questionId] = answer.answerText || ''
        
        if (answer.question.questionType === 'TEXT' || answer.question.questionType === 'TEXTAREA') {
          if (answer.answerText) {
            textAnswers.push(answer.answerText.toLowerCase())
          }
        }

        if (answer.question.questionType === 'RATING' && answer.answerText) {
          hasRating = true
          rating = parseInt(answer.answerText) || 0
        }
      })

      const allText = textAnswers.join(' ')
      const positiveKeywords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'outstanding', 'satisfied', 'happy', 'good', 'nice', 'awesome', 'brilliant']
      const negativeKeywords = ['terrible', 'awful', 'horrible', 'hate', 'disgusting', 'poor', 'bad', 'disappointed', 'frustrated', 'angry', 'worst', 'useless', 'annoying']
      
      const positiveCount = positiveKeywords.filter(word => allText.includes(word)).length
      const negativeCount = negativeKeywords.filter(word => allText.includes(word)).length
      
      let sentiment = 'neutral'
      if (hasRating) {
        if (rating >= 4) sentiment = 'positive'
        else if (rating <= 2) sentiment = 'negative'
      } else if (positiveCount > negativeCount) {
        sentiment = 'positive'
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative'
      }

      return {
        id: response.id,
        submittedAt: response.submittedAt.toISOString(),
        timeAgo: getTimeAgo(response.submittedAt),
        ipAddress: response.ipAddress,
        userAgent: response.userAgent,
        answers,
        rating: hasRating ? rating : null,
        sentiment,
      }
    })

    let filteredResponses = processedResponses
    
    if (search) {
      filteredResponses = filteredResponses.filter(response =>
        Object.values(response.answers).join(' ').toLowerCase().includes(search.toLowerCase())
      )
    }

    if (sentiment !== 'all') {
      filteredResponses = filteredResponses.filter(response => response.sentiment === sentiment)
    }

    const analytics = await calculateAnalytics(formId, form.questions.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options as string[] : null
    })))

    const questionSummaries: Record<string, Record<string, number>> = {}
    
    for (const question of form.questions) {
      if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'RATING') {
        const answers = await prisma.answer.findMany({
          where: { 
            questionId: question.id,
            answerText: { not: null }
          },
          select: { answerText: true }
        })

        const summary: Record<string, number> = {}
        
        if (question.questionType === 'RATING') {
          for (let i = 1; i <= 5; i++) {
            summary[i.toString()] = 0
          }
          
          answers.forEach(answer => {
            const rating = answer.answerText || '0'
            if (summary[rating] !== undefined) {
              summary[rating]++
            }
          })
                 } else if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
           const options = Array.isArray(question.options) 
             ? question.options.filter((opt): opt is string => typeof opt === 'string')
             : []
           options.forEach(option => {
             summary[option] = 0
           })
          
          answers.forEach(answer => {
            const answerText = answer.answerText || ''
            if (summary[answerText] !== undefined) {
              summary[answerText]++
            }
          })
        }

        questionSummaries[question.id] = summary
      }
    }

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        status: form.status,
        createdAt: form.createdAt.toISOString(),
        totalResponses,
        lastResponse: form.responses[0]?.submittedAt?.toISOString() || null,
      },
      questions: form.questions,
      responses: filteredResponses,
      pagination: {
        page,
        limit,
        total: filteredResponses.length,
        totalPages: Math.ceil(filteredResponses.length / limit),
      },
      analytics,
      questionSummaries,
    })

  } catch (error) {
    console.error('Error fetching form responses:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized: No valid session') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateAnalytics(formId: string, questions: Question[]) {
  const totalResponses = await prisma.response.count({
    where: { formId }
  })

  if (totalResponses === 0) {
    return {
      responseRate: 0,
      avgRating: 0,
      completionRate: 100,
      avgTimeToComplete: 'N/A',
      topKeywords: [],
      sentimentBreakdown: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    }
  }

  let avgRating = 0
  const ratingQuestions = questions.filter(q => q.questionType === 'RATING')
  
  if (ratingQuestions.length > 0) {
    const ratingAnswers = await prisma.answer.findMany({
      where: {
        questionId: { in: ratingQuestions.map(q => q.id) },
        answerText: { not: null }
      }
    })

    const ratings = ratingAnswers
      .map(answer => parseInt(answer.answerText || '0'))
      .filter(rating => rating > 0)

    if (ratings.length > 0) {
      avgRating = Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
    }
  }

  const responsesWithAnswers = await prisma.response.count({
    where: {
      formId,
      answers: {
        some: {}
      }
    }
  })

  const completionRate = Math.round((responsesWithAnswers / totalResponses) * 100)

  const textAnswers = await prisma.answer.findMany({
    where: {
      response: { formId },
      question: {
        questionType: { in: ['TEXT', 'TEXTAREA'] }
      },
      answerText: { not: null }
    },
    select: { answerText: true }
  })

  const allText = textAnswers
    .map(answer => answer.answerText || '')
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')

  const words = allText.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'were', 'said', 'each', 'which', 'what', 'their', 'would', 'there', 'could', 'other'].includes(word))

  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  const topKeywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  
  for (const answer of textAnswers) {
    const text = (answer.answerText || '').toLowerCase()
    const positiveKeywords = ['excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect', 'outstanding', 'satisfied', 'happy', 'good', 'nice', 'awesome']
    const negativeKeywords = ['terrible', 'awful', 'horrible', 'hate', 'disgusting', 'poor', 'bad', 'disappointed', 'frustrated', 'angry', 'worst', 'useless']
    
    const positiveCount = positiveKeywords.filter(word => text.includes(word)).length
    const negativeCount = negativeKeywords.filter(word => text.includes(word)).length
    
    if (positiveCount > negativeCount) {
      sentimentCounts.positive++
    } else if (negativeCount > positiveCount) {
      sentimentCounts.negative++
    } else {
      sentimentCounts.neutral++
    }
  }

  const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative
  const sentimentBreakdown = {
    positive: totalSentiments > 0 ? Math.round((sentimentCounts.positive / totalSentiments) * 100) : 33,
    neutral: totalSentiments > 0 ? Math.round((sentimentCounts.neutral / totalSentiments) * 100) : 33,
    negative: totalSentiments > 0 ? Math.round((sentimentCounts.negative / totalSentiments) * 100) : 34,
  }

  return {
    responseRate: 75, 
    avgRating,
    completionRate,
    avgTimeToComplete: '2.3 min', 
    topKeywords,
    sentimentBreakdown,
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
} 