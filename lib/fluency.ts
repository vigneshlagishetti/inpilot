export interface FluencyMetrics {
  score: number // 0-100
  totalWords: number
  fillerCount: number
  fillerBreakdown: Record<string, number>
}

export function analyzeFluency(transcript: string): FluencyMetrics {
  if (!transcript || transcript.trim().length === 0) {
    return { score: 100, totalWords: 0, fillerCount: 0, fillerBreakdown: {} }
  }

  const fillerWords = [
    'um', 'uh', 'ah', 'like', 'you know', 'basically', 'literally', 'sort of', 'kind of', 'i mean'
  ]

  // Count total words (approximate)
  const words = transcript.toLowerCase().match(/\b\w+\b/g) || []
  const totalWords = words.length

  let fillerCount = 0
  const fillerBreakdown: Record<string, number> = {}

  // Count exact matches of filler phrases
  const lowerTranscript = transcript.toLowerCase()
  
  fillerWords.forEach(filler => {
    // Word boundary regex for the specific filler phrase
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lowerTranscript.match(regex)
    if (matches) {
      const count = matches.length
      fillerCount += count
      fillerBreakdown[filler] = count
    }
  })

  // Calculate score: Start at 100, deduct based on filler ratio
  // E.g., 5 fillers in 100 words = 5% ratio.
  // A ratio of 0% = 100 score. A ratio of >= 10% = 0 score (harsh scale for interviews)
  const ratio = totalWords > 0 ? fillerCount / totalWords : 0
  
  let score = 100
  if (ratio > 0) {
    // Penalty: 10 points per 1% filler ratio
    const penalty = ratio * 100 * 10
    score = Math.max(0, Math.round(100 - penalty))
  }

  return {
    score,
    totalWords,
    fillerCount,
    fillerBreakdown
  }
}
