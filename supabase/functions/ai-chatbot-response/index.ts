
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    // Convert message to lowercase for case-insensitive matching
    const normalizedMessage = message.toLowerCase()
    
    // Fetch all responses from the database
    const { data: responses, error } = await supabase
      .from('chatbot_responses')
      .select('*')
    
    if (error) {
      throw error
    }
    
    // Find the best matching response based on keywords
    let bestMatch = null
    let bestMatchScore = 0
    
    for (const response of responses) {
      // Calculate a simple matching score based on keyword presence
      const matchScore = response.keywords.reduce((score, keyword) => {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return score + 1
        }
        return score
      }, 0)
      
      // Update best match if this response has a higher score
      if (matchScore > bestMatchScore) {
        bestMatch = response
        bestMatchScore = matchScore
      }
    }
    
    // If no good match is found, provide a default response
    let responseText = "I don't have specific information on that topic yet. Please check our FAQs or contact our support team for more information."
    
    if (bestMatch && bestMatchScore > 0) {
      responseText = bestMatch.response_text
    }
    
    // Return the response with CORS headers
    return new Response(
      JSON.stringify({ response: responseText }),
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
