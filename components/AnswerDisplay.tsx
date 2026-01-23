'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Code, Lightbulb, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface AnswerDisplayProps {
  directAnswer: string
  detailedExplanation: string
  example?: string
  bruteForceApproach?: string
  optimalApproach?: string
  timeComplexity?: string
  spaceComplexity?: string
}

export function AnswerDisplay({
  directAnswer,
  detailedExplanation,
  example,
  bruteForceApproach,
  optimalApproach,
  timeComplexity,
  spaceComplexity,
}: AnswerDisplayProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Direct Answer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Direct Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-50">{directAnswer}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-l-4 border-l-blue-500 border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-gray-900/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-blue-700 dark:text-blue-300">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Detailed Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-sm sm:text-base text-gray-900 dark:text-gray-50 whitespace-pre-wrap leading-relaxed">
              {detailedExplanation}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Example */}
      {example && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-purple-700 dark:text-purple-300">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                Example
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-sm sm:text-base text-gray-900 dark:text-gray-50 whitespace-pre-wrap leading-relaxed">
                {example}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Code Approaches */}
      {(bruteForceApproach || optimalApproach) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
            <Code className="w-4 h-4 sm:w-5 sm:h-5" />
            Code Solutions
          </h3>

          {bruteForceApproach && (
            <Card className="border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-800 bg-white/50 dark:bg-gray-900/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-orange-700 dark:text-orange-300">Brute Force Approach</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                  <code>{bruteForceApproach}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {optimalApproach && (
            <Card className="border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800 bg-white/50 dark:bg-gray-900/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-emerald-700 dark:text-emerald-300">Optimal Approach</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm border border-gray-700">
                  <code>{optimalApproach}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Complexity Analysis */}
          {(timeComplexity || spaceComplexity) && (
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-gray-900 dark:text-gray-50">Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {timeComplexity && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Time Complexity</p>
                    <p className="text-base sm:text-lg font-mono text-gray-900 dark:text-gray-50">{timeComplexity}</p>
                  </div>
                )}
                {spaceComplexity && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Space Complexity</p>
                    <p className="text-base sm:text-lg font-mono text-gray-900 dark:text-gray-50">{spaceComplexity}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
