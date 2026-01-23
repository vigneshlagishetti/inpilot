'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  autoStart?: boolean // Auto-start recording on mount
}

export function VoiceRecorder({ onTranscriptionComplete, onRecordingStateChange, autoStart = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [autoMode, setAutoMode] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false) // Paused after generating answer
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)
  const transcriptRef = useRef('')
  const autoModeRef = useRef(autoStart)
  const isPausedRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    autoModeRef.current = autoMode
  }, [autoMode])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        toast({
          title: 'Browser Not Supported',
          description: 'Your browser does not support speech recognition. Please use Chrome or Edge.',
          variant: 'destructive',
        })
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        console.log('Speech recognition started')
      }

      recognition.onresult = (event: any) => {
        let currentInterim = ''
        let currentFinal = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            currentFinal += transcriptPiece + ' '
          } else {
            currentInterim += transcriptPiece
          }
        }

        // Update interim transcript for real-time display
        setInterimTranscript(currentInterim)

        if (currentFinal) {
          setTranscript((prev) => {
            const newText = prev + currentFinal
            transcriptRef.current = newText
            return newText
          })
          setInterimTranscript('')
          
          // Reset silence timer when speech is detected
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }

          // Auto-stop after 2 seconds of silence
          silenceTimerRef.current = setTimeout(() => {
            if (isRecordingRef.current) {
              stopRecording()
            }
          }, 2000)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          toast({
            title: 'No Speech Detected',
            description: 'Please speak clearly into your microphone.',
          })
        } else if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone Access Denied',
            description: 'Please allow microphone access in your browser settings.',
            variant: 'destructive',
          })
          setIsRecording(false)
          onRecordingStateChange(false)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        console.log('Recognition ended, isRecording:', isRecordingRef.current)
        // Only restart if we're still supposed to be recording
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log('Could not restart recognition:', e)
          }
        }
      }

      recognitionRef.current = recognition
    }

    // Auto-start recording if autoStart is enabled
    if (autoStart && recognitionRef.current) {
      setTimeout(() => {
        startRecording()
      }, 500)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [toast, onRecordingStateChange, autoStart])

  const startRecording = () => {
    setTranscript('')
    setInterimTranscript('')
    transcriptRef.current = ''
    setIsRecording(true)
    onRecordingStateChange(true)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        console.log('Recording started, auto mode:', autoModeRef.current)
        if (!autoModeRef.current) {
          toast({
            title: 'Recording Started',
            description: 'Speak your interview question...',
          })
        }
      } catch (error: any) {
        console.error('Error starting recognition:', error)
        toast({
          title: 'Error',
          description: 'Could not start recording. Please check microphone permissions.',
          variant: 'destructive',
        })
        setIsRecording(false)
        onRecordingStateChange(false)
      }
    } else {
      toast({
        title: 'Not Available',
        description: 'Speech recognition is not available in your browser.',
        variant: 'destructive',
      })
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    onRecordingStateChange(false)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('Recognition already stopped')
      }
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }

    // Use ref to get the latest transcript value
    const finalText = transcriptRef.current.trim()
    console.log('Stopping recording, final text:', finalText)
    console.log('Auto mode enabled:', autoModeRef.current)
    
    if (finalText) {
      // Detect if this is a question (interviewer speaking)
      const isQuestion = detectQuestion(finalText)
      console.log('Is question detected:', isQuestion)
      
      if (isQuestion) {
        // This is likely the interviewer asking a question
        onTranscriptionComplete(finalText)
        toast({
          title: 'Question Detected',
          description: 'Generating answer...',
        })
        
        // Pause listening in auto mode to let user read and speak
        if (autoModeRef.current) {
          setIsPaused(true)
          console.log('Auto mode: Paused. User can now read and explain the answer.')
          toast({
            title: 'Paused',
            description: 'Read the answer and explain it. Click "Next Question" when ready.',
            duration: 5000,
          })
        }
      } else {
        // This is likely your answer, skip AI generation
        console.log('User response detected, skipping AI generation:', finalText)
        toast({
          title: 'Your Response Captured',
          description: 'Waiting for next question...',
        })
        
        // Auto-restart immediately for next question
        if (autoModeRef.current && !isPausedRef.current) {
          console.log('Auto mode: restarting for next question in 1.5 seconds')
          setTimeout(() => {
            console.log('Auto mode: restarting recording now')
            startRecording()
          }, 1500)
        }
      }
    } else {
      console.log('No speech detected')
      toast({
        title: 'No Speech Detected',
        description: 'Please try again and speak clearly.',
      })
      
      // Auto-restart even if no speech detected
      if (autoModeRef.current) {
        console.log('Auto mode: restarting after no speech in 2 seconds')
        setTimeout(() => {
          console.log('Auto mode: restarting recording now')
          startRecording()
        }, 2000)
      }
    }
  }

  // Detect if text is a question
  const detectQuestion = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim()
    
    // Remove casual speech prefixes (so, okay, well, now, alright, etc.)
    const cleanedText = lowerText
      .replace(/^(so|okay|well|now|alright|right|um|uh|let me see|hmm)\s+/i, '')
      .trim()
    
    // Check if ends with question mark
    if (cleanedText.endsWith('?')) return true
    
    // Self-introduction patterns (always questions in interviews)
    const introPatterns = [
      'introduce yourself', 'introduce your self', 'tell me about yourself',
      'tell me about you', 'tell about yourself', 'talk about yourself',
      'describe yourself', 'who are you', "what's your name", 'what is your name'
    ]
    
    for (const pattern of introPatterns) {
      if (cleanedText.includes(pattern)) {
        console.log('Detected introduction request:', pattern)
        return true
      }
    }
    
    // Question word patterns
    const questionWords = [
      'what', 'when', 'where', 'who', 'whom', 'whose', 'which', 'why', 'how',
      'can you', 'could you', 'would you', 'will you', 'should you',
      'do you', 'does', 'did you', 'have you', 'has', 'had you',
      'is', 'are', 'was', 'were', 'am',
      'tell me', 'explain', 'describe', 'define', 'compare', 'walk me through',
      'walk through', 'talk about'
    ]
    
    // Design/implementation patterns (common in interviews)
    const designPatterns = [
      'design', 'implement', 'build', 'create', 'develop',
      'write a', 'code a', 'solve', 'find', 'calculate'
    ]
    
    // Check if starts with question word
    for (const word of questionWords) {
      if (cleanedText.startsWith(word + ' ') || cleanedText.startsWith(word + "'")) {
        console.log('Detected question word:', word)
        return true
      }
    }
    
    // Check if starts with design/implementation patterns
    for (const word of designPatterns) {
      if (cleanedText.startsWith(word + ' ')) {
        console.log('Detected design pattern:', word)
        return true
      }
    }
    
    // Check for question patterns anywhere
    if (cleanedText.includes('can you tell') || 
        cleanedText.includes('could you explain') ||
        cleanedText.includes('what is') ||
        cleanedText.includes('what are') ||
        cleanedText.includes('what have') ||
        cleanedText.includes('how do') ||
        cleanedText.includes('how can') ||
        cleanedText.includes('how to') ||
        cleanedText.includes('why do') ||
        cleanedText.includes('design a') ||
        cleanedText.includes('design the') ||
        cleanedText.includes('implement a') ||
        cleanedText.includes('implement the') ||
        cleanedText.includes('build a') ||
        cleanedText.includes('build the') ||
        cleanedText.includes('using system design') ||
        cleanedText.includes('system design')) {
      console.log('Detected question pattern in text')
      return true
    }
    
    // Check if it's a common interview request format
    // e.g., "design whatsapp", "implement LRU cache", "solve two sum"
    const words = cleanedText.split(' ')
    if (words.length <= 6 && designPatterns.some(pattern => cleanedText.includes(pattern))) {
      console.log('Detected short design command')
      return true
    }
    
    console.log('Not detected as question')
    return false
  }

  const toggleAutoMode = () => {
    setAutoMode(!autoMode)
    setIsPaused(false)
    if (!autoMode && !isRecording) {
      // Start recording when enabling auto mode
      startRecording()
    }
  }

  const resumeListening = () => {
    setIsPaused(false)
    if (autoModeRef.current) {
      startRecording()
      toast({
        title: 'Resumed',
        description: 'Listening for next question...',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Auto Mode Toggle */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
        <span className="text-xs sm:text-sm font-medium">Continuous Mode</span>
        <button
          onClick={toggleAutoMode}
          aria-label={autoMode ? 'Turn off continuous mode' : 'Turn on continuous mode'}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoMode ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-xs text-muted-foreground">
          {autoMode ? 'ON - Auto-listening' : 'OFF - Manual'}
        </span>
      </div>

      {/* Resume Button (only show when paused in auto mode) */}
      {autoMode && isPaused && (
        <div className="flex justify-center">
          <Button
            onClick={resumeListening}
            variant="default"
            size="lg"
            className="bg-green-600 hover:bg-green-700 h-11 sm:h-12"
          >
            Ready for Next Question →
          </Button>
        </div>
      )}

      <Card className={`transition-all duration-300 ${isRecording ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center space-y-4">
            <Button
              size="lg"
              variant={isRecording ? 'destructive' : 'default'}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${isRecording ? 'recording-pulse' : ''}`}
              disabled={(autoMode && isRecording) || isPaused}
            >
              {isRecording ? <MicOff className="w-6 h-6 sm:w-8 sm:h-8" /> : <Mic className="w-6 h-6 sm:w-8 sm:h-8" />}
            </Button>
            
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm font-medium">
                {isPaused
                  ? 'Paused - Read & explain your answer'
                  : autoMode 
                    ? (isRecording ? 'Listening... (Auto mode)' : 'Processing...') 
                    : (isRecording ? 'Recording... (Stops after 2s silence)' : 'Click to start recording')
                }
              </p>
              {isListening && !isPaused && (
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Listening...</span>
                </div>
              )}
            </div>

            {(transcript || interimTranscript) && (
              <div className="w-full p-3 sm:p-4 bg-muted rounded-lg">
                <p className="text-xs sm:text-sm font-medium mb-2">Transcript:</p>
                <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 break-words">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-gray-400 italic">{interimTranscript}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
