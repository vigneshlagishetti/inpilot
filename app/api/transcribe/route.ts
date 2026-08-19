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
      prompt: 'This is a software engineering interview. The candidate may use technical programming jargon such as tuple, array, string, boolean, integer, loop, recursion, palindrome, React, Node.js, JavaScript, Python, TypeScript, System Design, Data Structures, Algorithms, Binary Search Trees, HashMap, Big O notation, API, JSON. The transcript MUST include all hesitation words exactly as spoken.',
    })

    const rawText = transcription.text

    // Fast LLM correction step to fix grammar and speech-to-text phonetic errors
    const completion = await openai.chat.completions.create({
      model: isGroq ? 'qwen/qwen3.6-27b' : 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are an advanced speech-to-text grammar corrector for a software engineering interview. The user spoke into a microphone and the raw text may contain phonetic mistakes (e.g. "tpl" instead of "tuple", "rivers" instead of "reverse", "buy nary" instead of "binary"). Fix the text so it makes perfect grammatical and technical sense in the context of programming. Output ONLY the corrected text and absolutely nothing else. Do not add quotes.' 
        },
        { role: 'user', content: rawText }
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    let correctedText = completion.choices[0]?.message?.content?.trim() || rawText
    
    // Strip <think> reasoning blocks from Qwen outputs
    if (correctedText.includes('</think>')) {
      correctedText = correctedText.split('</think>')[1]?.trim() || correctedText
    }

    return NextResponse.json({ text: correctedText, rawText: rawText })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
