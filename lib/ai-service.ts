import OpenAI from 'openai'
import { AnswerResponse, parseResponse } from './ai-parsers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

// Rough token estimation: 1 token ≈ 4 characters
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Truncate text to fit within token budget
function truncateToTokens(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text)
  if (estimatedTokens <= maxTokens) return text
  
  const maxChars = maxTokens * 4
  return text.substring(0, maxChars) + '\n\n[Content truncated to fit token limits]'
}

export function buildSystemPrompt(
  question: string,
  resumeContent?: string,
  jobRole?: string,
  customInstructions?: string,
  projectContext?: string
): string {

  // Token budget management for llama-3.1-8b-instant (6000 total tokens)
  // Reserve: 1800 for output, ~1000 for system prompt structure, leaving ~3200 for content
  const MAX_TOTAL_INPUT_TOKENS = 3200
  const MAX_RESUME_TOKENS = 2000
  const MAX_PROJECT_TOKENS = 800

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

    
    // Smart truncation to stay within token limits
    let processedResume = truncateToTokens(resumeContent, MAX_RESUME_TOKENS)
    let processedProjects = projectContext ? truncateToTokens(projectContext, MAX_PROJECT_TOKENS) : ''
    
    // Calculate total estimated tokens
    const totalEstimatedTokens = estimateTokens(processedResume) + estimateTokens(processedProjects)
    
    // If still too large, reduce further
    if (totalEstimatedTokens > MAX_TOTAL_INPUT_TOKENS) {
      const reductionRatio = MAX_TOTAL_INPUT_TOKENS / totalEstimatedTokens
      processedResume = truncateToTokens(processedResume, Math.floor(MAX_RESUME_TOKENS * reductionRatio))
      processedProjects = processedProjects ? truncateToTokens(processedProjects, Math.floor(MAX_PROJECT_TOKENS * reductionRatio)) : ''
    }

    // ALWAYS act as the candidate when resume is uploaded
    systemPrompt = `YOU ARE THE CANDIDATE. Answer as yourself in first person.

NAME: ${extractedName || '[Extract from resume]'}
${jobRole ? `ROLE: ${jobRole}` : ''}

RESUME:
${processedResume}

${processedProjects ? `PROJECTS:\n${processedProjects}\n` : ''}
${customInstructions ? `INSTRUCTIONS: ${customInstructions}\n` : ''}

RULES:
- Answer AS YOURSELF (the candidate)
- Use first person: "I am...", "I worked..."
- Be conversational and confident
- Keep answers clear and natural
- IMPORTANT: Fix speech-to-text errors using context (e.g., "rivers" → "reverse", "sorting" → "sorting")

QUESTION: "${question}"`
  } else {
    systemPrompt = `You are an interview coach. Use first person, be conversational and clear.

IMPORTANT: The question may contain speech-to-text transcription errors. Use context to interpret correctly:
- "rivers of string" or "rivers of number" → "reverse of string" or "reverse of number"
- "palindrome" might be "paladin" or "palindrum"
- "binary" might be "buy nary" or "binary"
- "recursion" might be "re-curation"
- Other technical terms may be misheard - use programming context to understand the real question`
  }

  systemPrompt += `

FORMAT (use exact markers):

---DIRECT_ANSWER---
[5-6 lines of clear explanation answering the question directly. NO CODE here - just explain the concept/solution in plain language.]

---DETAILED_EXPLANATION---
[In-depth explanation in 3-4 paragraphs covering: 1) The problem/concept clearly, 2) How the solution works step-by-step, 3) Edge cases or important considerations, 4) Practical implications or real-world usage.]

---EXAMPLE---
[Real-world example or use case demonstrating the concept. Write "N/A" if not applicable.]

FOR CODING QUESTIONS ONLY (otherwise write "N/A" for all sections below):

---BRUTE_FORCE_APPROACH---
[Explain the brute force/naive approach: what is the simplest way to solve this? What's the logic?]

---BRUTE_FORCE_CODE---
[Complete working Python code for brute force solution with proper formatting]

---BRUTE_FORCE_TIME---
[Time complexity like "O(n²)" with clear explanation: "because we have nested loops..."]

---BRUTE_FORCE_SPACE---
[Space complexity like "O(1)" with explanation: "because we only use constant extra space..."]

---BRUTE_FORCE_WHY---
[Explain why this brute force approach works, its limitations, and when it might fail]

---OPTIMAL_APPROACH---
[Explain the optimized approach: what data structure/algorithm makes it better? What's the key insight?]

---OPTIMAL_CODE---
[Complete working Python code for optimal solution with proper formatting]

---OPTIMAL_TIME---
[Time complexity like "O(n)" with clear explanation: "because we iterate once..."]

---OPTIMAL_SPACE---
[Space complexity like "O(n)" with explanation: "because we use a hash map..."]

---OPTIMAL_WHY---
[Explain why the optimal approach is better: performance gains, trade-offs, when to use it]`

  return systemPrompt
}

export async function generateAnswer(
  question: string,
  resumeContent?: string,
  jobRole?: string,
  customInstructions?: string,
  projectContext?: string
): Promise<AnswerResponse> {
  const systemPrompt = buildSystemPrompt(question, resumeContent, jobRole, customInstructions, projectContext)

  try {
    const startTime = Date.now()
    
    const makeRequest = async (): Promise<string> => {
      const completion = await openai.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 1800,
        top_p: 0.9,
        stream: false,
      })
      return completion.choices[0]?.message?.content || ''
    }

    let response: string
    try {
      response = await makeRequest()
    } catch (err: any) {
      if (err?.status === 429) {
        const retryAfter = parseInt(err?.headers?.['retry-after'] || '30', 10)
        console.warn(`[AI] Rate limited. Retrying after ${retryAfter}s...`)
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        response = await makeRequest()
      } else {
        throw err
      }
    }

    return parseResponse(response)
  } catch (error: any) {
    console.error('Error generating answer:', error)
    throw new Error(error?.response?.data?.error?.message || error?.message || 'Failed to generate answer')
  }
}
