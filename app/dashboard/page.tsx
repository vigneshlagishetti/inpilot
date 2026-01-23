'use client'

import { useState, useRef, useEffect } from 'react'
import { UserButton } from '@clerk/nextjs'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AnswerDisplay } from '@/components/AnswerDisplay'
import { ResumeUploader } from '@/components/ResumeUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, MessageSquare, History, Moon, Sun, Sparkles, Mic2, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'

interface Answer {
  directAnswer: string
  detailedExplanation: string
  example?: string
  bruteForceApproach?: string
  optimalApproach?: string
  timeComplexity?: string
  spaceComplexity?: string
}

interface QuestionAnswer {
  question: string
  answer: Answer
  timestamp: Date
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null)
  const [history, setHistory] = useState<QuestionAnswer[]>([])
  const [resumeContent, setResumeContent] = useState<string>('')
  const [resumeFileName, setResumeFileName] = useState<string>('')
  const [jobRole, setJobRole] = useState<string>('')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()

  // Use refs to always have the latest values (avoids closure issues)
  const resumeContentRef = useRef<string>('')
  const jobRoleRef = useRef<string>('')
  const customInstructionsRef = useRef<string>('')
  
  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem('interviewAssistant_resume')
    const savedFileName = localStorage.getItem('interviewAssistant_fileName')
    const savedJobRole = localStorage.getItem('interviewAssistant_jobRole')
    const savedInstructions = localStorage.getItem('interviewAssistant_instructions')
    
    if (savedResume) setResumeContent(savedResume)
    if (savedFileName) setResumeFileName(savedFileName)
    if (savedJobRole) setJobRole(savedJobRole)
    if (savedInstructions) setCustomInstructions(savedInstructions)
  }, [])
  
  // Update refs whenever state changes
  useEffect(() => {
    resumeContentRef.current = resumeContent
    console.log('resumeContentRef updated to:', resumeContent.length, 'characters')
  }, [resumeContent])
  
  useEffect(() => {
    jobRoleRef.current = jobRole
  }, [jobRole])
  
  useEffect(() => {
    customInstructionsRef.current = customInstructions
  }, [customInstructions])

  const handleResumeContent = (content: string, fileName: string) => {
    console.log('=== DASHBOARD handleResumeContent ===')
    console.log('Received content length:', content.length)
    console.log('Received fileName:', fileName)
    console.log('Content preview:', content.substring(0, 100))
    
    setResumeContent(content)
    setResumeFileName(fileName)
    
    // Save to localStorage for persistence
    localStorage.setItem('interviewAssistant_resume', content)
    localStorage.setItem('interviewAssistant_fileName', fileName)
    
    console.log('State updated - resumeContent length:', content.length)
  }

  const handleJobRoleChange = (role: string) => {
    setJobRole(role)
    localStorage.setItem('interviewAssistant_jobRole', role)
  }

  const handleCustomInstructionsChange = (instructions: string) => {
    setCustomInstructions(instructions)
    localStorage.setItem('interviewAssistant_instructions', instructions)
  }

  const handleTranscription = async (transcription: string) => {
    setCurrentQuestion(transcription)
    setIsLoading(true)

    // Use refs to get the latest values (avoids closure issue)
    const currentResumeContent = resumeContentRef.current
    const currentJobRole = jobRoleRef.current
    const currentInstructions = customInstructionsRef.current

    console.log('=== DASHBOARD DEBUG ===')
    console.log('Question:', transcription)
    console.log('Resume content available (from ref):', !!currentResumeContent)
    console.log('Resume content length (from ref):', currentResumeContent.length)
    console.log('Job role:', currentJobRole)
    console.log('Custom instructions:', currentInstructions)

    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: transcription,
          resumeContent: currentResumeContent || undefined,
          jobRole: currentJobRole || undefined,
          customInstructions: currentInstructions || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate answer')
      }

      const answer = await response.json()
      setCurrentAnswer(answer)

      // Add to history
      setHistory((prev) => [
        {
          question: transcription,
          answer,
          timestamp: new Date(),
        },
        ...prev,
      ])

      toast({
        title: 'Answer Generated',
        description: 'Your answer is ready!',
      })
    } catch (error) {
      console.error('Error generating answer:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate answer. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewQuestion = () => {
    setCurrentQuestion('')
    setCurrentAnswer(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Animated background gradients - Reduced on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-300 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="hidden sm:block absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
        <div className="hidden sm:block absolute bottom-0 right-20 w-96 h-96 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/20 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3 min-w-0"
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                AI Interview Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Practice with AI-powered voice assistance
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-white/50 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              )}
            </Button>
            <div className="scale-90 sm:scale-100">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="interview" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 p-1 h-auto">
            <TabsTrigger 
              value="interview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white py-2.5"
            >
              <Mic2 className="w-4 h-4" />
              <span className="hidden sm:inline">Interview Practice</span>
              <span className="sm:hidden">Interview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white py-2.5"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Interview Tab */}
          <TabsContent value="interview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Panel - Voice Recorder */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                {/* Voice Recorder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        Ask Your Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <VoiceRecorder
                        onTranscriptionComplete={handleTranscription}
                        onRecordingStateChange={setIsRecording}
                      />
                      
                      {currentQuestion && !isRecording && (
                        <div className="mt-4">
                          <Button
                            onClick={handleNewQuestion}
                            variant="outline"
                            className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 h-11"
                          >
                            Ask Another Question
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* History */}
                {history.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                          <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          Recent Questions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="space-y-2">
                          {history.slice(0, 5).map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCurrentQuestion(item.question)
                                setCurrentAnswer(item.answer)
                              }}
                              className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 min-h-[44px]"
                            >
                              <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
                                {item.question}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.timestamp.toLocaleTimeString()}
                              </p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Panel - Answer Display */}
              <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <CardContent className="text-center p-4 sm:p-6">
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
                    <Loader2 className="relative w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Generating your answer...</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">This may take a few seconds</p>
                </CardContent>
              </Card>
            ) : currentAnswer ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/50 dark:border-blue-800/50">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Question:</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 italic break-words">{currentQuestion}</p>
                </div>
                <AnswerDisplay {...currentAnswer} />
              </motion.div>
            ) : (
              <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <CardContent className="text-center p-4 sm:p-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
                    <MessageSquare className="relative w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Ready to Practice!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                    Click the microphone button to start recording your question
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings" className="mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <ResumeUploader 
            onContentExtracted={handleResumeContent}
            onJobRoleChange={handleJobRoleChange}
            onCustomInstructionsChange={handleCustomInstructionsChange}
            initialJobRole={jobRole}
            initialInstructions={customInstructions}
          />
          
          {resumeFileName && (
            <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ Configuration saved! Switch to the <strong>Interview Practice</strong> tab to start.
              </p>
            </div>
          )}
        </motion.div>
      </TabsContent>
    </Tabs>

        {/* Footer */}
        <footer className="text-center py-6 px-4 mt-8">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
            Developed by <span className="font-semibold text-blue-600 dark:text-blue-400">Lagishetti Vignesh</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
    