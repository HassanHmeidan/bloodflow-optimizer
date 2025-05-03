
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { message } = await req.json()
    
    // Log the incoming message for debugging
    console.log('Received chatbot query:', message)
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch chatbot responses to use as context
    const { data: responses, error } = await supabase
      .from('chatbot_responses')
      .select('*')
    
    if (error) {
      throw error
    }

    // Process responses to create a context for the AI model
    const contextData = responses.map(item => {
      return `Question: ${item.query_pattern}
Answer: ${item.response_text}`
    }).join('\n\n');

    // Prepare system instructions for the AI model
    const systemInstructions = `
      You are a helpful blood donation assistant for LifeFlow, a blood donation platform. 
      Your goal is to answer questions about blood donation, eligibility, process, and provide information 
      about LifeFlow's services.
      
      If asked about locations, provide general guidance and suggest users check the donation center 
      locator on the website.
      
      If asked about medical advice beyond basic eligibility, suggest consulting with healthcare professionals.
      
      Keep responses friendly, informative, and concise (max 3-4 sentences).
      
      Here's some information about common topics:
      ${contextData}
    `;

    // Build the conversation history
    const messages = [
      { role: "system", content: systemInstructions },
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const openaiData = await openaiResponse.json();
    
    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', openaiData);
      throw new Error(`OpenAI API error: ${openaiData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = openaiData.choices[0].message.content;
    
    // Check if there's navigation info in the response
    let responseText = aiResponse;
    const navigateMatch = responseText.match(/\[NAVIGATE:(\/[^\]]+)\]/);
    const cleanResponse = responseText.replace(/\[NAVIGATE:[^\]]+\]/g, '');

    // Return the response with CORS headers
    return new Response(
      JSON.stringify({ 
        response: cleanResponse,
        navigate: navigateMatch ? navigateMatch[1] : null 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error processing chatbot request:', error)
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
