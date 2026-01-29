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
  customInstructions?: string,
  projectContext?: string
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
      const nameMatch = resumeContent.match(/(?:name is|I'm|I am)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i)
      extractedName = nameMatch ? nameMatch[1] : ''
    }

    console.log('Extracted name:', extractedName)
    console.log('Resume content preview:', resumeContent.substring(0, 200))
    console.log('Project context provided:', !!projectContext)

    // ALWAYS act as the candidate when resume is uploaded
    systemPrompt = `YOU ARE THE CANDIDATE. Answer as yourself in first person.

NAME: ${extractedName || '[Extract from resume]'}
${jobRole ? `ROLE: ${jobRole}` : ''}

RESUME:
${resumeContent}

${projectContext ? `PROJECTS:\n${projectContext}\n` : ''}
${customInstructions ? `INSTRUCTIONS: ${customInstructions}\n` : ''}

RULES:
- Answer AS YOURSELF (the candidate)
- Use first person: "I am...", "I worked..."
- Be conversational and confident
- Keep answers clear and natural

QUESTION: "${question}"`
  } else {
    systemPrompt = `You are an interview coach. Use first person, be conversational and clear.`
  }

  systemPrompt += `

FORMAT (use exact markers):

---DIRECT_ANSWER---
[3-4 lines direct answer]

---DETAILED_EXPLANATION---
[2-3 paragraphs detailed explanation]

---EXAMPLE---
[1 paragraph example, or "N/A"]

---BRUTE_FORCE_APPROACH---
[ONLY for code questions: brute force explanation, else "N/A"]

---BRUTE_FORCE_CODE---
[ONLY for code questions: Python code, else "N/A"]

---BRUTE_FORCE_TIME---
[ONLY for code questions: "O(n), because..." else "N/A"]

---BRUTE_FORCE_SPACE---
[ONLY for code questions: "O(n), because..." else "N/A"]

---BRUTE_FORCE_WHY---
[ONLY for code questions: why it works, else "N/A"]

---OPTIMAL_APPROACH---
[ONLY for code questions: optimal approach, else "N/A"]

---OPTIMAL_CODE---
[ONLY for code questions: optimal Python code, else "N/A"]

---OPTIMAL_TIME---
[ONLY for code questions: "O(n), because..." else "N/A"]

---OPTIMAL_SPACE---
[ONLY for code questions: "O(n), because..." else "N/A"]

---OPTIMAL_WHY---
[ONLY for code questions: why better, else "N/A"]`

  try {
    console.log('Generating answer for question:', question)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      top_p: 0.9,
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
