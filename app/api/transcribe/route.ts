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

    const question = formData.get('question') as string || ''
    const jobRole = formData.get('jobRole') as string || ''
    const resumeContent = formData.get('resumeContent') as string || ''
    const projectContext = formData.get('projectContext') as string || ''

    const baseURL = process.env.OPENAI_BASE_URL || ''
    const isGroq = baseURL.toLowerCase().includes('groq')
    const model = isGroq ? 'whisper-large-v3-turbo' : 'whisper-1'

    const transcription = await openai.audio.transcriptions.create({
      file,
      model,
      prompt: 'This is a software engineering interview. The candidate may use technical programming jargon such as tuple, array, string, boolean, integer, loop, recursion, palindrome, React, Node.js, JavaScript, Python, TypeScript, System Design, Data Structures, Algorithms, Binary Search Trees, HashMap, Big O notation, API, JSON, RAG, Retrieval-Augmented Generation, LLM, Agentic RAG. The transcript MUST include all hesitation words exactly as spoken.',
    })

    const rawText = transcription.text

    // Fast LLM correction step to fix grammar and speech-to-text phonetic errors
    const completion = await openai.chat.completions.create({
      model: isGroq ? 'groq/compound-mini' : 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `You are an advanced speech-to-text grammar corrector for a software engineering interview. The user is interviewing for the role of "${jobRole}". 
          ${question ? `The interviewer just asked this question: "${question}". The user is speaking their answer.` : `The user is speaking an interview question or technical concept.`}
          
          Context about the user's background (use this to infer obscure technical jargon they might mention):
          ${resumeContent ? `RESUME CONTEXT:\n${resumeContent.substring(0, 1000)}\n` : ''}
          ${projectContext ? `PROJECT CONTEXT:\n${projectContext.substring(0, 1000)}\n` : ''}
          
          The user spoke into a microphone and the raw STT text may contain phonetic mistakes (e.g. "kassan" instead of "cosine", "tpl" instead of "tuple", "rivers" instead of "reverse", "agentic drag" instead of "agentic RAG"). 
          
          Use the context of the job role, resume, projects, and specific question to correctly infer and fix any domain-specific terms, jargon, or acronyms that the raw STT failed to capture. Fix the text so it makes perfect grammatical and technical sense. 
          Output ONLY the corrected text and absolutely nothing else. Do not add quotes.` 
        },
        { role: 'user', content: rawText }
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const correctedText = completion.choices[0]?.message?.content?.trim() || rawText

    return NextResponse.json({ text: correctedText, rawText: rawText })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
