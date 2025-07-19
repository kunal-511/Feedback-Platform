import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowRight, Check, Star, BarChart3, Zap, Globe, Sparkles } from "lucide-react"
import AuthNav from "@/components/navigation/auth-nav"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">FeedbackHub</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>
          <AuthNav />
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30" />
        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Trusted by 1000+ businesses
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Collect feedback
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                that matters
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create beautiful feedback forms in minutes. Share them anywhere. Get actionable insights that help you
              build better products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-base" asChild>
                <Link href="/register">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-base bg-transparent" asChild>
                <Link href="/demo">View demo</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever plan available</p>
          </div>
        </div>
      </section>

      <section className="py-12 border-b bg-gray-50/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by teams at</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {["Acme Corp", "TechStart", "InnovateCo", "BuildFast", "GrowthLab"].map((company) => (
              <div key={company} className="text-lg font-semibold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to collect feedback</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make feedback collection simple, efficient, and insightful.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quick Setup</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create professional feedback forms in under 2 minutes. No technical skills required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Public Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share forms via simple links. Your customers don&apos;t need accounts to provide feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get instant insights with beautiful charts and export data for deeper analysis.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Built for modern teams</h3>
              <div className="space-y-4">
                {[
                  "Multiple question types (text, ratings, multiple choice)",
                  "Real-time response tracking",
                  "CSV export for data analysis",
                  "Mobile-optimized forms",
                  "Spam protection built-in",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Customer Satisfaction</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-600 rounded-full w-4/5"></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Response Rate</span>
                      <span>84%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-2xl font-bold text-gray-900">127</div>
                    <div className="text-sm text-gray-600">Responses</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600">Forms created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-gray-600">Responses collected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
              &quot;FeedbackHub transformed how we collect customer insights. The setup was incredibly easy, and the
              analytics help us make data-driven decisions every day.&quot;
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Sarah Chen</div>
                <div className="text-gray-600">Product Manager, TechStart</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to start collecting feedback?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using FeedbackHub to make better decisions with customer insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-base" asChild>
              <Link href="/register">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 text-base border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/demo">Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-6">Free plan available • No setup fees • Cancel anytime</p>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold">FeedbackHub</span>
              </div>
              <p className="text-gray-400 leading-relaxed">The easiest way to collect and analyze customer feedback.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                {["Features","Pricing","Templates","Integrations"].map((data,index)=>( 
                  <li key={index}>
                  <Link href="#" className="hover:text-white transition-colors">
                    {data}
                  </Link>
                </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
              {["About","Blog","Careers","Contact"].map((data,index)=>( 
                  <li key={index}>
                  <Link href="#" className="hover:text-white transition-colors">
                    {data}
                  </Link>
                </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
              {["Help Center","Documentation","API Reference","Status"].map((data,index)=>( 
                  <li key={index}>
                  <Link href="#" className="hover:text-white transition-colors">
                    {data}
                  </Link>
                </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 FeedbackHub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
