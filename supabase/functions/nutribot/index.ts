import "@supabase/functions-js/edge-runtime.d.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { messages, profile } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid messages array' }), { status: 400, headers: corsHeaders })
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: missing API key' }), { status: 500, headers: corsHeaders })
    }

    const ai = new GoogleGenAI({ apiKey })

    // Build the system prompt with the user's profile
    const conditions = profile?.conditions?.join(', ') || 'None specified'
    const goals = profile?.goals?.join(', ') || 'None specified'
    const nutrientTargets = profile?.nutrientTargets?.map((t: any) => `${t.label} (<= ${t.dailyLimit} ${t.unit})`).join(', ') || 'None specified'

    const systemInstruction = `You are NutriBot, a supportive and empathetic health and nutrition assistant built specifically for the NutriScan app. 
Your user has the following health profile:
- Health Conditions: ${conditions}
- Health Goals: ${goals}
- Monitored Nutrients: ${nutrientTargets}

Rules for Nutritional Advice:
1. Provide personalized food safety and nutritional advice based strictly on their profile.
2. If a food item is generally healthy but dangerous for their specific condition, clearly warn them and explain why.
3. Be warm, empathetic, and encouraging. Use short, easy-to-read paragraphs.
4. Never give definitive medical diagnoses. Suggest consulting their doctor if unsure.
5. Do not use complex medical jargon unless you explain it simply.
6. Format your response clearly using markdown for readability.

Rules for App Navigation Help:
If the user asks how to use the app or where to find something, guide them using this app layout:
- "Home" tab: Shows daily health safety summary, today's log preview, and personalized tips.
- "Scan" tab: The camera to scan food barcodes or take photos for instant safety analysis.
- "History" tab: Where they can view past scan logs, weekly trends, and their full health summary report.
- "Profile" tab: Where they can update their health conditions, goals, and account settings.`

    // We are using Gemma 2 27B (Instruction Tuned)
    const model = 'gemma-2-27b-it'
    
    // Format messages for @google/genai SDK
    // SDK expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: model,
      contents: formattedMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    })

    const reply = response.text || 'I am sorry, but I am unable to respond at this time.'

    return new Response(
      JSON.stringify({ reply }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  } catch (error) {
    console.error('Error in NutriBot edge function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  }
})
