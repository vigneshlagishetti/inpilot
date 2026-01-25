'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  autoStart?: boolean // Auto-start recording on mount
}

export const VoiceRecorder = forwardRef(function VoiceRecorder({ onTranscriptionComplete, onRecordingStateChange, autoStart = false }: VoiceRecorderProps, ref) {
    // Expose startRecording to parent via ref
    useImperativeHandle(ref, () => ({
      startRecording,
      stopRecording
    }))
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [autoMode, setAutoMode] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false) // Paused after generating answer
  const [buttonLocked, setButtonLocked] = useState(false);
  const recognitionRef = useRef<any>(null)
  const lastButtonPressRef = useRef<number>(0)
  const recognitionRestartingRef = useRef(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)
  const transcriptRef = useRef('')
  const autoModeRef = useRef(autoStart)
  const isPausedRef = useRef(false)
  const isInitializedRef = useRef(false)
  const isMobile = useRef(false)
  const lastProcessedResultRef = useRef('')
  const resultIndexRef = useRef(0)
  const isProcessingRef = useRef(false)
  const phraseSetRef = useRef<Set<string>>(new Set());
  const { toast } = useToast()

  useEffect(() => {
    isRecordingRef.current = isRecording;
    if (!isRecording) setButtonLocked(false); // Unlock button when not recording
  }, [isRecording])

  useEffect(() => {
    autoModeRef.current = autoMode
  }, [autoMode])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) return
    
    // Detect mobile device
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    console.log('Device type:', isMobile.current ? 'Mobile' : 'Desktop')
    
    // Check microphone permissions first (especially important on mobile)
    const checkMicrophoneAccess = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          console.log('Microphone access granted')
          // Stop the stream immediately, we just needed to check permission
          stream.getTracks().forEach(track => track.stop())
          return true
        }
      } catch (error) {
        console.error('Microphone access error:', error)
        toast({
          title: 'Microphone Access Required',
          description: 'Please allow microphone access and reload the page.',
          variant: 'destructive',
        })
        return false
      }
      return true
    }
    
    // Initialize speech recognition
    const initializeSpeechRecognition = async () => {
      // Check microphone access first
      if (isMobile.current) {
        const hasAccess = await checkMicrophoneAccess()
        if (!hasAccess) return
      }
      
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

        // Clean up any existing recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
            recognitionRef.current = null
          } catch (e) {
            console.log('Previous recognition cleanup:', e)
          }
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        // Mobile-specific settings
        if (isMobile.current) {
          recognition.maxAlternatives = 1
          console.log('Mobile optimizations applied')
        }

      recognition.onstart = () => {
        setIsListening(true)
        console.log('Speech recognition started successfully')
        
        // On mobile, give user feedback that recording is active
        if (isMobile.current && !autoModeRef.current) {
          toast({
            title: 'Listening...',
            description: 'Speak now, the microphone is active.',
          })
        }
      }

      recognition.onaudiostart = () => {
        console.log('Audio input started - microphone is working')
      }

      recognition.onspeechstart = () => {
        console.log('Speech detected - user is speaking')
      }

      recognition.onspeechend = () => {
        console.log('Speech ended - user stopped speaking')
      }

      recognition.onaudioend = () => {
        console.log('Audio input ended')
      }

      recognition.onresult = (event: any) => {
        // Prevent processing if not actively recording or already processing
        if (!isRecordingRef.current || isProcessingRef.current) {
          console.log('Skipping result processing - not recording or already processing')
          return
        }
        isProcessingRef.current = true
        try {
          let currentInterim = ''
          let newFinalText = ''
          // Process only new results starting from the last processed index
          for (let i = resultIndexRef.current; i < event.results.length; i++) {
            let transcriptPiece = event.results[i][0].transcript.trim()
            // Remove repeated leading words (e.g., "okay okay tell" -> "okay tell")
            transcriptPiece = transcriptPiece.replace(/^(\w+)( \1)+/i, '$1')
            if (event.results[i].isFinal) {
              // Only add if not empty and not a duplicate at the end of transcript
              const prevTranscript = transcriptRef.current.trim()
              const lastWords = prevTranscript.split(' ').slice(-5).join(' ')
              const isDuplicateEnd = lastWords.endsWith(transcriptPiece)
              if (
                transcriptPiece &&
                transcriptPiece !== lastProcessedResultRef.current.trim() &&
                !isDuplicateEnd
              ) {
                newFinalText = transcriptPiece
                lastProcessedResultRef.current = transcriptPiece
                resultIndexRef.current = i + 1
                console.log('Added final text:', transcriptPiece)
                break // Only process one final result at a time
              }
            } else {
              // Show interim only for the latest result
              if (i === event.results.length - 1) {
                currentInterim = transcriptPiece
              }
            }
          }
          // Update interim transcript for real-time display
          if (currentInterim.trim() && currentInterim.trim() !== interimTranscript.trim()) {
            setInterimTranscript(currentInterim.trim())
            console.log('Updated interim:', currentInterim.trim())
          }
          if (newFinalText.trim()) {
            const cleanFinal = newFinalText.trim();
            // Remove repeated leading words (e.g., 'so so', 'okay okay')
            const cleanPhrase = cleanFinal.replace(/^(\w+)( \1)+/i, '$1');
            // Deduplicate at phrase level
            if (phraseSetRef.current.has(cleanPhrase)) {
              console.log('Phrase already added, skipping:', cleanPhrase);
            } else {
              phraseSetRef.current.add(cleanPhrase);
              setTranscript((prev) => {
                const newText = prev + (prev ? ' ' : '') + cleanPhrase;
                transcriptRef.current = newText;
                console.log('Updated full transcript:', newText);
                return newText;
              });
            }
            // Only clear interim if we have final text
            if (cleanFinal) {
              setInterimTranscript('');
            }
            // Reset silence timer when speech is detected
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }
            // Auto-stop after silence - 1.5s in continuous mode, 5s in manual mode on mobile
            const silenceDelay = autoModeRef.current 
              ? 1500 // 1.5 seconds in continuous mode 
              : (isMobile.current ? 5000 : 3000); // 5s for mobile manual, 3s for desktop manual
            silenceTimerRef.current = setTimeout(() => {
              if (isRecordingRef.current) {
                console.log('Silence timeout triggered after', silenceDelay, 'ms');
                stopRecording();
              }
            }, silenceDelay);
          }
        } finally {
          isProcessingRef.current = false
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event)
        
        switch (event.error) {
          case 'no-speech':
            if (isMobile.current) {
              toast({
                title: 'No Speech Detected',
                description: 'Try speaking louder or closer to your microphone. Make sure microphone access is allowed.',
              })
            } else {
              toast({
                title: 'No Speech Detected',
                description: 'Please speak clearly into your microphone.',
              })
            }
            break
          case 'not-allowed':
          case 'service-not-allowed':
            toast({
              title: 'Microphone Access Denied',
              description: 'Please allow microphone access in your browser settings and reload the page.',
              variant: 'destructive',
            })
            setIsRecording(false)
            onRecordingStateChange(false)
            break
          case 'network':
            toast({
              title: 'Network Error',
              description: 'Please check your internet connection and try again.',
              variant: 'destructive',
            })
            break
          case 'audio-capture':
            toast({
              title: 'Audio Capture Error',
              description: isMobile.current 
                ? 'Microphone error. Try closing other apps using the microphone and refresh the page.'
                : 'Please check your microphone and try again.',
              variant: 'destructive',
            })
            setIsRecording(false)
            onRecordingStateChange(false)
            break
          default:
            console.error('Unhandled speech recognition error:', event.error)
            break
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        console.log('Recognition ended, isRecording:', isRecordingRef.current, 'isMobile:', isMobile.current)
        // Prevent overlapping restarts
        if (recognitionRestartingRef.current) {
          console.log('Recognition restart already in progress, skipping')
          return
        }
        // On mobile, prevent rapid restarts that can cause duplicates
        if (isRecordingRef.current && recognitionRef.current && !isProcessingRef.current) {
          recognitionRestartingRef.current = true
          const restartDelay = isMobile.current ? 1000 : 100 // Much longer delay on mobile
          console.log(`Scheduling restart in ${restartDelay}ms`)
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                console.log('Attempting to restart recognition...')
                recognitionRef.current.start()
              } catch (e) {
                console.log('Could not restart recognition:', e)
                // On mobile, if restart fails, stop recording to prevent loops
                if (isMobile.current) {
                  setIsRecording(false)
                  onRecordingStateChange(false)
                }
              }
            }
            recognitionRestartingRef.current = false
          }, restartDelay)
        }
      }

      recognitionRef.current = recognition
      isInitializedRef.current = true
      console.log('Speech recognition initialized successfully')
      }
    }
    
    // Initialize with async wrapper
    initializeSpeechRecognition()

    return () => {
      console.log('VoiceRecorder cleanup')
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Cleanup recognition error:', e)
        }
        recognitionRef.current = null
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      isInitializedRef.current = false
    }
  }, [toast, onRecordingStateChange])

  const startRecording = () => {
    if (isRecordingRef.current || buttonLocked) {
      console.log('Recording already in progress or button locked');
      return;
    }
    setButtonLocked(true);
    // Reset all state and refs for new recording
    setTranscript('')
    setInterimTranscript('')
    transcriptRef.current = ''
    lastProcessedResultRef.current = ''
    resultIndexRef.current = 0
    isProcessingRef.current = false
    phraseSetRef.current = new Set();
    
    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    
    console.log('State reset complete, starting fresh recording')
    
    setIsRecording(true)
    onRecordingStateChange(true)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        console.log('Recording started, auto mode:', autoModeRef.current)
        if (!autoModeRef.current) {
          toast({
            title: 'Recording Started',
            description: isMobile.current ? 'Speak clearly into your phone...' : 'Speak your interview question...',
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
      // Always generate an answer for any speech input
      console.log('Processing speech:', finalText)
      onTranscriptionComplete(finalText)
      
      // Detect if this is a question for better user feedback
      const isQuestion = detectQuestion(finalText)
      console.log('Is question detected:', isQuestion)
      
      if (isQuestion) {
        toast({
          title: 'Question Detected',
          description: 'Generating answer...',
        })
      } else {
        toast({
          title: 'Speech Captured',
          description: 'Generating response...',
        })
      }
      
      // Pause auto mode to let user review the answer
      if (autoModeRef.current) {
        setIsPaused(true)
        console.log('Auto mode: Paused for answer review')
      }
    } else {
      console.log('No speech detected')
      toast({
        title: 'No Speech Detected',
        description: 'Please try again and speak clearly.',
      })
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
      <div className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 group">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Continuous Mode</span>
        <button
          type="button"
          onClick={toggleAutoMode}
          aria-label={autoMode ? 'Turn off continuous mode' : 'Turn on continuous mode'}
          className={`relative inline-flex h-4 w-7 sm:h-6 sm:w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 ${
            autoMode ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg hover:from-green-600 hover:to-green-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          }`}
          style={{ minHeight: '24px', minWidth: '28px' }}
        >
          <span
            className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-all duration-200 shadow-md hover:shadow-lg ${
              autoMode ? 'translate-x-3 sm:translate-x-5' : 'translate-x-0.5 sm:translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xs transition-colors duration-300 ${
          autoMode ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {autoMode ? 'ON' : 'Manual'}
        </span>
      </div>

      {/* Resume Button (only show when paused in auto mode) */}
      {autoMode && isPaused && (
        <div className="flex justify-center">
          <Button
            onClick={resumeListening}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 shadow-lg h-11 sm:h-12 group"
          >
            Ready for Next Question
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Button>
        </div>
      )}

      <Card className={`transition-all duration-500 ${isRecording ? 'ring-2 ring-blue-500 shadow-xl bg-blue-50/50 dark:bg-blue-950/20' : 'hover:shadow-lg'} group`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {/* Animated ring for recording */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
              )}
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/30 blur-xl' 
                  : 'bg-blue-500/0 group-hover:bg-blue-500/30 blur-xl'
              }`}></div>
              
              <Button
                type="button"
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                onPointerDown={(e) => {
                  if (buttonLocked) return;
                  // Longer debounce for mobile, shorter for desktop
                  const now = Date.now();
                  const debounceMs = isMobile.current ? 1000 : 500;
                  if (now - lastButtonPressRef.current < debounceMs) return;
                  lastButtonPressRef.current = now;
                  setButtonLocked(true);
                  // Immediately disable button until state changes
                  if (!isRecording) {
                    e.currentTarget.disabled = true;
                  }
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
                onClick={(e) => { e.preventDefault(); }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 select-none ${
                  isRecording 
                    ? 'recording-pulse scale-110 shadow-2xl' 
                    : 'hover:scale-110 hover:shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                } ${!isRecording ? 'group-hover:animate-pulse' : ''}`}
                disabled={buttonLocked || (autoMode && isRecording) || isPaused}
                style={{ touchAction: 'manipulation' }}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
                )}
              </Button>
            </div>
            
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm font-medium">
                {isPaused
                  ? 'Paused - Read & explain your answer'
                  : autoMode 
                    ? (isRecording ? 'Listening... (Auto mode)' : 'Processing...') 
                    : (isRecording ? 'Recording... (Stops after 1s silence)' : 'Click to start recording')
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

            {/* Next Question Button for Auto Mode */}
            {isPaused && autoMode && (
              <Button
                onClick={() => {
                  setIsPaused(false)
                  setTranscript('')
                  setInterimTranscript('')
                  transcriptRef.current = ''
                  lastProcessedResultRef.current = ''
                  resultIndexRef.current = 0
                  setTimeout(() => startRecording(), 500)
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
