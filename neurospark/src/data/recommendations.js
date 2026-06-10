export const dyslexiaTechniques = {
  Phonological: [
    { title: 'Orton-Gillingham phonics method', desc: 'Multi-sensory phonics — say the sound, write the letter, trace it. Links sound + symbol + touch simultaneously.' },
    { title: 'Daily phoneme blending drills', desc: 'Tap out each sound in a word every day. "cat" = 3 taps. Builds the phoneme awareness that is fundamentally missing.' },
    { title: 'Audiobooks alongside text', desc: 'Child listens while following words in the book. Comprehension develops separately from decoding.' },
    { title: 'No spelling penalties', desc: 'Mark for content and ideas only. Spelling errors do not count against the grade.' },
    { title: 'Sound-letter flashcard drills', desc: '10 minutes daily — letter shown, child says the sound out loud. Build the atomic unit first.' },
  ],
  Surface: [
    { title: 'Whole-word sight word drilling', desc: 'Flash the full word hundreds of times until recognition is automatic. Dolch word list is the starting point.' },
    { title: 'Repeated reading of same text', desc: 'Read the same book 5 times rather than 5 different books once. Builds automatic word recognition.' },
    { title: 'High-frequency word wall', desc: 'Poster of the 100 most common words. Child practices recognising them on sight every morning.' },
    { title: 'Paired reading', desc: 'Adult reads one sentence, child repeats. Models fluent reading so child hears what it should sound like.' },
  ],
  'Rapid Naming': [
    { title: 'Untimed everything', desc: 'Remove time pressure completely. Timed tests measure retrieval speed, not knowledge. All tests should be untimed.' },
    { title: 'Repeated reading practice', desc: 'Read the same short passage daily for a week. Each day is faster. Builds automaticity through repetition.' },
    { title: 'Pre-teaching vocabulary', desc: 'Introduce all new words before the lesson. Primes the retrieval pathway so recall is faster in context.' },
    { title: 'Speech-to-text tools', desc: 'Allow dictating answers instead of writing. Retrieval for speech is often faster than writing in RAN deficit.' },
  ],
  Visual: [
    { title: 'Coloured overlays', desc: 'Place a transparent coloured sheet over text. Reduces the perception of moving letters for visual dyslexia.' },
    { title: 'Larger font + wider spacing', desc: 'Font size 14pt minimum, 1.5x line spacing, sans-serif font. Reduces crowding where letters visually merge.' },
    { title: 'Finger or ruler tracking', desc: 'Child places finger under each word while reading. Prevents skipping lines and grounds visual attention.' },
    { title: 'High contrast materials', desc: 'Black text on cream/yellow paper instead of white. White paper glare worsens visual stress significantly.' },
  ],
}

export const asdTechniques = {
  'Social Communication': [
    { title: 'Visual + written instructions always', desc: 'Never give verbal-only instructions. Every instruction must also be written or shown visually.' },
    { title: 'Social story scripts', desc: 'For any social situation — give a pre-written script of exactly what to say and do.' },
    { title: 'Structured group work roles', desc: 'Assign explicit roles: "You are the writer. She is the researcher." Ambiguous tasks are stressful.' },
    { title: 'Interest-based learning', desc: 'Connect every topic to the child\'s specific interest. Engagement and retention skyrocket.' },
    { title: 'One instruction at a time', desc: 'Never chain multiple instructions. Give one, wait for completion, then give the next.' },
  ],
  'Sensory & Attention': [
    { title: 'Sensory break schedule', desc: 'Planned 5-minute movement breaks every 25 minutes. Not a reward — a neurological need.' },
    { title: 'Low-stimulation workspace', desc: 'Remove visual clutter from desk. Fewer items in visual field = more cognitive capacity for work.' },
    { title: 'Headphones allowed', desc: 'Noise-cancelling headphones during independent work. Background noise is genuinely painful for many autistic children.' },
    { title: 'Predictable lesson structure', desc: 'Every lesson follows the exact same sequence. Post it on the board. Deviation causes anxiety.' },
  ],
}

export const universalAccommodations = [
  'Allow extra time (1.5x minimum) on all assessments',
  'Permit oral exam answers instead of written',
  'Seat near the teacher — away from doors and windows',
  'Provide printed instructions — never verbal only',
  'No penalty for spelling errors',
  'Allow use of text-to-speech tools',
]

export function computeScores(taskResults) {
  const gaze = taskResults.gaze || { faceDwell: 50, objectDwell: 50, saccadeCount: 20 }
  const stroke = taskResults.stroke || { reversalRate: 0, lettersAttempted: 4 }
  const phonics = taskResults.phonics || { accuracy: 1, avgResponseTime: 2000 }

  const asd_social = gaze.objectDwell > 65 ? 78 :
    gaze.objectDwell > 55 ? 55 : 25

  const asd_repetitive = gaze.saccadeCount > 40 ? 45 : 28

  const dyslexia = stroke.reversalRate > 0.6 ? 74 :
    stroke.reversalRate > 0.3 ? 50 : 20

  const dysgraphia = stroke.reversalRate > 0.5 ? 55 :
    stroke.reversalRate > 0.25 ? 38 : 18

  const dyscalculia = phonics.accuracy < 0.5 ? 45 :
    phonics.accuracy < 0.7 ? 30 : 15

  const dyslexiaType = stroke.reversalRate > 0.5
    ? (phonics.accuracy < 0.6 ? 'Phonological' : 'Visual')
    : (phonics.avgResponseTime > 4000 ? 'Rapid Naming' : 'Surface')

  const asdProfile = asd_social > 60 ? 'Social Communication' : 'Sensory & Attention'
  const sparky_score = taskResults.sparky?.score || 30
  const conversation_score = taskResults.conversation?.score || 30



  // Update the asd_social score to include these
  const asd_social_final = Math.round((asd_social + sparky_score * 0.3 + conversation_score * 0.3) / 1.6)

  return {
    asd_social: asd_social_final,
    asd_repetitive, dyslexia, dysgraphia, dyscalculia,
    dyslexiaType, asdProfile,
    sparky_score,
    conversation_score
  }
  const sensory_score = taskResults.sensory?.sensitivity?.score || 25

  return {
    asd_social: asd_social_final,
    asd_repetitive: Math.round((asd_repetitive + sensory_score * 0.3) / 1.3),
    dyslexia, dysgraphia, dyscalculia,
    dyslexiaType, asdProfile,
    sparky_score,
    conversation_score,
    sensory_score
  }
}