export interface ConfidenceResult {
  score: number;
  fillerCount: number;
  totalWords: number;
  highlightedHtml: string;
}

const FILLER_WORDS = new Set([
  'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally',
  'sort of', 'kind of', 'i mean', 'right'
]);

export function analyzeConfidence(transcript: string): ConfidenceResult {
  if (!transcript) {
    return { score: 100, fillerCount: 0, totalWords: 0, highlightedHtml: '' };
  }

  const words = transcript.split(/\s+/);
  let fillerCount = 0;
  
  // A simple pass to highlight single filler words
  // For multi-word fillers like "you know", it's slightly more complex, 
  // but for simplicity we'll just check single words for highlighting,
  // and do a quick replace for exact multi-word matches.
  
  let highlightedHtml = transcript;
  
  FILLER_WORDS.forEach(filler => {
    // regex to match whole words/phrases case insensitively
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = highlightedHtml.match(regex);
    if (matches) {
      fillerCount += matches.length;
      highlightedHtml = highlightedHtml.replace(regex, `<span class="text-red-500 font-bold bg-red-100 dark:bg-red-900/30 px-1 rounded">$&</span>`);
    }
  });

  const totalWords = words.length;
  // Score formula: starts at 100, drops by 5% for every filler word, minimum 0.
  // We can also factor in total words so 1 filler in 100 words doesn't hurt as much as 1 in 5 words.
  const fillerRatio = totalWords > 0 ? fillerCount / totalWords : 0;
  
  // If >10% of words are fillers, score is very low.
  // Let's say 0 fillers = 100. 5% fillers = 50. 10% fillers = 0.
  let score = Math.max(0, Math.round(100 - (fillerRatio * 1000)));
  
  // Cap at 100
  score = Math.min(100, score);

  return {
    score,
    fillerCount,
    totalWords,
    highlightedHtml
  };
}
