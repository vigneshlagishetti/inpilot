'use client'

import { SignUp } from '@clerk/nextjs'
import { Sparkles, Rocket, Target, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignUpPage() {
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
            {/* Logo with glow effect */}
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent cursor-default"
            >
              Start Your Journey
            </motion.h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-4">
              Join thousands practicing interviews with AI assistance
            </p>

            {/* Benefits with hover effects */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-sm mx-auto mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl hover:shadow-xl cursor-pointer group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Launch</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="relative glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl hover:shadow-xl cursor-pointer group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Practice</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="relative glass p-3 sm:p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl hover:shadow-xl cursor-pointer group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Succeed</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Clerk Sign Up Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "glass shadow-2xl border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl",
                  headerTitle: "text-gray-900 dark:text-gray-50",
                  headerSubtitle: "text-gray-600 dark:text-gray-300",
                  socialButtonsBlockButton: "bg-white/95 dark:bg-gray-800/95 border-2 border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105 font-medium backdrop-blur-sm",
                  socialButtonsBlockButtonText: "text-gray-900 dark:text-gray-100 font-semibold",
                  socialButtonsBlockButtonArrow: "text-gray-900 dark:text-gray-100 opacity-100",
                  formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300",
                  formFieldInput: "glass border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-50 focus:bg-white/80 dark:focus:bg-gray-800/80",
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
              🚀 Get ready to ace your interviews with AI
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
