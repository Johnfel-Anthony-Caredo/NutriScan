import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { GoogleGenAI } from "npm:@google/genai"
import { createClient } from "npm:@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pre-create the AI client during cold-start so it's ready for first request
const apiKey = Deno.env.get('GEMINI_API_KEY')
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

/**
 * Retry an async function with exponential backoff.
 * Used to handle transient 500 errors from Gemini model serving layer.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1500,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      // Only retry on 5xx-like errors (including Google's INTERNAL errors)
      const message = err instanceof Error ? err.message : String(err)
      const isRetryable =
        message.includes('500') ||
        message.includes('INTERNAL') ||
        message.includes('503') ||
        message.includes('UNAVAILABLE') ||
        message.includes('timeout') ||
        message.includes('DEADLINE_EXCEEDED')
      if (!isRetryable || attempt >= maxRetries) {
        throw err
      }
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Gemini API attempt ${attempt + 1} failed, retrying in ${delay}ms: ${message.substring(0, 100)}`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
    }

    // Verify token using Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { image, barcodeData, userProfile, text } = body

    if (!userProfile) {
      return new Response(JSON.stringify({ error: 'Missing userProfile' }), { status: 400, headers: corsHeaders })
    }

    if (!ai) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: missing API key' }), { status: 500, headers: corsHeaders })
    }

    const conditions = userProfile?.conditions?.join(', ') || 'None specified'
    const goals = userProfile?.goals?.join(', ') || 'None specified'
    const nutrientTargets = userProfile?.nutrientTargets?.map((t: any) => `${t.label} (<= ${t.dailyLimit} ${t.unit})`).join(', ') || 'None specified'

    const systemInstruction = `You are a nutrition analyst. Analyze the provided food data (image, barcode data, or text) against the user's specific health profile:
- Health Conditions: ${conditions}
- Health Goals: ${goals}
- Monitored Nutrients: ${nutrientTargets}

Your response MUST be ONLY valid JSON matching this structure exactly (no markdown formatting, no \`\`\`json wrappers):
{
  "confidence": 0.95,
  "foodName": "Name of the identified food",
  "verdict": "safe" | "caution" | "avoid",
  "explanation": "Detailed, specific explanation of why this food is safe/caution/avoid based on their profile.",
  "safeMessage": "Optional brief encouraging message if safe",
  "reasoningSummary": ["Bullet point 1", "Bullet point 2"],
  "alternatives": [
    { "name": "Alternative 1", "verdict": "safe" }
  ],
  "nutrients": [
    {
      "nutrient": "calories" | "sugar" | "sodium" | "carbs" | "fat" | "protein",
      "label": "Display label",
      "value": 100,
      "unit": "g" | "mg" | "kcal",
      "dailyLimit": 2000,
      "overLimit": false,
      "warning": "Optional warning string if over limit"
    }
  ],
  "portionGuidance": "Optional short phrase about portion considerations based on the verdict (e.g. 'Best eaten in small portions', 'Fine in moderation', 'Avoid large servings')"
}

Rules:
1. Provide a precise JSON output. DO NOT wrap the output in markdown code blocks.
2. Set confidence based on how certain you are about the food identification (1.0 = absolutely certain, 0.0 = completely unsure). Factor in image quality, clarity, and whether the food is clearly identifiable.
3. Consider the user's specific conditions carefully. If the food is dangerous for their conditions, set verdict to "avoid" or "caution".
4. Extract nutrients as accurately as possible from the image or barcode data.
5. portionGuidance should reflect the verdict and conditions — "Fine in moderation" for safe, "Best in small portions" for caution, "Avoid large servings" for avoid items.`

    
    const model = 'gemma-4-31b-it'
    
    // Prepare contents
    const contents: any[] = []
    
    let promptText = 'Analyze this food.'
    if (text) {
      promptText += ` Food name/description: ${text}.`
    }
    if (barcodeData) {
      promptText += `\nBarcode Product Data: ${JSON.stringify(barcodeData)}`
    }
    
    contents.push({ text: promptText })
    
    if (image?.base64) {
      // Inline data for the image
      contents.push({
        inlineData: {
          data: image.base64,
          mimeType: image.mimeType || 'image/jpeg'
        }
      })
    }

    // Call Gemini API
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.2, // precise JSON output
        }
      })
    })

    const reply = response.text || ''
    
    // Attempt to parse JSON to ensure it's valid, clean up markdown if present
    let jsonOutput = reply.trim()
    if (jsonOutput.startsWith('```json')) {
      jsonOutput = jsonOutput.substring(7)
    }
    if (jsonOutput.startsWith('```')) {
      jsonOutput = jsonOutput.substring(3)
    }
    if (jsonOutput.endsWith('```')) {
      jsonOutput = jsonOutput.substring(0, jsonOutput.length - 3)
    }
    
    const resultData = JSON.parse(jsonOutput.trim())

    // Deduplicate nutrients by name to avoid React key collisions on the client
    if (Array.isArray(resultData.nutrients)) {
      const seen = new Set<string>()
      resultData.nutrients = resultData.nutrients.filter((n: { nutrient: string }) => {
        if (seen.has(n.nutrient)) return false
        seen.add(n.nutrient)
        return true
      })
    }

    return new Response(
      JSON.stringify(resultData),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  } catch (error) {
    console.error('Error in scan-ai edge function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  }
})
