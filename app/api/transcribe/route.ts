import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const baseURL = process.env.OPENAI_BASE_URL || ''
    const isGroq = baseURL.toLowerCase().includes('groq')
    const model = isGroq ? 'whisper-large-v3-turbo' : 'whisper-1'

    const transcription = await openai.audio.transcriptions.create({
      file,
      model,
      prompt: 'This is a software engineering interview. The candidate may use technical programming jargon such as React, Node.js, JavaScript, Python, TypeScript, System Design, Data Structures, Algorithms, Binary Search Trees, HashMap, Big O notation, Kubernetes, Docker, scalability, and latency. The transcript MUST include all hesitation words exactly as spoken, such as um, uh, ah, like, you know, basically, literally.',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
