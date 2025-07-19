import { NextRequest } from 'next/server'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  requests: number 
  window: number   
  identifier?: (req: NextRequest) => string 
}


export const rateLimitConfigs = {
  formSubmission: {
    requests: 5,
    window: 60 * 60 * 1000, 
  },
  formCreation: {
    requests: 10,
    window: 24 * 60 * 60 * 1000, 
  },
  general: {
    requests: 100,
    window: 15 * 60 * 1000, 
  },
  registration: {
    requests: 3,
    window: 60 * 60 * 1000, 
  },
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (remoteAddr) {
    return remoteAddr.split(',')[0].trim()
  }
  
  return '0.0.0.1' 
}

export function rateLimit(config: RateLimitConfig, identifier?: string) {
  return (request: NextRequest): { success: boolean; remaining: number; resetTime: number } => {
    const now = Date.now()
    const id = identifier || config.identifier?.(request) || getClientIP(request)
    const key = `rate_limit:${id}`
    
    const current = rateLimitStore.get(key)
    
    if (!current || current.resetTime < now) {
      const resetTime = now + config.window
      rateLimitStore.set(key, { count: 1, resetTime })
      return {
        success: true,
        remaining: config.requests - 1,
        resetTime,
      }
    }
    
    if (current.count >= config.requests) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      }
    }
    
    current.count++
    rateLimitStore.set(key, current)
    
    return {
      success: true,
      remaining: config.requests - current.count,
      resetTime: current.resetTime,
    }
  }
}

export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = rateLimit(config)
  
  return (request: NextRequest) => {
    const result = limiter(request)
    return result
  }
}

export const formSubmissionLimiter = createRateLimitMiddleware(rateLimitConfigs.formSubmission)
export const formCreationLimiter = createRateLimitMiddleware(rateLimitConfigs.formCreation)
export const generalLimiter = createRateLimitMiddleware(rateLimitConfigs.general)
export const registrationLimiter = createRateLimitMiddleware(rateLimitConfigs.registration) 