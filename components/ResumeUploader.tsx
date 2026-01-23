'use client'

import { useState } from 'react'
import { Upload, File, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface ResumeUploaderProps {
  onContentExtracted: (content: string, fileName: string) => void
  onJobRoleChange: (role: string) => void
  onCustomInstructionsChange: (instructions: string) => void
  initialJobRole?: string
  initialInstructions?: string
}

export function ResumeUploader({ 
  onContentExtracted, 
  onJobRoleChange, 
  onCustomInstructionsChange,
  initialJobRole = '',
  initialInstructions = ''
}: ResumeUploaderProps) {
  const [fileName, setFileName] = useState<string>('')
  const [isUploaded, setIsUploaded] = useState(false)
  const [content, setContent] = useState<string>('')
  const [jobRole, setJobRole] = useState<string>(initialJobRole)
  const [customInstructions, setCustomInstructions] = useState<string>(initialInstructions)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const validExtensions = ['.txt', '.pdf', '.doc', '.docx']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a TXT, PDF, or DOCX file.',
        variant: 'destructive',
      })
      return
    }

    // For now, only handle text files directly
    // PDF and DOCX would need server-side processing
    if (file.type === 'text/plain' || fileExtension === '.txt') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        setFileName(file.name)
        setIsUploaded(true)
        onContentExtracted(text, file.name)
        toast({
          title: 'File Uploaded Successfully',
          description: `${file.name} is ready to use in your answers.`,
        })
      }
      reader.readAsText(file)
    } else {
      // For PDF/DOCX, we'll need to send to server
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to extract text')
        }

        const data = await response.json()
        setContent(data.text)
        setFileName(file.name)
        setIsUploaded(true)
        onContentExtracted(data.text, file.name)
        toast({
          title: 'File Uploaded Successfully',
          description: `${file.name} is ready to use in your answers.`,
        })
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Could not process the file. Please try a TXT file instead.',
          variant: 'destructive',
        })
      }
    }
  }

  const handlePasteContent = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = event.clipboardData.getData('text')
    if (text) {
      setContent(text)
      setFileName('Pasted Content')
      setIsUploaded(true)
      onContentExtracted(text, 'Pasted Content')
      toast({
        title: 'Content Added',
        description: 'Your content is ready to use in answers.',
      })
    }
  }

  const handleRemove = () => {
    setFileName('')
    setIsUploaded(false)
    setContent('')
    onContentExtracted('', '')
    toast({
      title: 'Content Removed',
      description: 'Resume/document has been cleared.',
    })
  }

  return (
    <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Resume/Context</h3>
            {isUploaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {/* Job Role Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Role / Position (Optional)
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value)
                onJobRoleChange(e.target.value)
              }}
              placeholder="e.g., Full Stack Developer, Data Scientist"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI will tailor answers for this role
            </p>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => {
                setCustomInstructions(e.target.value)
                onCustomInstructionsChange(e.target.value)
              }}
              placeholder="e.g., Focus on React/Node.js, Keep answers under 2 minutes, Emphasize teamwork..."
              className="w-full h-20 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How should AI respond? These instructions persist.
            </p>
          </div>

          {!isUploaded ? (
            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Upload Resume/Document</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">TXT, PDF, or DOCX (Max 5MB)</p>
                </label>
              </div>

              {/* Or Paste Text */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400">OR</p>
                <textarea
                  placeholder="Paste your resume/introduction text here... (Click outside when done)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={(e) => {
                    const text = e.target.value.trim()
                    console.log('=== RESUME UPLOADER onBlur ===')
                    console.log('Text length:', text.length)
                    console.log('Text preview:', text.substring(0, 100))
                    
                    if (text && text.length > 10) {
                      setFileName('Manual Entry')
                      setIsUploaded(true)
                      console.log('Calling onContentExtracted with:', text.length, 'characters')
                      onContentExtracted(text, 'Manual Entry')
                      toast({
                        title: 'Content Saved',
                        description: 'Your content is ready to use in answers.',
                      })
                    } else {
                      console.log('Text too short, not saving')
                    }
                  }}
                  className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Type or paste your content, then click outside to save
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <File className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 shrink-0" />
                    <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100 truncate">{fileName}</p>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {content.length} characters loaded
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ Now say "introduce yourself" or "tell me about yourself" to use this content!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
