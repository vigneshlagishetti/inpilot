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
  // Follow ups
  followUps?: string[]
}

export function parseResponse(response: string): AnswerResponse {

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
    followUps: extractSection(response, 'FOLLOW_UPS'),
  }


  // Fallback: if the model didn't use markers at all, use the raw response as the direct answer
  // Split it roughly in half between direct answer and detailed explanation
  let directAnswer = sections.directAnswer
  let detailedExplanation = sections.detailedExplanation

  if (!directAnswer && response.trim().length > 0) {
    const paragraphs = response.trim().split(/\n\n+/)
    if (paragraphs.length >= 2) {
      // First ~40% of paragraphs = direct answer, rest = detailed explanation
      const splitAt = Math.max(1, Math.ceil(paragraphs.length * 0.4))
      directAnswer = paragraphs.slice(0, splitAt).join('\n\n')
      detailedExplanation = paragraphs.slice(splitAt).join('\n\n') || directAnswer
    } else {
      directAnswer = response.trim()
      detailedExplanation = response.trim()
    }
  }

  return {
    directAnswer: directAnswer || 'Please ask your question again',
    detailedExplanation: detailedExplanation || directAnswer || 'No detailed explanation available',
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
    followUps: sections.followUps ? sections.followUps.split('\n').map(s => s.replace(/^[-*0-9.]+\s*/, '').trim()).filter(Boolean) : undefined,
  }
}

function extractSection(text: string, sectionName: string): string {
  // Try exact marker format: ---SECTION_NAME---
  const regex = new RegExp(`---${sectionName}---\\s*([\\s\\S]*?)(?=---[A-Z_]+---|$)`, 'i')
  const match = text.match(regex)
  if (match) return match[1].trim()

  // Try alternate formats the model sometimes generates: **SECTION NAME** or ## SECTION NAME
  const altName = sectionName.replace(/_/g, '[_ ]')
  const altRegex = new RegExp(`(?:\\*\\*|##\\s*)${altName}(?:\\*\\*)?\\s*:?\\s*([\\s\\S]*?)(?=(?:\\*\\*|##\\s*)[A-Z]|$)`, 'i')
  const altMatch = text.match(altRegex)
  if (altMatch) return altMatch[1].trim()

  return ''
}
