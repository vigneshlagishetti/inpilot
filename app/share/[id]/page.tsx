import { supabase } from '@/lib/supabase'
import { AnswerDisplay } from '@/components/AnswerDisplay'
import { notFound } from 'next/navigation'
import { Target } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default async function SharedInterviewPage({ params }: PageProps) {
  // Await params as required by Next.js 15+ (if applicable, harmless otherwise)
  const resolvedParams = await params
  
  // Fetch the specific message by ID
  const { data: message, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !message || message.type !== 'assistant' || !message.metadata) {
    notFound()
  }

  const metadata = message.metadata as any
  const answer = metadata as any
  const questionText = metadata._question || "Shared Question"
  const fluencyData = metadata._fluency

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 font-sans">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-indigo-100 dark:border-indigo-900/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Inpilot
            </span>
          </Link>
          <div className="text-sm font-medium text-gray-500">
            Shared Mock Interview Result
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Review Answer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            A candidate has shared their mock interview response with you for review.
          </p>
        </div>
        
        <AnswerDisplay 
          question={questionText} 
          {...answer} 
          fluencyData={fluencyData}
        />
      </main>
    </div>
  )
}
