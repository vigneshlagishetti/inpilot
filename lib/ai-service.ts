import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export interface AnswerResponse {
  directAnswer: string
  detailedExplanation: string
  example?: string
  // Brute Force sections
  bruteForceApproach?: string
  bruteForceCode?: string
  bruteForceTime?: string
  bruteForceSpace?: string
  bruteForceWhy?: string
  // Optimal sections
  optimalApproach?: string
  optimalCode?: string
  optimalTime?: string
  optimalSpace?: string
  optimalWhy?: string
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

SPEAKING STYLE:
- Talk naturally, like a normal person in an interview
- Use simple, clear English
- Be conversational and confident
- Avoid jargon - speak like you're explaining to a colleague

Answer this interview question: "${question}"`
  } else {
    systemPrompt = `You are an interview coach providing sample answers.

Guidelines:
- Use first person ("I would...", "In my experience...")
- Natural, flowing conversation
- Clear and interview-appropriate`
  }

  systemPrompt += `

CRITICAL: ALWAYS provide a direct answer first! Never skip this section.

ANSWER FORMAT (use these exact section markers):

---DIRECT_ANSWER---
[REQUIRED: 3-4 lines giving a comprehensive, direct, conversational opening. This MUST be filled for ANY question type. Start answering immediately.]

---DETAILED_EXPLANATION---
[2-3 paragraphs explaining your understanding and approach in detail]

---EXAMPLE---
[1 paragraph with a concrete example, or write "N/A" if not applicable]

---BRUTE_FORCE_APPROACH---
[For coding problems, provide step-by-step approach explanation. Otherwise write "N/A"]

---BRUTE_FORCE_CODE---
[For coding problems, provide fully commented Python code. Otherwise write "N/A"]

---BRUTE_FORCE_TIME---
[For coding problems, explain time complexity in detail. Otherwise write "N/A"]

---BRUTE_FORCE_SPACE---
[For coding problems, explain space complexity in detail. Otherwise write "N/A"]

---BRUTE_FORCE_WHY---
[For coding problems, explain why this approach works. Otherwise write "N/A"]

---OPTIMAL_APPROACH---
[For coding problems, provide step-by-step optimal approach with key insights. Otherwise write "N/A"]

---OPTIMAL_CODE---
[For coding problems, provide fully commented optimal Python code. Otherwise write "N/A"]

---OPTIMAL_TIME---
[For coding problems, explain optimal time complexity. Otherwise write "N/A"]

---OPTIMAL_SPACE---
[For coding problems, explain optimal space complexity. Otherwise write "N/A"]

---OPTIMAL_WHY---
[For coding problems, explain why this is better than brute force. Otherwise write "N/A"]`

  try {
    console.log('Generating answer for question:', question)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fastest model for instant responses
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.2, // Lower for faster, focused responses
      max_tokens: 2000, // Increased for detailed coding responses
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
    bruteForceApproach: extractSection(response, 'BRUTE_FORCE_APPROACH'),
    bruteForceCode: extractSection(response, 'BRUTE_FORCE_CODE'),
    bruteForceTime: extractSection(response, 'BRUTE_FORCE_TIME'),
    bruteForceSpace: extractSection(response, 'BRUTE_FORCE_SPACE'),
    bruteForceWhy: extractSection(response, 'BRUTE_FORCE_WHY'),
    optimalApproach: extractSection(response, 'OPTIMAL_APPROACH'),
    optimalCode: extractSection(response, 'OPTIMAL_CODE'),
    optimalTime: extractSection(response, 'OPTIMAL_TIME'),
    optimalSpace: extractSection(response, 'OPTIMAL_SPACE'),
    optimalWhy: extractSection(response, 'OPTIMAL_WHY'),
  }

  return {
    directAnswer: sections.directAnswer || 'Please ask your question again',
    detailedExplanation: sections.detailedExplanation || 'No detailed explanation available',
    example: sections.example !== 'N/A' && sections.example ? sections.example : undefined,
    bruteForceApproach: sections.bruteForceApproach !== 'N/A' && sections.bruteForceApproach ? sections.bruteForceApproach : undefined,
    bruteForceCode: sections.bruteForceCode !== 'N/A' && sections.bruteForceCode ? sections.bruteForceCode : undefined,
    bruteForceTime: sections.bruteForceTime !== 'N/A' && sections.bruteForceTime ? sections.bruteForceTime : undefined,
    bruteForceSpace: sections.bruteForceSpace !== 'N/A' && sections.bruteForceSpace ? sections.bruteForceSpace : undefined,
    bruteForceWhy: sections.bruteForceWhy !== 'N/A' && sections.bruteForceWhy ? sections.bruteForceWhy : undefined,
    optimalApproach: sections.optimalApproach !== 'N/A' && sections.optimalApproach ? sections.optimalApproach : undefined,
    optimalCode: sections.optimalCode !== 'N/A' && sections.optimalCode ? sections.optimalCode : undefined,
    optimalTime: sections.optimalTime !== 'N/A' && sections.optimalTime ? sections.optimalTime : undefined,
    optimalSpace: sections.optimalSpace !== 'N/A' && sections.optimalSpace ? sections.optimalSpace : undefined,
    optimalWhy: sections.optimalWhy !== 'N/A' && sections.optimalWhy ? sections.optimalWhy : undefined,
  }
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`---${sectionName}---\\s*([\\s\\S]*?)(?=---[A-Z_]+---|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}
