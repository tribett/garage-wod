export interface VoiceResult {
  weight: number | null
  reps: number | null
  raw: string
  confidence: number
}

const WORD_TO_NUM: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
}

/**
 * Try to convert compound word numbers like "one thirty five" → 135
 * or simple words like "five" → 5.
 * Returns [convertedString, wasConverted] tuple.
 */
function convertWordNumbers(input: string): [string, boolean] {
  let result = input
  let converted = false

  // Handle compound numbers: "one thirty five" → "135", "two twenty five" → "225"
  // Pattern: single-digit-word + tens-word (+ optional ones-word)
  const compoundPattern =
    /\b(one|two|three|four|five|six|seven|eight|nine)\s+(ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s+(one|two|three|four|five|six|seven|eight|nine))?\b/g

  result = result.replace(compoundPattern, (_match, hundreds, tens, ones) => {
    converted = true
    const h = WORD_TO_NUM[hundreds as string] as number
    const t = WORD_TO_NUM[tens as string] as number
    const o = ones ? (WORD_TO_NUM[ones as string] as number) : 0
    return String(h * 100 + t + o)
  })

  // Handle remaining simple word numbers
  const wordPattern =
    /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/g

  result = result.replace(wordPattern, (match) => {
    converted = true
    return String(WORD_TO_NUM[match] as number)
  })

  return [result, converted]
}

export function parseVoiceInput(transcript: string): VoiceResult {
  const raw = transcript
  const normalized = transcript.trim().toLowerCase()

  // Check for bodyweight
  if (normalized === 'bodyweight' || normalized === 'body weight') {
    return { weight: 0, reps: null, raw, confidence: 1.0 }
  }

  // Convert word numbers to digits
  const [withDigits, hadWordConversion] = convertWordNumbers(normalized)
  const confidence = hadWordConversion ? 0.8 : 1.0

  // Try "N for/x/times M" pattern
  const repDelimiterPattern = /(\d+)\s+(?:for|x|times)\s+(\d+)/
  const repMatch = withDigits.match(repDelimiterPattern)
  if (repMatch) {
    return {
      weight: parseInt(repMatch[1], 10),
      reps: parseInt(repMatch[2], 10),
      raw,
      confidence,
    }
  }

  // Try "N pounds/lbs/kilos/kg" pattern
  const unitPattern = /(\d+)\s+(?:pounds?|lbs?|kilos?|kg)/
  const unitMatch = withDigits.match(unitPattern)
  if (unitMatch) {
    return {
      weight: parseInt(unitMatch[1], 10),
      reps: null,
      raw,
      confidence,
    }
  }

  // Try just a number
  const numberPattern = /(\d+)/
  const numMatch = withDigits.match(numberPattern)
  if (numMatch) {
    return {
      weight: parseInt(numMatch[1], 10),
      reps: null,
      raw,
      confidence,
    }
  }

  // Unparseable
  return { weight: null, reps: null, raw, confidence: 0 }
}

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as any
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function startListening(
  onResult: (result: VoiceResult) => void
): () => void {
  const w = window as any
  const SpeechRecognitionCtor =
    w.SpeechRecognition || w.webkitSpeechRecognition
  const recognition = new SpeechRecognitionCtor()
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    const result = parseVoiceInput(transcript)
    onResult(result)
  }

  recognition.start()

  return () => {
    recognition.stop()
  }
}
