"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sparkles, Heart, Star, ArrowRight, Home } from "lucide-react"

interface SuccessPageProps {
  formTitle?: string
  showSocialShare?: boolean
  redirectUrl?: string
  customMessage?: string
}

export default function SuccessPage({
  formTitle = "Feedback Form",
  redirectUrl,
  customMessage,
}: SuccessPageProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 100)
    const timer2 = setTimeout(() => setAnimationStep(2), 300)
    const timer3 = setTimeout(() => setAnimationStep(3), 600)
    const timer4 = setTimeout(() => setShowConfetti(true), 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])



  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      window.close()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showConfetti && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60"></div>
              </div>
            ))}
          </>
        )}

        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="relative mb-6">
            <div
              className={`transition-all duration-500 ${
                animationStep >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            >
              <div className="relative">
                <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 mx-auto" />
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>
              </div>
            </div>

            {animationStep >= 2 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                <Sparkles
                  className="h-4 w-4 text-blue-500 absolute -bottom-1 -left-2 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <Sparkles
                  className="h-5 w-5 text-purple-500 absolute top-1 -right-4 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            )}
          </div>

          <div
            className={`transition-all duration-500 delay-200 ${
              animationStep >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-200">
              <Heart className="h-3 w-3 mr-1" />
              Feedback Received
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Thank You!
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {customMessage || (
                <>
                  Your feedback for <span className="font-semibold text-gray-800">{formTitle}</span> has been
                  submitted successfully. We truly appreciate your time and valuable input.
                </>
              )}
            </p>
          </div>

          <div
            className={`transition-all duration-500 delay-400 ${
              animationStep >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
              <p className="text-sm text-gray-700 mb-3">How was your experience?</p>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="group transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                  >
                    <Star className="h-6 w-6 text-yellow-400 fill-current group-hover:text-yellow-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-500 delay-600 space-y-3 ${
              animationStep >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {redirectUrl ? (
              <Button
                onClick={handleRedirect}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => window.close()}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                size="lg"
              >
                Close Window
              </Button>
            )}

       
          </div>

          <div
            className={`transition-all duration-500 delay-800 ${
              animationStep >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                Your response helps us improve our services.
                <br className="hidden sm:inline" />
                Thank you for being part of our community! 🎉
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @media (max-width: 640px) {
          .animate-bounce {
            animation-duration: 3s;
          }
        }
      `}</style>
    </div>
  )
}
