'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Mic, MicOff, Volume2, Pause, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { analyzeConfidence, ConfidenceResult } from '@/lib/confidence'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  autoStart?: boolean
}

export const VoiceRecorder = forwardRef(function VoiceRecorder(
  { onTranscriptionComplete, onRecordingStateChange, autoStart = false }: VoiceRecorderProps,
  ref
) {
  // ── Display state ───────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('') // Native Web Speech live text
  const [autoMode, setAutoMode] = useState(autoStart)
  const [isPaused, setIsPaused] = useState(false) // used in auto mode when waiting for next question
  const [confidence, setConfidence] = useState<ConfidenceResult | null>(null)
  const { toast } = useToast()

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const audioChunksRef = useRef<Blob[]>([])
  const isRecordingRef = useRef(false)
  const autoModeRef = useRef(autoStart)
  const silenceStartRef = useRef<number | null>(null)
  const isMobileRef = useRef(false)
  const lastButtonPressRef = useRef(0)
  const restartingRef = useRef(false)
  const hasSpokenRef = useRef(false)
  const lastSpeechTimeRef = useRef<number | null>(null)
  const lastSpeechTextRef = useRef<string>('')
  
  // To avoid duplicate submissions
  const hasSubmittedRef = useRef(false)

  // ── Callbacks ref to avoid stale closures ───────────────────────────────────
  const onTranscriptionCompleteRef = useRef(onTranscriptionComplete)
  useEffect(() => { onTranscriptionCompleteRef.current = onTranscriptionComplete }, [onTranscriptionComplete])

  // ── Sync state → refs ───────────────────────────────────────────────────────
  useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])
  useEffect(() => { autoModeRef.current = autoMode }, [autoMode])

  // ── Expose to parent ────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({ startRecording, stopRecording }))

  useEffect(() => {
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    
    // Pre-request mic permission on mobile
    if (isMobileRef.current && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => stream.getTracks().forEach(t => t.stop()))
        .catch(() => {
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access and reload the page.',
            variant: 'destructive',
          })
        })
    }

    // Initialize Web Speech API for real-time display only
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        if (!isRecordingRef.current || hasSubmittedRef.current) return
        
        let final = ''
        let interim = ''
        for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += text + ' '
          } else {
            interim += text
          }
        }
        
        const cleanedLiveText = (final + interim).trim().replace(/\b(\w+)( \1\b)+/gi, '$1')
        setInterimTranscript(cleanedLiveText)
        
        // Normalize text to purely alphanumeric to prevent punctuation/capitalization changes from resetting the timer
        const normalizedText = cleanedLiveText.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        // Fallback: If Web Speech API heard something, the user has definitely spoken
        if (normalizedText.length > 0) {
          if (!hasSpokenRef.current) hasSpokenRef.current = true
          
          // Only reset the silence timer if the recognized words actually changed
          if (normalizedText !== lastSpeechTextRef.current) {
            lastSpeechTimeRef.current = Date.now()
            lastSpeechTextRef.current = normalizedText
          }
        }
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' && isRecordingRef.current && !hasSubmittedRef.current) {
          restartRecognition(recognition)
        }
      }

      recognition.onend = () => {
        if (isRecordingRef.current && !hasSubmittedRef.current) {
          restartRecognition(recognition)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      cleanupAudio()
    }
  }, [toast])

  const restartRecognition = (recognition: any) => {
    if (restartingRef.current) return
    restartingRef.current = true
    setTimeout(() => {
      if (isRecordingRef.current && !hasSubmittedRef.current) {
        try { recognition.start() } catch (e) {
          setTimeout(() => { try { recognition.start() } catch (_) {} }, 250)
        }
      }
      restartingRef.current = false
    }, 100)
  }

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    analyserRef.current = null
  }, [])

  // ── Silence detection & Audio Visualizer ────────────────────────────────────
  const checkSilence = useCallback(() => {
    if (!isRecordingRef.current || !analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    // 1. Draw Visualizer
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const width = canvas.width
        const height = canvas.height
        ctx.clearRect(0, 0, width, height)

        const barWidth = (width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2
          
          // Gradient based on height
          const gradient = ctx.createLinearGradient(0, height, 0, 0)
          gradient.addColorStop(0, '#3b82f6') // blue-500
          gradient.addColorStop(1, '#8b5cf6') // violet-500

          ctx.fillStyle = gradient
          ctx.fillRect(x, height - barHeight, barWidth, barHeight)
          x += barWidth + 1
        }
      }
    }

    // 2. Advanced VAD (Voice Activity Detection)
    // Human voice is primarily between 300Hz and 3000Hz (bins 3 through 33)
    let voiceSum = 0
    const startBin = 3
    const endBin = 33
    
    for (let i = startBin; i <= endBin && i < bufferLength; i++) {
      voiceSum += dataArray[i]
    }
    const voiceAverage = voiceSum / (endBin - startBin + 1)

    // Increase threshold massively to 100 to completely ignore fans/AC/background noise.
    // Human speech usually spikes above 120-200. Background noise is typically 10-60.
    const silenceThreshold = 100 
    const now = Date.now()

    // If Web Speech API is working, it already updates lastSpeechTimeRef in onresult.
    // We only use this raw audio VAD as a fallback for browsers without Speech API.
    if (voiceAverage >= silenceThreshold && !recognitionRef.current) {
      lastSpeechTimeRef.current = now
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true // User has started speaking
      }
    } 
    
    // Check if we should stop
    if (lastSpeechTimeRef.current && hasSpokenRef.current) {
      const silenceDuration = now - lastSpeechTimeRef.current
      // If they have spoken, wait exactly 2 seconds of silence to assume they finished (ONLY in Auto Mode)
      if (silenceDuration > 2000) {
        if (autoModeRef.current) {
          stopRecording(true)
          return // Stop polling
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(checkSilence)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Process Audio via Whisper ─────────────────────────────────────────────────
  const processAudio = async (blob: Blob, filename: string = 'audio.webm') => {
    if (blob.size === 0) return

    setIsProcessing(true)
    toast({ title: 'Processing', description: 'Transcribing with AI for high accuracy...' })

    try {
      const formData = new FormData()
      formData.append('file', blob, filename)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      const text = data.text?.trim()

      if (text) {
        setTranscript(text)
        setConfidence(analyzeConfidence(text))
        setInterimTranscript('') // Clear the live native text
        hasSubmittedRef.current = true
        onTranscriptionCompleteRef.current(text)
        
        toast({
          title: detectQuestion(text) ? 'Question Detected' : 'Speech Captured',
          description: 'Generating answer...',
        })
        
        if (autoModeRef.current) {
          setIsPaused(true)
        }
      } else {
        toast({ title: 'No Speech Detected', description: 'Please try again.', variant: 'destructive' })
        if (autoModeRef.current) setIsPaused(true)
      }
    } catch (error) {
      console.error('[VoiceRecorder] Transcription error:', error)
      toast({
        title: 'Transcription Failed',
        description: 'Could not process audio. Please try again.',
        variant: 'destructive'
      })
      if (autoModeRef.current) setIsPaused(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // ── Start recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return

    // Reset state
    hasSubmittedRef.current = false
    hasSpokenRef.current = false
    lastSpeechTimeRef.current = null
    lastSpeechTextRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setConfidence(null)
    setIsPaused(false)
    silenceStartRef.current = null
    cleanupAudio()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Only process if we actually recorded something and haven't processed yet
        if (audioChunksRef.current.length > 0 && !hasSubmittedRef.current) {
          const mimeType = mediaRecorder.mimeType || 'audio/webm'
          const fileExtension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
          
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType }) 
          processAudio(audioBlob, `audio.${fileExtension}`)
        }
      }

      // Setup audio analysis for silence detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 512
      analyser.minDecibels = -70
      analyser.maxDecibels = -10
      analyser.smoothingTimeConstant = 0.8
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Start MediaRecorder (Whisper backend)
      mediaRecorder.start()
      
      // Start Native Speech Recognition (Live UI feedback)
      if (recognitionRef.current) {
        restartingRef.current = false
        try { recognitionRef.current.start() } catch (e) {}
      }

      setIsRecording(true)
      isRecordingRef.current = true
      onRecordingStateChange(true)
      
      if (!autoModeRef.current) {
        toast({
          title: 'Recording Started',
          description: isMobileRef.current
            ? 'Speak clearly into your phone...'
            : 'Speak your interview question...',
        })
      }

      // Start silence polling
      checkSilence()

    } catch (error) {
      console.error('[VoiceRecorder] Could not start:', error)
      toast({
        title: 'Error',
        description: 'Could not start recording. Check microphone permissions.',
        variant: 'destructive',
      })
      setIsRecording(false)
      onRecordingStateChange(false)
    }
  }, [checkSilence, cleanupAudio, onRecordingStateChange, toast])

  // ── Stop recording ──────────────────────────────────────────────────────────
  const stopRecording = useCallback((submit: boolean = true) => {
    if (!isRecordingRef.current) return
    
    setIsRecording(false)
    isRecordingRef.current = false
    onRecordingStateChange(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (!submit) {
        hasSubmittedRef.current = true // Prevent submission on stop
      }
      mediaRecorderRef.current.stop() // this triggers processAudio
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }, [onRecordingStateChange])

  // ── Auto mode toggle ────────────────────────────────────────────────────────
  const toggleAutoMode = useCallback(() => {
    const newMode = !autoMode
    setAutoMode(newMode)
    setIsPaused(false)
    if (newMode && !isRecordingRef.current) {
      startRecording()
    }
  }, [autoMode, startRecording])

  // ── Resume from auto-mode pause ─────────────────────────────────────────────
  const resumeListening = useCallback(() => {
    setIsPaused(false)
    if (autoModeRef.current) {
      startRecording()
      toast({ title: 'Resumed', description: 'Listening for next question...' })
    }
  }, [startRecording, toast])

  // ── Question detection ──────────────────────────────────────────────────────
  function detectQuestion(text: string): boolean {
    const cleaned = text.toLowerCase().trim()
      .replace(/^(so|okay|well|now|alright|right|um|uh|let me see|hmm)\s+/i, '')
      .trim()

    if (cleaned.endsWith('?')) return true

    const introPatterns = [
      'introduce yourself', 'tell me about yourself', 'tell me about you',
      'describe yourself', 'who are you', "what's your name", 'what is your name'
    ]
    if (introPatterns.some(p => cleaned.includes(p))) return true

    const questionStarts = [
      'what', 'when', 'where', 'who', 'whom', 'whose', 'which', 'why', 'how',
      'can you', 'could you', 'would you', 'will you', 'should you',
      'do you', 'does', 'did you', 'have you', 'has', 'had you',
      'is', 'are', 'was', 'were', 'am',
      'tell me', 'explain', 'describe', 'define', 'compare',
      'walk me through', 'walk through', 'talk about'
    ]
    if (questionStarts.some(w => cleaned.startsWith(w + ' ') || cleaned.startsWith(w + "'"))) return true

    const patterns = [
      'can you tell', 'could you explain', 'what is', 'what are', 'what have',
      'how do', 'how can', 'how to', 'why do', 'design a', 'design the',
      'implement a', 'implement the', 'build a', 'build the', 'system design'
    ]
    if (patterns.some(p => cleaned.includes(p))) return true

    const designWords = ['design', 'implement', 'build', 'create', 'develop', 'write a', 'code a', 'solve', 'find', 'calculate']
    if (cleaned.split(' ').length <= 6 && designWords.some(w => cleaned.includes(w))) return true

    return false
  }

  // ── Button handler ──────────────────────────────────────────────────────────
  const handleMicPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const now = Date.now()
    const debounce = isMobileRef.current ? 800 : 400
    if (now - lastButtonPressRef.current < debounce) return
    lastButtonPressRef.current = now

    if (isRecording) {
      stopRecording(true)
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Manual/Auto Mode Toggle */}
      <div className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
        <span className={`text-xs sm:text-sm font-semibold transition-all duration-200 ${!autoMode
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-400 dark:text-gray-500'
          }`}>
          Manual
        </span>

        <Button
          type="button"
          onClick={toggleAutoMode}
          className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center justify-start rounded-full p-0.5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm hover:shadow ${autoMode
            ? 'bg-green-500 focus:ring-green-500'
            : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400'
            }`}
          aria-pressed={autoMode ? 'true' : 'false'}
          title={autoMode ? "Switch to Manual Mode" : "Switch to Auto Mode"}
        >
          <span
            className={`flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ease-in-out ${autoMode
              ? 'translate-x-5 sm:translate-x-5'
              : 'translate-x-0'
              }`}
          >
            <span className={`w-2 h-2 rounded-full transition-colors duration-200 ${autoMode
              ? 'bg-green-500'
              : 'bg-gray-400'
            }`} />
          </span>
        </Button>

        <span className={`text-xs sm:text-sm font-semibold transition-all duration-200 ${autoMode
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-400 dark:text-gray-500'
          }`}>
          Auto
        </span>
      </div>

      {/* Resume Button (auto mode paused) */}
      {autoMode && isPaused && (
        <div className="flex justify-center">
          <Button
            onClick={resumeListening}
            variant="default"
            size="default"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg px-6 py-2 text-sm group"
          >
            Ready for Next Question
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Button>
        </div>
      )}

      {/* Main Recording Card */}
      <Card className={`transition-all duration-300 ${isRecording ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/30 dark:bg-blue-950/10' : 'hover:shadow-md'} group border-gray-200 dark:border-gray-700`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {/* Animated ring */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              )}
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isRecording
                ? 'bg-red-500/20 blur-lg'
                : 'bg-blue-500/0 group-hover:bg-blue-500/20 blur-lg'
                }`} />
              <Button
                type="button"
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                onClick={handleMicPress}
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full transition-all duration-200 select-none ${isRecording
                  ? 'recording-pulse scale-105 shadow-xl'
                  : 'hover:scale-105 hover:shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } ${!isRecording ? 'group-hover:animate-pulse' : ''}`}
                disabled={(autoMode && isRecording) || isProcessing}
                style={{ touchAction: 'manipulation' }}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
                )}
              </Button>
            </div>

            {/* Status text */}
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm font-medium">
                {isProcessing
                  ? 'Generating exact transcript...'
                  : isPaused
                    ? 'Paused - Read & explain your answer'
                    : autoMode
                      ? (isRecording ? 'Listening... (Stops after silence)' : 'Processing...')
                      : (isRecording ? 'Recording... (Stops after silence)' : 'Click to start recording')
                }
              </p>
              {isRecording && !isPaused && !isProcessing && (
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Listening...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
                  <span className="text-xs text-muted-foreground">Whisper AI Processing...</span>
                </div>
              )}
            </div>

            {/* Audio Visualizer Canvas */}
            <div className={`transition-all duration-300 overflow-hidden ${isRecording && !isPaused ? 'h-16 opacity-100 mt-2' : 'h-0 opacity-0 mt-0'}`}>
              <canvas
                ref={canvasRef}
                width={200}
                height={60}
                className="rounded-md bg-transparent"
              />
            </div>

            {/* Transcript display (Live native text OR Final Whisper text) */}
            {(transcript || interimTranscript) && (
              <div className="w-full p-3 bg-muted rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {transcript ? 'Final Transcript:' : 'Live Transcript (Web Speech API):'}
                  </p>
                  {confidence && (
                    <div className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                      confidence.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      confidence.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      Confidence: {confidence.score}% {confidence.fillerCount > 0 && `(${confidence.fillerCount} fillers)`}
                    </div>
                  )}
                </div>
                
                {transcript ? (
                  <div 
                    className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: confidence?.highlightedHtml || transcript }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic break-words leading-relaxed">
                    {interimTranscript}
                  </p>
                )}
              </div>
            )}

            {/* Next Question Button for Auto Mode */}
            {isPaused && autoMode && (
              <Button
                onClick={() => {
                  setIsPaused(false)
                  setTranscript('')
                  setInterimTranscript('')
                  setConfidence(null)
                  startRecording()
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-sm py-2"
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Stop Button */}
      {isRecording && !autoMode && (
        <div className="flex justify-center">
          <Button
            onClick={() => stopRecording(true)}
            variant="outline"
            size="sm"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-sm transition-all duration-200 px-6"
          >
            Stop Recording
          </Button>
        </div>
      )}
    </div>
  )
})
