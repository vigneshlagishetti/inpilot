import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeContent, jobRole, customInstructions, projectContext, stressMode } = await request.json()

    let systemPrompt = `You are an expert technical interviewer.
Generate a realistic interview question for a candidate.
Candidate's Target Role: ${jobRole || 'Software Engineer'}
Candidate's Resume Context:
${resumeContent || 'None provided.'}
${projectContext ? `\nProjects Context:\n${projectContext}` : ''}
${customInstructions ? `\nCustom Instructions:\n${customInstructions}` : ''}`

    if (stressMode) {
      systemPrompt += `\n\nSTRESS TEST MODE ACTIVE: You are an extremely rigorous, demanding, and uncompromising technical interviewer. Ask a highly complex, multi-layered question focusing on extreme edge cases, deep technical constraints, and scalability failures. Be direct, aggressive, and DO NOT be polite. Ask a brutal curveball.`
    }

    systemPrompt += `\n\nProvide exactly ONE clear interview question. Output ONLY the question text, no conversational filler or quotes.`

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a new interview question.` },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const question = response.choices[0]?.message?.content?.trim() || 'Tell me about a challenging project you worked on.'
    
    return NextResponse.json({ question })

  } catch (error: any) {
    console.error('Error in generate-question API:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate question' },
      { status: 500 }
    )
  }
}
