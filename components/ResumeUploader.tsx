'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, File, X, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

// Update props interface
export interface Project {
  id: string
  name: string
  content: string
}

interface ResumeUploaderProps {
  onContentExtracted: (content: string, fileName: string) => void
  onJobRoleChange: (role: string) => void
  onCustomInstructionsChange: (instructions: string) => void
  // New props for project management
  projects?: Project[]
  onAddProject?: (name: string, content: string) => Promise<void>
  onUpdateProject?: (id: string, name: string, content: string) => Promise<void>
  onDeleteProject?: (id: string) => Promise<void>
  initialJobRole?: string
  initialInstructions?: string
}

export function ResumeUploader({
  onContentExtracted,
  onJobRoleChange,
  onCustomInstructionsChange,
  projects = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  initialJobRole = '',
  initialInstructions = ''
}: ResumeUploaderProps) {
  const [fileName, setFileName] = useState<string>('')
  const [isUploaded, setIsUploaded] = useState(false)
  const [content, setContent] = useState<string>('')
  const [jobRole, setJobRole] = useState<string>(initialJobRole)
  const [customInstructions, setCustomInstructions] = useState<string>(initialInstructions)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectContent, setNewProjectContent] = useState('')
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file')
  const [pastedText, setPastedText] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { toast } = useToast()

  // Ref for click outside detection
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsAddingProject(false)
      }
    }

    if (isAddingProject) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddingProject])

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
      setIsUploading(true)
      toast({
        title: 'Processing File',
        description: 'Extracting text from your resume... This may take a moment.',
      })

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
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmitPastedText = () => {
    if (!pastedText.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste or type your resume content.',
        variant: 'destructive',
      })
      return
    }

    setContent(pastedText)
    setFileName('Pasted Resume')
    setIsUploaded(true)
    onContentExtracted(pastedText, 'Pasted Resume')
    toast({
      title: 'Resume Added',
      description: 'Your resume content is ready to use in answers.',
    })
  }

  const handleRemove = () => {
    // Clear resume
    setFileName('')
    setIsUploaded(false)
    setContent('')
    setPastedText('')
    onContentExtracted('', '')

    // Clear job role, custom instructions
    setJobRole('')
    setCustomInstructions('')
    onJobRoleChange('')
    onCustomInstructionsChange('')
    // Note: We don't clear projects here as they are persistent in DB

    toast({
      title: 'Settings Cleared',
      description: 'Resume, job role, and instructions have been cleared.',
    })
  }

  const handleAddProject = async () => {
    if (!newProjectName.trim() || !newProjectContent.trim()) {
      toast({ title: 'Missing Info', description: 'Please provide both name and content.', variant: 'destructive' })
      return
    }
    if (onAddProject) {
      await onAddProject(newProjectName, newProjectContent)
      setNewProjectName('')
      setNewProjectContent('')
      setIsAddingProject(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Resume & Profile</h3>
              {isUploaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Profile
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
                placeholder="e.g., Focus on React/Node.js, Keep answers under 2 minutes..."
                className="w-full h-20 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {!isUploaded ? (
              <div className="space-y-3">
                {/* Tab Buttons */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setUploadMethod('file')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${uploadMethod === 'file'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setUploadMethod('paste')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${uploadMethod === 'paste'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    Paste Text
                  </button>
                </div>

                {/* File Upload Tab */}
                {uploadMethod === 'file' && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`flex flex-col items-center space-y-2 ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Processing...</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Extracting text from PDF</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Upload Resume</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">TXT, PDF, DOC, or DOCX</p>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Paste Text Tab */}
                {uploadMethod === 'paste' && (
                  <div className="space-y-3">
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      className="w-full h-48 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <Button
                      onClick={handleSubmitPastedText}
                      className="w-full"
                    >
                      Submit Resume
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">{fileName}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Manager Section */}
      <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Context</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add READMEs or details for specific projects (Saved permanently)</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="w-full sm:w-auto border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              {isAddingProject ? 'Cancel' : '+ Add Project'}
            </Button>
          </div>

          {isAddingProject && (
            <div ref={formRef} className="mb-6 p-4 border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <textarea
                placeholder="Paste README or Project Details here..."
                value={newProjectContent}
                onChange={(e) => setNewProjectContent(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-md text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" onClick={handleAddProject} className="w-full sm:w-auto">Save Project</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {projects.length === 0 && !isAddingProject ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">No projects added yet.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{project.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.content.substring(0, 150)}...</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* Edit button could go here, for now just delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProject && onDeleteProject(project.id)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


