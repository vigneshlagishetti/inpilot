import { NextRequest, NextResponse } from 'next/server'
import { generateAnswer } from '@/lib/ai-service'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, resumeContent, jobRole, customInstructions } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 })
    }

    console.log('Received question:', question)
    console.log('Has resume content:', !!resumeContent)
    console.log('Job role:', jobRole || 'Not specified')
    console.log('Custom instructions:', customInstructions || 'None')

    const answer = await generateAnswer(question, resumeContent, jobRole, customInstructions)

    return NextResponse.json(answer)
  } catch (error: any) {
    console.error('Error in generate-answer API:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate answer' },
      { status: 500 }
    )
  }
}

// Increase timeout for AI generation (60 seconds)
export const maxDuration = 60
