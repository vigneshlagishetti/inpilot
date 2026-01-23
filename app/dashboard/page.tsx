'use client'

import { useState, useRef, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AnswerDisplay } from '@/components/AnswerDisplay'
import { ResumeUploader } from '@/components/ResumeUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, MessageSquare, History, Moon, Sun, Sparkles, Mic2, Settings, Trash2, FileText, Briefcase, PenTool, Star, TrendingUp, Target, Zap, Clock, CheckCircle, MessageCircle, Mail, Send, ThumbsUp, X } from 'lucide-react'
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

interface UserReview {
  id: string
  userName: string
  userEmail: string
  rating: number
  text: string
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
  const [loadingTip, setLoadingTip] = useState<string>('')
  const [reviewText, setReviewText] = useState<string>('')
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()

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
    const savedReviews = localStorage.getItem('impilot_userReviews')
    
    if (savedResume) setResumeContent(savedResume)
    if (savedFileName) setResumeFileName(savedFileName)
    if (savedJobRole) setJobRole(savedJobRole)
    if (savedInstructions) setCustomInstructions(savedInstructions)
    if (savedReviews) {
      try {
        setUserReviews(JSON.parse(savedReviews))
      } catch (error) {
        console.error('Error parsing saved reviews:', error)
      }
    }
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

  const handleDeleteReview = (reviewId: string) => {
    const updatedReviews = userReviews.filter(review => review.id !== reviewId);
    setUserReviews(updatedReviews);
    localStorage.setItem('impilot_userReviews', JSON.stringify(updatedReviews));
    
    toast({
      title: "Review Deleted",
      description: "Your review has been removed.",
    });
  }

  const handleClearAllSettings = () => {
    // Clear state
    setResumeContent('')
    setResumeFileName('')
    setJobRole('')
    setCustomInstructions('')
    
    // Clear localStorage
    localStorage.removeItem('interviewAssistant_resume')
    localStorage.removeItem('interviewAssistant_fileName')
    localStorage.removeItem('interviewAssistant_jobRole')
    localStorage.removeItem('interviewAssistant_instructions')
    
    toast({
      title: 'All Settings Cleared',
      description: 'Your resume, job role, and custom instructions have been removed.',
    })
  }

  const handleTranscription = async (transcription: string) => {
    setCurrentQuestion(transcription)
    setIsLoading(true)

    // Set a random loading tip
    const tips = [
      'Analyzing your question with AI...',
      'Crafting a detailed response...',
      'Processing with advanced AI...',
      'Generating personalized answer...',
      'AI is thinking deeply...',
    ]
    setLoadingTip(tips[Math.floor(Math.random() * tips.length)])

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
      console.log('Sending request to /api/generate-answer...')
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

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to generate answer')
      }

      const answer = await response.json()
      console.log('Answer received:', answer)
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
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur-md opacity-50 animate-pulse"></div>
              <div className="relative p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent truncate tracking-tight">
                Impilot
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block font-medium">
                AI-Powered Interview Practice
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-white/50 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-white/20 p-1.5 h-auto shadow-lg hover:shadow-xl transition-all duration-300">
            <TabsTrigger 
              value="interview" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-800/50 group"
            >
              <Mic2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium">Practice</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-800/50 group"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium">Settings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-800/50 group"
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium">Reviews</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-800/50 group"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-medium">Contact</span>
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
                    <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">Ask Your Question</span>
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
                      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-semibold">Recent Questions</span>
                          <span className="ml-auto text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-700 dark:text-purple-300 font-medium">{history.length}</span>
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
                              aria-label={`View previous question: ${item.question.substring(0, 50)}${item.question.length > 50 ? '...' : ''}`}
                            >
                              <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
                                {item.question}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
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
              <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl flex items-center justify-center min-h-[300px] sm:min-h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                <CardContent className="text-center p-4 sm:p-6 relative z-10">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 animate-pulse"></div>
                    <div className="relative">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
                      </div>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Generating your answer...</p>
                  <motion.p 
                    key={loadingTip}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {loadingTip}
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Usually takes 3-5 seconds
                  </p>
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Card className="border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-900/80 dark:to-blue-950/20 backdrop-blur-xl shadow-xl min-h-[300px] sm:min-h-[400px] flex items-center justify-center group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <CardContent className="text-center p-6 sm:p-8 relative z-10">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                      className="mb-6"
                    >
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-300" />
                        </div>
                      </div>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 group-hover:scale-105 transition-transform duration-300">
                      Ready to Practice!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                      Click the microphone button to start recording your question
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="font-medium">AI-powered practice session</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
          className="max-w-4xl mx-auto space-y-6"
        >
          <ResumeUploader 
            onContentExtracted={handleResumeContent}
            onJobRoleChange={handleJobRoleChange}
            onCustomInstructionsChange={handleCustomInstructionsChange}
            initialJobRole={jobRole}
            initialInstructions={customInstructions}
          />
          
