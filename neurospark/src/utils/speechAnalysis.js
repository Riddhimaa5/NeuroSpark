export function analyseTranscript(transcript, question) {
  const cleanStr = (s) => s.toLowerCase().replace(/[^\w\s]/g, '')
  const words = cleanStr(transcript).split(/\s+/).filter(w => w.length > 0)
  const questionWords = cleanStr(question).split(/\s+/).filter(w => w.length > 0)
  const uniqueWords = new Set(words)

  const overlap = words.filter(w => questionWords.includes(w)).length
  const uniqueWordRatio = words.length > 0 ? uniqueWords.size / words.length : 0

  let isEcholalic = false
  if (words.length > 0) {
    const tStr = cleanStr(transcript)
    const qStr = cleanStr(question)
    
    // Exact or near-exact echo
    if (words.length >= 2 && qStr.includes(tStr) && words.length >= questionWords.length - 1) {
       isEcholalic = true
    } else if (words.length >= 3 && qStr.includes(tStr)) {
      isEcholalic = true
    } else if (words.length >= 2 && overlap / words.length >= 0.8) {
      isEcholalic = true
    }

    // Self-repetition (palilalia / echolalia variant) e.g., "food food food"
    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount >= 3) {
      isEcholalic = true;
    }
  }

  const emotionWords = ['happy', 'sad', 'angry', 'scared', 'excited', 'worried',
    'good', 'bad', 'love', 'hate', 'fun', 'boring', 'tired', 'upset', 'fine', 'okay', 'great', 'awesome', 'yes', 'no']
  const emotionalCount = words.filter(w => emotionWords.includes(w)).length

  const questionKeywords = questionWords.filter(w => w.length > 3)
  const relevanceScore = questionKeywords.length > 0 
    ? questionKeywords.filter(k => cleanStr(transcript).includes(k)).length / questionKeywords.length
    : 1;

  return {
    wordCount: words.length,
    uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
    echolaliaRate: words.length > 0 ? Math.round((overlap / words.length) * 100) / 100 : 0,
    emotionalCount,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    isEcholalic,
    isShortResponse: words.length > 0 && words.length <= 2 && !isEcholalic,
    lacksEmotion: emotionalCount === 0,
    isIrrelevant: words.length > 0 && relevanceScore < 0.2 && overlap === 0
  }
}

export function computeCommunicationScore(responses) {
  if (!responses || responses.length === 0) return 50
  
  let score = 0; // 0 = typical, 100 = high concern
  
  const validResponses = responses.filter(r => r.analysis && r.analysis.wordCount > 0);
  const noResponseCount = responses.length - validResponses.length;
  
  if (noResponseCount === responses.length) {
    return 100; // Maximum concern if no response to anything
  }
  
  score += noResponseCount * 15;
  
  const avgLatency = validResponses.reduce((s, r) => s + r.latency, 0) / Math.max(validResponses.length, 1);
  if (avgLatency > 5000) score += 15;
  else if (avgLatency > 3000) score += 10;
  
  const echolaliaCount = responses.filter(r => r.analysis && r.analysis.isEcholalic).length;
  score += echolaliaCount * 20;
  
  const shortResponseCount = responses.filter(r => r.analysis && r.analysis.isShortResponse).length;
  score += shortResponseCount * 5; 
  
  if (validResponses.length > 0) {
    const avgUniqueWordRatio = validResponses.reduce((s, r) => s + r.analysis.uniqueWordRatio, 0) / validResponses.length;
    if (avgUniqueWordRatio < 0.5) score += 10;
  }
  
  const irrelevantCount = responses.filter(r => r.analysis && r.analysis.isIrrelevant).length;
  score += irrelevantCount * 10;
  
  return Math.min(Math.round(score), 100)
}

export function computeGestureScore(trials) {
  if (!trials || trials.length === 0) return 50
  const responded = trials.filter(t => t.responded)
  const responseRate = responded.length / trials.length
  const avgLatency = responded.length > 0
    ? responded.reduce((s, t) => s + t.latency, 0) / responded.length
    : 5000

  let score = 0
  if (responseRate < 0.34) score += 50
  else if (responseRate < 0.67) score += 30
  else if (responseRate < 1) score += 15
  if (avgLatency > 3000) score += 30
  else if (avgLatency > 1500) score += 15

  return Math.min(Math.round(score + 15), 100)
}