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

    const { question, userAnswer, resumeContent, jobRole } = await request.json()

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'Missing question or user answer' }, { status: 400 })
    }

    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer to a question.
Provide constructive feedback on their answer.

Candidate's Target Role: ${jobRole || 'Software Engineer'}
Candidate's Resume Context:
${resumeContent || 'None provided.'}

Evaluate the answer on the following criteria:
1. Accuracy: Is the answer technically correct?
2. Completeness: Did they address all parts of the question?
3. Delivery: Is it clear and concise?

Output a JSON object with the following structure:
{
  "score": <number 0-100>,
  "feedback": "<string: overall feedback paragraph>",
  "strengths": ["<string>", ...],
  "improvements": ["<string>", ...]
}
Do NOT wrap the JSON in markdown blocks. Output only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Question: ${question}\nCandidate Answer: ${userAnswer}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const resultString = response.choices[0]?.message?.content || '{}'
    return NextResponse.json(JSON.parse(resultString))

  } catch (error: any) {
    console.error('Error in evaluate-answer API:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate answer' },
      { status: 500 }
    )
  }
}

export const maxDuration = 60
