'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Mic, MicOff, Volume2, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  autoStart?: boolean // Auto-start recording on mount
}

export const VoiceRecorder = forwardRef(function VoiceRecorder({ onTranscriptionComplete, onRecordingStateChange, autoStart = false }: VoiceRecorderProps, ref) {
  // All hooks must be declared here, at the top level of the component:
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoMode, setAutoMode] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isTemporarilyPaused, setIsTemporarilyPaused] = useState(false);
  const [buttonLocked, setButtonLocked] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastButtonPressRef = useRef<number>(0);
  const recognitionRestartingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef('');
  const autoModeRef = useRef(autoStart);
  const isPausedRef = useRef(false);
  const isTemporarilyPausedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isMobile = useRef(false);
  const lastProcessedResultRef = useRef('');
  const resultIndexRef = useRef(0);
  const isProcessingRef = useRef(false);
  const phraseSetRef = useRef<Set<string>>(new Set());
  const hasSpeechStartedRef = useRef(false);
  const currentInterimTextRef = useRef(''); // Track current interim text
  const { toast } = useToast()

  // Expose startRecording to parent via ref
  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }))

  // When autoMode changes, start or stop recording automatically
  useEffect(() => {
    if (autoMode && !isRecording) {
      startRecording();
    } else if (!autoMode && isRecording) {
      stopRecording();
    }
  }, [autoMode]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
    if (!isRecording) {
      setButtonLocked(false); // Unlock button when not recording
      setRecognitionActive(false); // Mark recognition as inactive
    }
  }, [isRecording]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isTemporarilyPausedRef.current = isTemporarilyPaused;
  }, [isTemporarilyPaused]);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) return;

    (async () => {
      // Detect mobile device
      isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('Device type:', isMobile.current ? 'Mobile' : 'Desktop');

      // Check microphone permissions first (especially important on mobile)
      const checkMicrophoneAccess = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');
            stream.getTracks().forEach(track => track.stop());
            return true;
          }
        } catch (error) {
          console.error('Microphone access error:', error);
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access and reload the page.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      };

      // Initialize speech recognition
      const initializeSpeechRecognition = async () => {
        if (isMobile.current) {
          const hasAccess = await checkMicrophoneAccess();
          if (!hasAccess) return;
        }
        if (typeof window !== 'undefined') {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (!SpeechRecognition) {
            toast({
              title: 'Browser Not Supported',
              description: 'Your browser does not support speech recognition. Please use Chrome or Edge.',
              variant: 'destructive',
            });
            return;
          }
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              recognitionRef.current = null;
            } catch (e) {
              console.log('Previous recognition cleanup:', e);
            }
          }
          const recognition = new SpeechRecognition();
          
          // Enable continuous mode for both mobile and desktop
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          if (isMobile.current) {
            recognition.maxAlternatives = 1;
            console.log('Mobile speech recognition configured with continuous mode');
          } else {
            console.log('Desktop speech recognition configured');
          }
          recognition.onstart = () => {
            setIsListening(true);
            setRecognitionActive(true);
            console.log('Speech recognition started successfully');
            if (isMobile.current) {
              console.log('Mobile: Mic is active - listening continuously...');
            }
          };
          recognition.onaudiostart = () => {
            console.log('Audio input started - microphone is working');
          };
          recognition.onspeechstart = () => {
            console.log('Speech detected - user is speaking');
            // Mark that speech has started (timer will be managed by onresult)
            hasSpeechStartedRef.current = true;
            // Clear any existing timer from before speech started
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          };
          recognition.onspeechend = () => {
            console.log('Speech ended - user stopped speaking');
            // Don't stop immediately - let the silence timer handle it
          };
          recognition.onaudioend = () => {
            console.log('Audio input ended');
          };
          recognition.onresult = (event: any) => {
            if (!isRecordingRef.current || isProcessingRef.current || isTemporarilyPausedRef.current) {
              console.log('Skipping result processing - not recording, already processing, or paused');
              return;
            }
            isProcessingRef.current = true;
            try {
              let currentInterim = '';
              let newFinalText = '';
              let gotFinal = false;
              
              // Check if we have actual speech content
              let hasValidSpeech = false;
              
              for (let i = resultIndexRef.current; i < event.results.length; i++) {
                if (i < resultIndexRef.current) continue;
                let transcriptPiece = event.results[i][0].transcript.trim();
                
                // Only count as valid speech if we have actual words
                if (transcriptPiece && transcriptPiece.length > 0) {
                  hasValidSpeech = true;
                  // Mark that speech has started with actual content
                  hasSpeechStartedRef.current = true;
                }
                
                transcriptPiece = transcriptPiece.replace(/\b(\w+)( \1\b)+/gi, '$1');
                const lastTranscript = transcriptRef.current;
                
                // Only start silence timer if we have valid speech content
                if (hasValidSpeech && hasSpeechStartedRef.current) {
                  // Clear existing timer and reset it
                  if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current);
                  }
                  
                  // Start new 1.5s silence timer
                  silenceTimerRef.current = setTimeout(() => {
                    console.log('1.5 seconds of silence detected - processing speech');
                    console.log('transcriptRef.current:', transcriptRef.current);
                    console.log('transcript state:', transcript);
                    console.log('interimTranscript:', interimTranscript);
                    if (isRecordingRef.current) {
                      // Use transcriptRef.current as the primary source of truth
                      const answerText = transcriptRef.current.trim();
                      
                      if (answerText) {
                        console.log('Sending transcript to AI:', answerText);
                        setTranscript(answerText);
                        setInterimTranscript('');
                        onTranscriptionComplete(answerText);
                        toast({
                          title: 'Generating Answer',
                          description: 'Processing your question...',
                          variant: 'default',
                        });
                      } else {
                        console.warn('No transcript to send - transcript is empty');
                        toast({
                          title: 'No Speech Detected',
                          description: 'Please try again',
                          variant: 'destructive',
                        });
                      }
                      stopRecording();
                      if (autoModeRef.current) {
                        setIsPaused(true);
                      }
                    }
                  }, 1500);
                  
                  console.log('Silence timer reset - actively listening...');
                  console.log('Current accumulated transcript:', transcriptRef.current);
                }
                if (event.results[i].isFinal) {
                  gotFinal = true;
                  console.log('Final result received:', transcriptPiece);
                  console.log('Current full transcript (ref):', transcriptRef.current);
                  console.log('Current full transcript (state):', transcript);
                  console.log('Phrase already in set?', phraseSetRef.current.has(transcriptPiece));
                  console.log('Is duplicate?', lastTranscript && (lastTranscript.includes(transcriptPiece) || transcriptPiece.includes(lastTranscript)));
                  
                  if (
                    phraseSetRef.current.has(transcriptPiece) ||
                    !transcriptPiece ||
                    (lastTranscript && (lastTranscript.includes(transcriptPiece) || transcriptPiece.includes(lastTranscript)))
                  ) {
                    console.log('Phrase already added, empty, or near-duplicate, skipping:', transcriptPiece);
                  } else {
                    console.log('Adding new phrase to transcript:', transcriptPiece);
                    phraseSetRef.current.add(transcriptPiece);
                    
                    // Get current transcript value before updating
                    const currentTranscript = transcriptRef.current;
                    console.log('Before update - transcriptRef:', currentTranscript);
                    
                    setTranscript((prev) => {
                      const newText = prev + (prev ? ' ' : '') + transcriptPiece;
                      transcriptRef.current = newText;
                      console.log('After update - new full transcript:', newText);
                      return newText;
                    });
                  }
                  lastProcessedResultRef.current = transcriptPiece;
                  resultIndexRef.current = i + 1;
                  break;
                } else {
                  if (i === event.results.length - 1) {
                    currentInterimTextRef.current = transcriptPiece // Save to ref
                    setInterimTranscript(transcriptPiece);
                    currentInterim = transcriptPiece;
                    console.log('Updated interim:', transcriptPiece);
                  }
                }
              }
              let speechDetected = false;
              if (currentInterim.trim() && currentInterim.trim() !== interimTranscript.trim()) {
                const cleanInterim = currentInterim.trim().replace(/\b(\w+)( \1\b)+/gi, '$1');
                currentInterimTextRef.current = cleanInterim // Save to ref
                setInterimTranscript(cleanInterim);
                speechDetected = true;
                console.log('Updated interim:', cleanInterim);
              }
              if (newFinalText.trim()) {
                const cleanFinal = newFinalText.trim();
                const cleanPhrase = cleanFinal.replace(/\b(\w+)( \1\b)+/gi, '$1');
                if (phraseSetRef.current.has(cleanPhrase) || !cleanPhrase) {
                  console.log('Phrase already added or empty, skipping:', cleanPhrase);
                } else {
                  phraseSetRef.current.add(cleanPhrase);
                  setTranscript((prev) => {
                    const newText = prev + (prev ? ' ' : '') + cleanPhrase;
                    transcriptRef.current = newText;
                    console.log('Updated full transcript:', newText);
                    return newText;
                  });
                }
                if (cleanFinal) {
                  setInterimTranscript('');
                }
              }
              // Timer is already managed at the top of this handler (line ~173)
              // No need to clear or reset it again here
            } catch (err) {
              console.error('Error in recognition.onresult:', err);
            } finally {
              isProcessingRef.current = false;
            }
          };
          recognition.onend = () => {
            setIsListening(false);
            setRecognitionActive(false);
            console.log('Recognition ended, isRecording:', isRecordingRef.current, 'isMobile:', isMobile.current, 'hasSpeech:', hasSpeechStartedRef.current);
            
            if (recognitionRestartingRef.current) {
              console.log('Recognition restart already in progress, skipping');
              return;
            }
            
            // For both mobile and desktop: maintain continuous listening
            if (isRecordingRef.current && recognitionRef.current && !isPausedRef.current && !isTemporarilyPausedRef.current) {
              // If speech hasn't started yet, restart immediately to keep listening
              if (!hasSpeechStartedRef.current) {
                recognitionRestartingRef.current = true;
                // Slightly longer delay for mobile to ensure proper restart
                const restartDelay = isMobile.current ? 100 : 50;
                console.log(`${isMobile.current ? 'Mobile' : 'Desktop'}: No speech yet - restarting in ${restartDelay}ms to keep listening...`);
                setTimeout(() => {
                  if (isRecordingRef.current && recognitionRef.current) {
                    try {
                      recognitionRef.current.start();
                      console.log('Recognition restarted - actively listening for speech');
                    } catch (e) {
                      console.log('Could not restart recognition:', e);
                      // If restart fails, try again after a bit
                      if (isRecordingRef.current) {
                        setTimeout(() => {
                          if (isRecordingRef.current && recognitionRef.current) {
                            try {
                              recognitionRef.current.start();
                            } catch (err) {
                              console.error('Second restart attempt failed:', err);
                            }
                          }
                        }, 200);
                      }
                    }
                  }
                  recognitionRestartingRef.current = false;
                }, restartDelay);
              } else {
                console.log('Speech was detected - letting silence timer handle completion');
              }
            }
          };
          recognitionRef.current = recognition;
          isInitializedRef.current = true;
          console.log('Speech recognition initialized successfully');
        }
      };
      await initializeSpeechRecognition();
    })();

    return () => {
      console.log('VoiceRecorder cleanup');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup recognition error:', e);
        }
        recognitionRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  const startRecording = () => {
    if (isRecordingRef.current || buttonLocked || recognitionActive) {
      console.log('Recording already in progress, button locked, or recognition active');
      return;
    }
    setButtonLocked(true);
    setRecognitionActive(true);
    // Reset all state and refs for new recording
    setTranscript('')
    setInterimTranscript('')
    transcriptRef.current = ''
    lastProcessedResultRef.current = ''
    resultIndexRef.current = 0
    isProcessingRef.current = false
    phraseSetRef.current = new Set();
    hasSpeechStartedRef.current = false; // Reset speech detection flag
    setIsPaused(false); // Reset answer review pause state
    setIsTemporarilyPaused(false); // Reset temporary pause state

    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    // Do NOT start silence timer here - it will start when speech is detected

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
      toast({
        title: 'Answer Callback Triggered',
        description: `Transcript sent: ${finalText}`,
        variant: 'default',
      })
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
      // In auto mode, automatically resume listening after short delay
      if (autoModeRef.current) {
        setTimeout(() => {
          setTranscript('')
          setInterimTranscript('')
          transcriptRef.current = ''
          lastProcessedResultRef.current = ''
          resultIndexRef.current = 0
          isProcessingRef.current = false
          phraseSetRef.current = new Set();
          startRecording();
        }, 1200);
      } else {
        // In manual mode, clear transcript for next input
        setTranscript('')
        setInterimTranscript('')
        transcriptRef.current = ''
        lastProcessedResultRef.current = ''
        resultIndexRef.current = 0
        isProcessingRef.current = false
        phraseSetRef.current = new Set();
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

  const handlePauseToggle = () => {
    if (isTemporarilyPaused) {
      // Resume
      console.log('Resuming from temporary pause...')
      console.log('Current transcript before resume:', transcriptRef.current)
      console.log('Current visible transcript:', transcript)
      console.log('Phrase set size:', phraseSetRef.current.size)
      setIsTemporarilyPaused(false)
      
      // Reset processing flags to allow new results
      isProcessingRef.current = false
      recognitionRestartingRef.current = false
      
      // CRITICAL: Reset result index since recognition will restart with new results
      resultIndexRef.current = 0
      lastProcessedResultRef.current = ''
      
      // DON'T reset phraseSetRef - we want to keep previous phrases
      // DON'T reset transcriptRef - we want to keep the existing transcript
      // Clear interim transcript to start fresh
      setInterimTranscript('')
      
      // Reset speech detection flag for new session
      hasSpeechStartedRef.current = false
      // Reset result indices and clear interim ref when resuming
      resultIndexRef.current = 0
      lastProcessedResultRef.current = ''
      currentInterimTextRef.current = ''
      
      // Mark as listening again
      setIsListening(true)
      setRecognitionActive(true)
      
      if (recognitionRef.current && isRecordingRef.current) {
        try {
          console.log('Starting recognition after pause...')
          recognitionRef.current.start()
          toast({
            title: 'Resumed',
            description: 'Continue speaking...',
          })
        } catch (e) {
          console.error('Could not resume recognition:', e)
          // If start fails, try again after a short delay
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current && !isTemporarilyPausedRef.current) {
              try {
                recognitionRef.current.start()
                console.log('Recognition restarted after retry')
              } catch (err) {
                console.error('Second attempt to start recognition failed:', err)
              }
            }
          }, 200)
        }
      }
    } else {
      // Pause - SAVE any interim text first!
      console.log('Pausing recording...')
      console.log('Current transcript before pause:', transcriptRef.current)
      console.log('Current visible transcript:', transcript)
      console.log('Current interim text:', currentInterimTextRef.current)
      
      // Save any interim text that hasn't been finalized yet
      if (currentInterimTextRef.current.trim()) {
        const interimText = currentInterimTextRef.current.trim()
        console.log('Saving interim text before pause:', interimText)
        
        // Add to transcript
        const newTranscript = transcriptRef.current ? transcriptRef.current + ' ' + interimText : interimText
        transcriptRef.current = newTranscript
        setTranscript(newTranscript)
        
        // Add to phrase set to avoid duplicates later
        phraseSetRef.current.add(interimText.toLowerCase())
        
        console.log('Updated transcript after saving interim:', transcriptRef.current)
      }
      
      setIsTemporarilyPaused(true)
      
      // Update listening states
      setIsListening(false)
      setRecognitionActive(false)
      
      // Clear interim transcript and ref after saving
      currentInterimTextRef.current = ''
      setInterimTranscript('')
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          // Clear silence timer when pausing
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
          }
          toast({
            title: 'Paused',
            description: `Captured: "${transcriptRef.current || 'nothing yet'}"`,
          })
        } catch (e) {
          console.log('Could not pause recognition:', e)
        }
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Manual/Continuous Mode Toggle */}
      <div className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md">
        <span className={`text-xs sm:text-sm font-semibold transition-all duration-200 ${!autoMode 
          ? 'text-gray-900 dark:text-white' 
          : 'text-gray-400 dark:text-gray-500'
          }`}>
          Manual
        </span>

        <Button
          type="button"
          onClick={() => setAutoMode((prev) => !prev)}
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

      {/* Resume Button (only show when paused in auto mode) */}
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

      {/* Pause/Play Button - Show when recording and not in answer review mode */}
      {isRecording && !isPaused && (
        <div className="flex justify-center">
          <Button
            onClick={handlePauseToggle}
            variant="outline"
            size="default"
            className={`gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
              isTemporarilyPaused
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                : 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/40'
            }`}
          >
            {isTemporarilyPaused ? (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Resume Recording</span>
                <span className="xs:hidden">Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Pause Recording</span>
                <span className="xs:hidden">Pause</span>
              </>
            )}
          </Button>
        </div>
      )}

      <Card className={`transition-all duration-300 ${isRecording ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/30 dark:bg-blue-950/10' : 'hover:shadow-md'} group border-gray-200 dark:border-gray-700`}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {/* Animated ring for recording */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
              )}
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isRecording
                ? 'bg-red-500/20 blur-lg'
                : 'bg-blue-500/0 group-hover:bg-blue-500/20 blur-lg'
                }`}></div>
              <Button
                type="button"
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                onPointerDown={(e) => {
                  if (buttonLocked || recognitionActive) return;
                  const now = Date.now();
                  const debounceMs = isMobile.current ? 1800 : 600;
                  if (now - lastButtonPressRef.current < debounceMs) return;
                  lastButtonPressRef.current = now;
                  setButtonLocked(true);
                  setRecognitionActive(true);
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
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full transition-all duration-200 select-none ${isRecording
                  ? 'recording-pulse scale-105 shadow-xl'
                  : 'hover:scale-105 hover:shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } ${!isRecording ? 'group-hover:animate-pulse' : ''}`}
                disabled={buttonLocked || recognitionActive || (autoMode && isRecording) || isPaused}
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
                  : isTemporarilyPaused
                    ? '⏸️ Paused - Click Play to resume'
                    : autoMode
                      ? (isRecording ? 'Listening... (Auto mode)' : 'Processing...')
                      : (isRecording ? 'Recording... (Stops after 1.5s silence)' : 'Click to start recording')
                }
              </p>
              {isListening && !isPaused && !isTemporarilyPaused && (
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Listening...</span>
                </div>
              )}
            </div>
            {(transcript || interimTranscript) && (
              <div className="w-full p-3 bg-muted rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Transcript:</p>
                <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed">
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
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-sm py-2"
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Stop Button (manual override for mobile reliability) */}
      {isRecording && (
        <div className="flex justify-center">
          <Button
            onClick={() => stopRecording()}
            variant="outline"
            size="sm"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-sm transition-all duration-200 px-6"
          >
            Stop Recording
          </Button>
        </div>
      )}
    </div>
  );
});
