'use client'

import { SignIn } from '@clerk/nextjs'
import { Sparkles, Mic, Brain, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignInPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-300 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Interview Assistant
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4">
              Practice interviews with AI-powered voice assistance
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-sm mx-auto mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
              >
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 dark:text-blue-400" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Voice AI</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
              >
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 dark:text-purple-400" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Smart</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 dark:text-yellow-400" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Fast</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Clerk Sign In Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "glass shadow-2xl border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl",
                  headerTitle: "text-gray-900 dark:text-gray-50",
                  headerSubtitle: "text-gray-600 dark:text-gray-300",
                  socialButtonsBlockButton: "glass border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-800/80",
                  formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                  formFieldInput: "glass border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-50",
                  footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400",
                  identityPreviewText: "text-gray-900 dark:text-gray-50",
                  formFieldLabel: "text-gray-700 dark:text-gray-200"
                }
              }}
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Your AI-powered interview practice companion
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
