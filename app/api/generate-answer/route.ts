import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/ai-service'
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

    const { question, resumeContent, jobRole, customInstructions, projectContext } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(question, resumeContent, jobRole, customInstructions, projectContext)

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
      max_tokens: 1800,
      top_p: 0.9,
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(new TextEncoder().encode(content))
            }
          }
        } catch (error) {
          console.error('Error during streaming:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
      },
    })
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
