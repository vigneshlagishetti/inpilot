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

ANSWER LENGTH REQUIREMENTS:
- Direct Answer: 3-4 sentences minimum (introduce yourself naturally and warmly)
- Detailed Explanation: At least 4-6 paragraphs with rich details
  * Share your journey, experiences, and thought process
  * Include specific examples, numbers, and results where possible
  * Talk about challenges faced and how you overcame them
  * Mention technologies used, team collaboration, and learnings
  * Make it comprehensive but conversational
- Example: 2-3 detailed paragraphs with real scenarios
- Be thorough - interviewers want to hear your full story and understand your depth of knowledge

Format EXACTLY as:
---DIRECT_ANSWER---
[Natural, conversational opening in simple English - 3-4 sentences minimum. Introduce yourself warmly, mention your excitement about the role, and give a brief preview of what you'll share]

---DETAILED_EXPLANATION---
[This is the MAIN part - write 4-6 full paragraphs minimum. Explain like you're telling a complete story:
- Paragraph 1: Your background and how you got into this field
- Paragraph 2: Specific experiences and projects (mention technologies, timelines, team size)
- Paragraph 3: Challenges you faced and solutions you implemented
- Paragraph 4: Results, achievements, and what you learned
- Paragraph 5-6: How this relates to the current role and your future goals
Use everyday language, share specific details, numbers, metrics. Make it comprehensive and engaging!]

---EXAMPLE---
[2-3 detailed paragraphs with a real, specific example from your experience. Include:
- The situation/context (what project, when, with whom)
- What you did specifically (technologies, approach, your role)
- The outcome (results, metrics, impact, learnings)
Start naturally like "For example..." or "Like when I..."]

---BRUTE_FORCE---
[For coding: Explain in simple terms - "So the first way I'd do it is..." with code, otherwise "N/A"]

---OPTIMAL_APPROACH---
[For coding: Keep it simple - "Then the better way is..." with code, otherwise "N/A"]

---TIME_COMPLEXITY---
[For coding: Simple explanation - "It runs in... because..." otherwise "N/A"]

---SPACE_COMPLEXITY---
[For coding: Simple explanation - "Memory-wise, it uses..." otherwise "N/A"]`

  try {
    console.log('Generating answer for question:', question)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Groq's latest model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_tokens: 3000, // Increased from 1500 to allow longer, more detailed answers
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
