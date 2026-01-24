// © 2026 Lagishetti Vignesh. All rights reserved.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Sparkles, Mic, Brain, Zap, ArrowRight, CheckCircle2, Rocket, Upload, MessageCircle, TrendingUp, Award, Users, BarChart3, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8"
              >
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Inpilot
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 mb-4 sm:mb-6 max-w-3xl mx-auto px-4"
              >
                Practice interviews with <span className="font-semibold text-blue-600 dark:text-blue-400">AI-powered voice assistance</span>.
                Get instant feedback, improve your skills, and land your dream job.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 mb-8 sm:mb-10"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Free to start • No credit card required</span>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
              >
                <Button
                  onClick={() => router.push('/sign-up')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg px-8 py-6 sm:py-7 rounded-xl group min-w-[200px]"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => router.push('/sign-in')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 text-base sm:text-lg px-8 py-6 sm:py-7 rounded-xl min-w-[200px]"
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-16"
              >
                Already have an account? <button onClick={() => router.push('/sign-in')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in here</button>
              </motion.p>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto"
              >
                {[
                  {
                    icon: Mic,
                    title: 'Voice Recognition',
                    description: 'Speak naturally, AI transcribes instantly',
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-950/30'
                  },
                  {
                    icon: Brain,
                    title: 'Smart AI Responses',
                    description: 'Personalized answers based on your resume',
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'bg-purple-50 dark:bg-purple-950/30'
                  },
                  {
                    icon: Zap,
                    title: 'Real-time Feedback',
                    description: 'Practice and improve on the spot',
                    color: 'from-yellow-500 to-orange-500',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30'
                  },
                  {
                    icon: Rocket,
                    title: 'Interview Ready',
                    description: 'Boost confidence for your next interview',
                    color: 'from-pink-500 to-red-500',
                    bgColor: 'bg-pink-50 dark:bg-pink-950/30'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                    className={`relative glass p-6 rounded-2xl border border-white/20 dark:border-white/10 ${feature.bgColor} backdrop-blur-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group overflow-hidden`}
                  >
                    {/* Animated gradient glow on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl blur-xl`}></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12`}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="relative inline-block mb-4">
                        {/* Icon glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500 rounded-xl`}></div>
                        <div className={`relative p-3 bg-gradient-to-br ${feature.color} rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50 group-hover:scale-105 transition-transform duration-300">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Get started in 3 simple steps</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: '01',
                  title: 'Upload Your Resume',
                  description: 'Paste or upload your resume and set your job role preferences',
                  icon: Upload,
                  color: 'text-blue-500 dark:text-blue-400'
                },
                {
                  step: '02',
                  title: 'Start Speaking',
                  description: 'Ask questions using voice - AI listens and transcribes automatically',
                  icon: MessageCircle,
                  color: 'text-purple-500 dark:text-purple-400'
                },
                {
                  step: '03',
                  title: 'Get AI Answers',
                  description: 'Receive personalized, detailed answers based on your experience',
                  icon: TrendingUp,
                  color: 'text-green-500 dark:text-green-400'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="glass p-8 rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-6xl font-bold text-blue-500/20 dark:text-blue-400/20">{item.step}</div>
                      <div className={`p-3 bg-gradient-to-br ${item.color.includes('blue') ? 'from-blue-500 to-blue-600' : item.color.includes('purple') ? 'from-purple-500 to-purple-600' : 'from-green-500 to-green-600'} rounded-xl group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-50">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    <CheckCircle2 className={`absolute top-8 right-8 w-6 h-6 ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto glass p-8 sm:p-12 rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-xl text-center overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 mb-6">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Join thousands practicing today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto">
                Sign up now and start practicing with your AI interview coach. It's completely free to get started!
              </p>
              <Button
                onClick={() => router.push('/sign-up')}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg px-10 py-7 rounded-xl group"
              >
                Create Your Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                Have an account? <button onClick={() => router.push('/sign-in')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in</button>
              </p>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-white/20 dark:border-white/10">
          <div className="max-w-7xl mx-auto text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Inpilot</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 Inpilot. Built with 💜 for interview success.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Developed by <span className="font-semibold text-blue-600 dark:text-blue-400">Lagishetti Vignesh</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              © 2026 Lagishetti Vignesh. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
