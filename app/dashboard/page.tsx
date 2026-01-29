// © 2026 Lagishetti Vignesh. All rights reserved.
'use client'

import { useState, useRef, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AnswerDisplay } from '@/components/AnswerDisplay'
import { ResumeUploader, Project } from '@/components/ResumeUploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Loader2, MessageSquare, History, Moon, Sun, Sparkles, Mic2, Settings, Trash2, FileText, Briefcase, PenTool, Star, TrendingUp, Target, Zap, Clock, CheckCircle, MessageCircle, Mail, Send, ThumbsUp, X, Upload, Shield, UserCog } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { supabase } from '@/lib/supabase'

interface Answer {
  directAnswer: string
  detailedExplanation: string
  example?: string
  // Brute Force sections
  bruteForceApproach?: string
  bruteForceCode?: string
  bruteForceTime?: string
  bruteForceSpace?: string
  bruteForceWhy?: string
  // Optimal sections
  optimalApproach?: string
  optimalCode?: string
  optimalTime?: string
  optimalSpace?: string
  optimalWhy?: string
}

interface QuestionAnswer {
  id?: string // Supabase Message ID for deletion
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
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [history, setHistory] = useState<QuestionAnswer[]>([])
  const [resumeContent, setResumeContent] = useState<string>('')
  const [resumeFileName, setResumeFileName] = useState<string>('')
  const [jobRole, setJobRole] = useState<string>('')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [loadingTip, setLoadingTip] = useState<string>('')
  const [reviewText, setReviewText] = useState<string>('')
  const [reviewRating, setReviewRating] = useState<number>(0)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', files: [] as File[] })
  const [projects, setProjects] = useState<Project[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const { user } = useUser()

  // Use refs to always have the latest values (avoids closure issues)
  const resumeContentRef = useRef<string>('')
  const jobRoleRef = useRef<string>('')
  const customInstructionsRef = useRef<string>('')
  const projectsRef = useRef<Project[]>([])
  const answerSectionRef = useRef<HTMLDivElement>(null)
  const recordingSectionRef = useRef<HTMLDivElement>(null)
  const voiceRecorderRef = useRef<any>(null)

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

    // Load reviews from API
    loadReviews()
  }, [])

  // Load projects, history, and resume from Supabase when user is available
  useEffect(() => {
    if (user?.id) {
      loadProjects()
      loadHistory()
      loadResumeFromDB()
      checkAdminStatus()
    }
  }, [user?.id])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      if (data.isAdmin) setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadProjects = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setProjects(data.map(p => ({
          id: p.id,
          name: p.name,
          content: p.content
        })))
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast({
        title: 'Error Loading Projects',
        description: 'Could not fetch your saved projects.',
        variant: 'destructive',
      })
    }
  }

  const loadResumeFromDB = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // No resume found is okay, just skip
        if (error.code !== 'PGRST116') {
          console.error('Error loading resume:', error)
        }
        return
      }

      if (data) {
        setResumeContent(data.resume_content)
        setResumeFileName(data.file_name)
        setJobRole(data.job_role || '')
        setCustomInstructions(data.custom_instructions || '')

        // Also save to localStorage as backup
        localStorage.setItem('interviewAssistant_resume', data.resume_content)
        localStorage.setItem('interviewAssistant_fileName', data.file_name)
        localStorage.setItem('interviewAssistant_jobRole', data.job_role || '')
        localStorage.setItem('interviewAssistant_instructions', data.custom_instructions || '')
      }
    } catch (error) {
      console.error('Error loading resume from DB:', error)
    }
  }

  const saveResumeToDB = async (content: string, fileName: string, role: string, instructions: string) => {
    try {
      if (!user?.id) return

      const { error } = await supabase
        .from('user_resumes')
        .upsert({
          user_id: user.id,
          resume_content: content,
          file_name: fileName,
          job_role: role,
          custom_instructions: instructions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving resume to DB:', error)
        throw error
      }

      console.log('Resume saved to database successfully')
    } catch (error) {
      console.error('Error in saveResumeToDB:', error)
      toast({
        title: 'Warning',
        description: 'Resume saved locally but failed to sync to cloud.',
        variant: 'destructive',
      })
    }
  }

  // Ensure a conversation session exists
  const ensureSession = async () => {
    if (sessionId) return sessionId
    if (!user?.id) return null

    try {
      console.log('Ensuring session for user:', user.id)
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        console.log('Found existing session:', existing.id)
        setSessionId(existing.id)
        return existing.id
      }

      console.log('Creating new session...')
      const { data: newSession, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          user_email: user.primaryEmailAddress?.emailAddress || '',
          title: 'General Practice',
        })
        .select()
        .single()

      if (error) throw error
      if (newSession) {
        setSessionId(newSession.id)
        return newSession.id
      }
    } catch (error) {
      console.error('Error ensuring session:', error)
      return null
    }
  }

  // Load history from Supabase
  const loadHistory = async () => {
    if (!user?.id) return

    try {
      console.log('Loading history...')
      const sid = await ensureSession()
      if (!sid) {
        console.log('No session ID found.')
        return
      }

      console.log('Fetching messages for session:', sid)
      const { data: messages, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', sid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching messages:', error)
        throw error
      }

      console.log('Messages fetched:', messages?.length)

      if (messages) {
        // Log all messages to see what we got
        console.log('Raw messages dump:', JSON.stringify(messages.map(m => ({ id: m.id, type: m.type, hasMeta: !!m.metadata, metaRaw: m.metadata }))))

        const historyItems: QuestionAnswer[] = []
        messages.forEach(msg => {
          // Debug why a message might be skipped
          if (msg.type === 'assistant') {
            console.log('Found assistant msg:', msg.id, 'Metadata:', msg.metadata)
          }

          if (msg.type === 'assistant' && msg.metadata) {
            const answer = msg.metadata as Answer
            const questionText = (msg.metadata as any)._question || "Question"

            historyItems.push({
              id: msg.id,
              question: questionText,
              answer: answer,
              timestamp: new Date(msg.created_at)
            })
          }
        })
        console.log('Parsed history items:', historyItems.length)
        setHistory(historyItems)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      setHistory(prev => prev.filter(item => item.id !== id))
      toast({ title: 'Deleted', description: 'History item removed.' })
    } catch (error) {
      console.error("Error deleting history:", error)
      toast({ title: 'Error', variant: 'destructive', description: "Failed to delete item." })
    }
  }

  // Load all reviews from API/database
  const loadReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        // Convert API format back to component format
        const formattedReviews = data.reviews?.map((review: any) => ({
          id: review.id,
          userName: review.user_name,
          userEmail: review.user_email,
          rating: review.rating,
          text: review.text,
          timestamp: new Date(review.created_at)
        })) || []
        setUserReviews(formattedReviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  // Save review to shared storage (API/database)
  const saveReviewToShared = async (newReview: UserReview) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error saving review:', error)
    }
  }

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

  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

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

    // Save to database for permanent storage
    saveResumeToDB(content, fileName, jobRole, customInstructions)

    console.log('State updated - resumeContent length:', content.length)
  }

  const handleJobRoleChange = (role: string) => {
    setJobRole(role)
    localStorage.setItem('interviewAssistant_jobRole', role)
    // Save to database
    saveResumeToDB(resumeContent, resumeFileName, role, customInstructions)
  }

  const handleCustomInstructionsChange = (instructions: string) => {
    setCustomInstructions(instructions)
    localStorage.setItem('interviewAssistant_instructions', instructions)
    // Save to database
    saveResumeToDB(resumeContent, resumeFileName, jobRole, instructions)
  }

  const handleAddProject = async (name: string, content: string) => {
    try {
      if (!user?.id) {
        toast({ title: 'Error', description: 'You must be logged in to save projects.', variant: 'destructive' })
        return
      }

      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          name,
          content
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setProjects(prev => [{ id: data.id, name: data.name, content: data.content }, ...prev])
        toast({ title: 'Project Saved', description: `${name} has been added to your context.` })
      }
    } catch (error) {
      console.error('Error saving project:', error)
      toast({ title: 'Error', description: 'Failed to save project.', variant: 'destructive' })
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== id))
      toast({ title: 'Project Deleted', description: 'Project removed from context.' })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({ title: 'Error', description: 'Failed to delete project.', variant: 'destructive' })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) {
        toast({
          title: "Error",
          description: "You must be logged in to delete reviews.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          userEmail: user.primaryEmailAddress.emailAddress
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reload reviews to get latest data
        await loadReviews()
        toast({
          title: "Review Deleted",
          description: "Your review has been removed.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete review. You can only delete your own reviews.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClearAllSettings = async () => {
    // Clear state
    setResumeContent('')
    setResumeFileName('')
    setJobRole('')
    setCustomInstructions('')
    // Note: Not clearing projects as they are permanent in DB

    // Clear localStorage
    localStorage.removeItem('interviewAssistant_resume')
    localStorage.removeItem('interviewAssistant_fileName')
    localStorage.removeItem('interviewAssistant_jobRole')
    localStorage.removeItem('interviewAssistant_instructions')

    // Clear from database
    if (user?.id) {
      try {
        await supabase
          .from('user_resumes')
          .delete()
          .eq('user_id', user.id)
        console.log('Resume deleted from database')
      } catch (error) {
        console.error('Error deleting resume from DB:', error)
      }
    }

    toast({
      title: 'Settings Cleared',
      description: 'Your local settings have been removed. Saved projects remain.',
    })
  }

  const handleTranscription = async (transcription: string) => {
    setCurrentQuestion(transcription)
    setIsLoading(true)

    // Set a random loading tip
    const tips = [
      'AI thinking... ~3s',
      'Generating answer... ~3-4s',
      'Processing... ~3s',
      'Almost ready... ~4s',
    ]
    setLoadingTip(tips[Math.floor(Math.random() * tips.length)])

    // Use refs to get the latest values (avoids closure issue)
    const currentResumeContent = resumeContentRef.current
    const currentJobRole = jobRoleRef.current
    const currentInstructions = customInstructionsRef.current
    const currentProjects = projectsRef.current

    // Combine projects into a single context string
    let currentProjectContext = ''
    if (currentProjects.length > 0) {
      currentProjectContext = currentProjects.map(p =>
        `=== PROJECT: ${p.name} ===\n${p.content}\n=======================`
      ).join('\n\n')
    }

    console.log('=== DASHBOARD DEBUG ===')
    console.log('Question:', transcription)
    console.log('Resume content available (from ref):', !!currentResumeContent)
    console.log('Resume content length (from ref):', currentResumeContent.length)
    console.log('Job role:', currentJobRole)
    console.log('Custom instructions:', currentInstructions)
    console.log('Project Context Length:', currentProjectContext.length)
    console.log('Num Projects:', currentProjects.length)

    try {
      const startTime = Date.now()
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
          projectContext: currentProjectContext || undefined,
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
      const endTime = Date.now()
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2)
      console.log('Answer received:', answer)
      console.log('Generation time:', timeTaken, 'seconds')
      setGenerationTime(parseFloat(timeTaken))
      setCurrentAnswer(answer)

      // Save persistence
      let savedId: string | undefined
      const sid = await ensureSession()

      if (sid) {
        // 1. Save User Question
        await supabase.from('conversation_messages').insert({
          conversation_id: sid,
          type: 'user',
          content: transcription
        })

        // 2. Save Assistant Answer (with question in metadata for easy restoration)
        const { data: savedAnswerMsg, error: saveError } = await supabase.from('conversation_messages').insert({
          conversation_id: sid,
          type: 'assistant',
          content: "Answer Generated",
          metadata: {
            ...answer,
            _question: transcription
          }
        }).select().single()

        if (saveError) {
          console.error('Error saving assistant answer:', saveError)
        } else {
          console.log('Saved assistant answer:', savedAnswerMsg?.id)
          if (savedAnswerMsg) savedId = savedAnswerMsg.id
        }
      }

      // Add to history
      setHistory((prev) => [
        {
          id: savedId, // undefined if save failed, that's ok
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

      // Auto-scroll to answer on mobile in continuous mode
      setTimeout(() => {
        const isMobile = window.innerWidth < 768 // sm breakpoint
        if (isMobile && answerSectionRef.current) {
          answerSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 300) // Small delay to ensure content is rendered
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

  const handleNextQuestion = () => {
    // Scroll back to recording section
    if (recordingSectionRef.current) {
      recordingSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    }

    // Clear current question and answer
    setCurrentQuestion('')
    setCurrentAnswer(null)

    // Start recording after a short delay to allow scroll to complete
    setTimeout(() => {
      // This will trigger the voice recorder to start if it has a start method exposed
      const isMobile = window.innerWidth < 768
      if (isMobile && voiceRecorderRef.current && typeof voiceRecorderRef.current.startRecording === 'function') {
        voiceRecorderRef.current.startRecording();
      }
    }, 800)
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
                Inpilot
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block font-medium">
                AI-Powered Interview Practice
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <UserCog className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex sm:hidden rounded-full hover:bg-white/50 dark:hover:bg-white/10 h-8 w-8 text-blue-600 dark:text-blue-400"
                >
                  <UserCog className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-white/50 dark:hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
              <div className="lg:col-span-1 space-y-4 sm:space-y-6" ref={recordingSectionRef}>
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
                        ref={voiceRecorderRef}
                        onTranscriptionComplete={handleTranscription}
                        onRecordingStateChange={setIsRecording}
                      />

                      {currentQuestion && !isRecording && (
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={handleNextQuestion}
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
                            <div key={item.id || index} className="group relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentQuestion(item.question)
                                  setCurrentAnswer(item.answer)
                                }}
                                className="w-full text-left p-3 pr-12 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 min-h-[44px] hover:shadow-md cursor-pointer"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
                                      {item.question}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {item.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                      View →
                                    </span>
                                  </div>
                                </div>
                              </button>
                              {item.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteHistoryItem(item.id!)
                                  }}
                                  className="absolute right-2 top-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                                  title="Delete from history"
                                  aria-label="Delete this question from history"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Panel - Answer Display */}
              <div className="lg:col-span-2" ref={answerSectionRef}>
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
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 px-4">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse flex-shrink-0" />
                        <span className="whitespace-nowrap">Estimated: <span className="font-semibold text-blue-600 dark:text-blue-400">3-8 seconds</span></span>
                      </p>
                    </CardContent>
                  </Card>
                ) : currentAnswer ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AnswerDisplay question={currentQuestion} {...currentAnswer} generationTime={generationTime} />

                    {/* Next Question Button - Only show on mobile */}
                    <div className="mt-6 flex justify-center lg:hidden">
                      <Button
                        type="button"
                        onClick={handleNextQuestion}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Mic2 className="w-5 h-5 mr-2" />
                        Next Question
                      </Button>
                    </div>
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
                projects={projects}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
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
                        type="button"
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
                <CardHeader className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/30 dark:to-orange-950/30 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent font-semibold">Share Your Experience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            type="button"
                            key={rating}
                            onClick={() => setReviewRating(rating === reviewRating ? 0 : rating)}
                            className="group p-1"
                            aria-label={`Rate ${rating} out of 5 stars`}
                            title={`Rate ${rating} out of 5 stars`}
                          >
                            <Star
                              className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200 ${rating <= reviewRating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300 dark:text-gray-600 group-hover:text-yellow-300'
                                } group-hover:scale-110`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-2">
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
                      placeholder="Tell us about your experience with Inpilot..."
                      className="w-full h-24 sm:h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={async () => {
                      if (reviewText.trim() && user) {
                        const newReview: UserReview = {
                          id: `${Date.now()}_${user.id}`,
                          userName: user.fullName || user.firstName || 'Anonymous',
                          userEmail: user.primaryEmailAddress?.emailAddress || '',
                          rating: reviewRating,
                          text: reviewText,
                          timestamp: new Date()
                        };

                        // Save to shared API storage
                        await saveReviewToShared(newReview);

                        toast({
                          title: "Review Submitted!",
                          description: "Thank you for your feedback. It helps us improve Inpilot.",
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent font-semibold">User Reviews</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  {userReviews.length > 0 ? (
                    userReviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((review, index) => {
                      // Debug logging
                      console.log('User email:', user?.primaryEmailAddress?.emailAddress)
                      console.log('Review email:', review.userEmail)
                      console.log('Is admin?', user?.primaryEmailAddress?.emailAddress === 'vigneshlagishetti789@gmail.com')

                      return (
                        <motion.div
                          key={index}
                          className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{review.userName}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{review.userEmail}</p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                  {new Date(review.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              {(user?.primaryEmailAddress?.emailAddress === 'lvigneshbunty789@gmail.com' ||
                                user?.primaryEmailAddress?.emailAddress === review.userEmail) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="p-1.5 sm:p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all duration-200 group flex-shrink-0"
                                    title={user?.primaryEmailAddress?.emailAddress === 'lvigneshbunty789@gmail.com' ? "Delete review (Admin)" : "Delete your review"}
                                    aria-label={user?.primaryEmailAddress?.emailAddress === 'lvigneshbunty789@gmail.com' ? "Delete review (Admin)" : "Delete your review"}
                                  >
                                    <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                  </button>
                                )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{review.text}</p>
                        </motion.div>
                      )
                    })
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
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      What's the problem? *
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe the issue you're facing, feature request, or feedback..."
                      className="w-full h-24 sm:h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      rows={4}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attach Files/Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          if (e.target.files) {
                            setContactForm(prev => ({ ...prev, files: Array.from(e.target.files || []) }))
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Images, PDFs, Documents (Max 10MB each)
                          </p>
                        </div>
                      </label>
                    </div>
                    {contactForm.files.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected files:
                        </p>
                        <div className="space-y-1">
                          {contactForm.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                              <Button
                                onClick={() => {
                                  setContactForm(prev => ({
                                    ...prev,
                                    files: prev.files.filter((_, i) => i !== index)
                                  }))
                                }}
                                className="t  ext-red-500 hover:text-red-700 p-1"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={async () => {
                      if (contactForm.name && contactForm.email && contactForm.message) {
                        try {
                          const formData = new FormData()
                          formData.append('name', contactForm.name)
                          formData.append('email', contactForm.email)
                          formData.append('message', contactForm.message)

                          // Add files if any
                          contactForm.files.forEach((file, index) => {
                            formData.append(`file_${index}`, file)
                          })

                          const response = await fetch('/api/contact', {
                            method: 'POST',
                            body: formData
                          })

                          if (response.ok) {
                            toast({
                              title: "Message Sent!",
                              description: "Your message has been sent directly to the developer. You'll receive a response soon.",
                            })
                            setContactForm({ name: '', email: '', message: '', files: [] })
                            // Reset file input
                            const fileInput = document.getElementById('file-upload') as HTMLInputElement
                            if (fileInput) fileInput.value = ''
                          } else {
                            throw new Error('Failed to send message')
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to send message. Please try again later.",
                            variant: "destructive"
                          })
                        }
                      }
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-300 shadow-lg"
                    disabled={!contactForm.name || !contactForm.email || !contactForm.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message to Developer
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
                    <span className="text-2xl font-bold text-white">
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                      {user?.lastName?.charAt(0) || ''}
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName
                        ? user.firstName
                        : user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {(user?.publicMetadata?.jobTitle as string) || 'Inpilot User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto mb-6">
                    Welcome to Inpilot! Your AI-powered voice assistant for smart conversations and productivity.
                    Share your feedback to help us improve!
                  </p>

                  {/* Developer Social Links - Visible to all users */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <p className="text-xs text-gray-400 dark:text-gray-600 mb-4 text-center">
                      Connect with the Developer
                    </p>
                    <div className="flex justify-center space-x-6">
                      {/* GitHub */}
                      <motion.a
                        href="https://github.com/vigneshlagishetti"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.1, y: -3, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        title="GitHub Profile"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </motion.a>

                      {/* LinkedIn */}
                      <motion.a
                        href="https://www.linkedin.com/in/vignesh-lagishetti-69a102219/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 bg-[#0077B5] text-white rounded-xl hover:bg-[#005885] transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.1, y: -3, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        title="LinkedIn Profile"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </motion.a>

                      {/* Portfolio Website */}
                      <motion.a
                        href="https://www.vigneshlagishetti.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white rounded-xl hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.1, y: -3, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        title="Portfolio Website"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </motion.a>
                    </div>
                  </div>
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
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © 2026 Lagishetti Vignesh. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  )
}
