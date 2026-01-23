import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export interface AnswerResponse {
  directAnswer: string
  detailedExplanation: string
  example?: string
  bruteForceApproach?: string
  optimalApproach?: string
  timeComplexity?: string
  spaceComplexity?: string
}

export async function generateAnswer(
  question: string, 
  resumeContent?: string,
  jobRole?: string,
  customInstructions?: string
): Promise<AnswerResponse> {
  console.log('=== GENERATE ANSWER DEBUG ===')
  console.log('Question:', question)
  console.log('Resume provided:', !!resumeContent)
  console.log('Resume length:', resumeContent?.length || 0)
  console.log('Job role:', jobRole || 'Not specified')
  console.log('Custom instructions:', customInstructions || 'None')
  
  let systemPrompt = ''
  let extractedName = ''

  // Extract name from resume if provided
  if (resumeContent) {
    const lines = resumeContent.split('\n')
    
    // Look for all-caps name (LAGISHETTI VIGNESH format)
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (/^[A-Z][A-Z\s]+[A-Z]$/.test(trimmedLine) && trimmedLine.length > 5 && trimmedLine.length < 50) {
        extractedName = trimmedLine
        break
      }
    }
    
    // If not found, try other patterns
    if (!extractedName) {
      const nameMatch = resumeContent.match(/(?:name|Name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
      extractedName = nameMatch ? nameMatch[1].trim() : ''
    }

    console.log('Extracted name:', extractedName)
    console.log('Resume content preview:', resumeContent.substring(0, 200))

    // ALWAYS act as the candidate when resume is uploaded
    systemPrompt = `YOU ARE THE CANDIDATE IN AN INTERVIEW. You are answering questions about yourself.

YOUR NAME: ${extractedName || '[Extract from resume below]'}

${jobRole ? `POSITION YOU'RE APPLYING FOR: ${jobRole}` : ''}

YOUR COMPLETE BACKGROUND:
${resumeContent}

${customInstructions ? `SPECIAL INSTRUCTIONS:\n${customInstructions}\n` : ''}

CRITICAL INSTRUCTIONS:
- Answer AS YOURSELF (the candidate), not as a coach
- Use ONLY information from YOUR resume above${jobRole ? `\n- Tailor your answers to the ${jobRole} position` : ''}
- Speak in first person: "I am...", "My name is...", "I worked at..."
- For "what is your name" or "introduce yourself": Start with "My name is ${extractedName}" or "I'm ${extractedName}"
- For technical questions: Use your skills/projects from the resume and relate them to ${jobRole || 'the role'}
- Be confident and conversational as if speaking to an interviewer${jobRole ? ` for a ${jobRole} position` : ''}

SPEAKING STYLE - VERY IMPORTANT:
- Talk like a NORMAL person, not overly professional
- Use simple, everyday English that anyone can understand
- Be conversational and friendly, like explaining to a friend
- Use phrases like: "So basically...", "What I did was...", "The cool thing about this is...", "I really enjoyed..."
- Avoid corporate jargon and fancy vocabulary
- Keep it real and relatable - sound like someone with experience who knows their stuff, but not someone reading from a textbook
- Be natural, use contractions (I'm, it's, that's), and speak like you're having a normal conversation

Answer this interview question: "${question}"`
  } else {
    systemPrompt = `You are an interview coach providing sample answers.

Guidelines:
- Use first person ("I would...", "In my experience...")
- Natural, flowing conversation
- Clear and interview-appropriate`
  }

  systemPrompt += `

ANSWER LENGTH - KEEP IT CONCISE:
- Direct Answer: 2-3 sentences (quick, natural intro)
- Detailed Explanation: 2-3 paragraphs with key details
- Example: 1 paragraph with a specific scenario
- Keep it comprehensive but brief - quality over quantity

Format EXACTLY as:
---DIRECT_ANSWER---
[Quick, conversational opening - 2-3 sentences]

---DETAILED_EXPLANATION---
[2-3 focused paragraphs covering your experience, skills, and how they relate to the question]

---EXAMPLE---
[1 paragraph with a specific example - situation, action, result]

---BRUTE_FORCE---
[For coding: Simple approach with code, otherwise "N/A"]

---OPTIMAL_APPROACH---
[For coding: Better approach with code, otherwise "N/A"]

---TIME_COMPLEXITY---
[For coding: Quick explanation, otherwise "N/A"]

---SPACE_COMPLEXITY---
[For coding: Quick explanation, otherwise "N/A"]`

  try {
    console.log('Generating answer for question:', question)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Using latest supported model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.3, // Lower for faster, more direct responses
      max_tokens: 1200, // Significantly reduced for speed
    })

    console.log('Answer generated successfully')
    const response = completion.choices[0]?.message?.content || ''
    return parseResponse(response)
  } catch (error: any) {
    console.error('Error generating answer:', error)
    console.error('Error details:', error?.response?.data || error?.message)
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Failed to generate answer')
  }
}

function parseResponse(response: string): AnswerResponse {
  const sections = {
    directAnswer: extractSection(response, 'DIRECT_ANSWER'),
    detailedExplanation: extractSection(response, 'DETAILED_EXPLANATION'),
    example: extractSection(response, 'EXAMPLE'),
    bruteForceApproach: extractSection(response, 'BRUTE_FORCE'),
    optimalApproach: extractSection(response, 'OPTIMAL_APPROACH'),
    timeComplexity: extractSection(response, 'TIME_COMPLEXITY'),
    spaceComplexity: extractSection(response, 'SPACE_COMPLEXITY'),
  }

  return {
    directAnswer: sections.directAnswer || 'Unable to generate direct answer',
    detailedExplanation: sections.detailedExplanation || 'Unable to generate detailed explanation',
    example: sections.example !== 'N/A' ? sections.example : undefined,
    bruteForceApproach: sections.bruteForceApproach !== 'N/A' ? sections.bruteForceApproach : undefined,
    optimalApproach: sections.optimalApproach !== 'N/A' ? sections.optimalApproach : undefined,
    timeComplexity: sections.timeComplexity !== 'N/A' ? sections.timeComplexity : undefined,
    spaceComplexity: sections.spaceComplexity !== 'N/A' ? sections.spaceComplexity : undefined,
  }
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`---${sectionName}---\\s*([\\s\\S]*?)(?=---[A-Z_]+---|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}