          {resumeFileName && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                      Configuration Saved
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Switch to the <strong>Interview Practice</strong> tab to start practicing.
                    </p>
                    <div className="mt-3 space-y-1.5 text-xs text-green-700 dark:text-green-400">
                      <p className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Resume: <strong>{resumeFileName}</strong> ({resumeContent.length} characters)</p>
                      {jobRole && <p className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Role: <strong>{jobRole}</strong></p>}
                      {customInstructions && <p className="flex items-center gap-2"><PenTool className="w-3.5 h-3.5" /> Custom instructions added</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-red-900 dark:text-red-100 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Remove all saved configuration including resume, job role, and custom instructions.
                  </p>
                  <Button
                    onClick={handleClearAllSettings}
                    variant="outline"
                    className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-900 dark:hover:text-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews" className="mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Submit Review */}
          <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/30 dark:to-orange-950/30">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent font-semibold">Share Your Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setReviewRating(rating)}
                      className="group"
                      aria-label={`Rate ${rating} out of 5 stars`}
                    >
                      <Star 
                        className={`w-6 h-6 transition-all duration-200 ${
                          rating <= reviewRating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300 dark:text-gray-600 group-hover:text-yellow-300'
                        } group-hover:scale-110`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {reviewRating > 0 ? `${reviewRating} of 5 stars` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about your experience with Impilot..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <Button 
                onClick={() => {
                  if (reviewText.trim() && user) {
                    const newReview: UserReview = {
                      id: Date.now().toString(),
                      userName: user.fullName || user.firstName || 'Anonymous',
                      userEmail: user.primaryEmailAddress?.emailAddress || '',
                      rating: reviewRating,
                      text: reviewText,
                      timestamp: new Date()
                    };
                    
                    const updatedReviews = [newReview, ...userReviews];
                    setUserReviews(updatedReviews);
                    localStorage.setItem('impilot_userReviews', JSON.stringify(updatedReviews));
                    
                    toast({
                      title: "Review Submitted!",
                      description: "Thank you for your feedback. It helps us improve Impilot.",
                    });
                    setReviewText('');
                    setReviewRating(0);
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:scale-105 transition-all duration-300 shadow-lg"
                disabled={!reviewText.trim() || !user || reviewRating === 0}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </CardContent>
          </Card>

          {/* Sample Reviews */}
          <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent font-semibold">User Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userReviews.length > 0 ? (
                userReviews.map((review, index) => (
                <motion.div 
                  key={index} 
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{review.userName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.userEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {user?.primaryEmailAddress?.emailAddress === review.userEmail && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all duration-200 group"
                          title="Delete your review"
                          aria-label="Delete your review"
                        >
                          <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{review.text}</p>
                </motion.div>
              ))
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your experience!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>

      {/* Contact Tab */}
      <TabsContent value="contact" className="mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Contact Form */}
          <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent font-semibold">Get in Touch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="How can we help you?"
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <Button 
                onClick={() => {
                  if (contactForm.name && contactForm.email && contactForm.message) {
                    toast({
                      title: "Message Sent!",
                      description: "We'll get back to you as soon as possible.",
                    });
                    setContactForm({ name: '', email: '', message: '' });
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-300 shadow-lg"
                disabled={!contactForm.name || !contactForm.email || !contactForm.message}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Developer Info */}
          <Card className="border-white/20 dark:border-white/10 bg-gradient-to-br from-white/80 to-purple-50/30 dark:from-gray-900/80 dark:to-purple-950/20 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6 text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-2xl font-bold text-white">LV</span>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Lagishetti Vignesh</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Full Stack Developer & AI Enthusiast</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                Passionate about creating AI-powered solutions that help people achieve their goals. 
                Always open to feedback and collaboration!
              </p>
            </CardContent>
          </Card>
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
    