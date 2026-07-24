'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Code, Lightbulb, BookOpen, Copy, Check, Clock, HardDrive, Zap, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface AnswerDisplayProps {
  question: string
  directAnswer: string
  detailedExplanation: string
  example?: string
  bruteForceApproach?: string
  bruteForceCode?: string
  bruteForceTime?: string
  bruteForceSpace?: string
  bruteForceWhy?: string
  optimalApproach?: string
  optimalCode?: string
  optimalTime?: string
  optimalSpace?: string
  optimalWhy?: string
  generationTime?: number | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      onClick={handleCopy}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy Code
        </>
      )}
    </Button>
  )
}

// Helper component to render code with syntax highlighting for comments
function CodeBlock({ code }: { code: string }) {
  const lines = code.split('\n')

  return (
    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono">
      <code>
        {lines.map((line, index) => {
          // Check if line is a comment
          const trimmed = line.trim()
          const isComment = trimmed.startsWith('#')

          return (
            <div key={index} className="leading-6">
              {isComment ? (
                <span className="text-green-400 italic opacity-90">{line}</span>
              ) : (
                <span className="text-gray-100">{line}</span>
              )}
            </div>
          )
        })}
      </code>
    </pre>
  )
}


export function AnswerDisplay({
  question,
  directAnswer,
  detailedExplanation,
  example,
  bruteForceApproach,
  bruteForceCode,
  bruteForceTime,
  bruteForceSpace,
  bruteForceWhy,
  optimalApproach,
  optimalCode,
  optimalTime,
  optimalSpace,
  optimalWhy,
  generationTime,
}: AnswerDisplayProps) {

  const hasBruteForce = bruteForceApproach || bruteForceCode
  const hasOptimal = optimalApproach || optimalCode

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-indigo-700 dark:text-indigo-300">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Question
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-50">
              {question}
            </p>
          </CardContent>
        </Card>
      </motion.div>

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
            <p className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-50 whitespace-pre-wrap">{directAnswer}</p>
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

      {/* Brute Force Approach */}
      {hasBruteForce && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
            <Code className="w-5 h-5" />
            Brute Force Approach
          </h3>

          {/* Approach Explanation */}
          {bruteForceApproach && (
            <Card className="border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-orange-700 dark:text-orange-300">Approach</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-900 dark:text-gray-50 whitespace-pre-wrap">{bruteForceApproach}</p>
              </CardContent>
            </Card>
          )}

          {/* Code */}
          {bruteForceCode && (
            <Card className="border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-800">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base text-orange-700 dark:text-orange-300">Code</CardTitle>
                <CopyButton text={bruteForceCode} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CodeBlock code={bruteForceCode} />
              </CardContent>
            </Card>
          )}

          {/* Time & Space Complexity */}
          {(bruteForceTime || bruteForceSpace) && (
            <Card className="border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-orange-700 dark:text-orange-300">Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {bruteForceTime && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Time Complexity:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-50">{bruteForceTime}</p>
                    </div>
                  </div>
                )}
                {bruteForceSpace && (
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-4 h-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Space Complexity:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-50">{bruteForceSpace}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Why it works */}
          {bruteForceWhy && (
            <Card className="border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-orange-700 dark:text-orange-300">Why This Works</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-900 dark:text-gray-50 whitespace-pre-wrap">{bruteForceWhy}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Optimal Approach */}
      {hasOptimal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-50">
            <Zap className="w-5 h-5" />
            Optimal Approach
          </h3>

          {/* Approach Explanation */}
          {optimalApproach && (
            <Card className="border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300">Approach</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-900 dark:text-gray-50 whitespace-pre-wrap">{optimalApproach}</p>
              </CardContent>
            </Card>
          )}

          {/* Code */}
          {optimalCode && (
            <Card className="border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300">Code</CardTitle>
                <CopyButton text={optimalCode} />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CodeBlock code={optimalCode} />
              </CardContent>
            </Card>
          )}

          {/* Time & Space Complexity */}
          {(optimalTime || optimalSpace) && (
            <Card className="border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300">Complexity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {optimalTime && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Time Complexity:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-50">{optimalTime}</p>
                    </div>
                  </div>
                )}
                {optimalSpace && (
                  <div className="flex items-start gap-2">
                    <HardDrive className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Space Complexity:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-50">{optimalSpace}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Why it's better */}
          {optimalWhy && (
            <Card className="border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300">Why This Is Better</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-900 dark:text-gray-50 whitespace-pre-wrap">{optimalWhy}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Generation Time Display */}
      {generationTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex justify-center pt-2 px-4"
        >
          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Generated in <span className="font-semibold text-blue-600 dark:text-blue-400">{generationTime}s</span>
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
