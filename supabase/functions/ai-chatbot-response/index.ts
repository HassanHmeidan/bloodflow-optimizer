
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
    
    // Get blood inventory status to provide up-to-date context
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('blood_inventory')
      .select('blood_type, units')
      .eq('status', 'available')
      .order('blood_type')

    if (inventoryError) {
      console.error('Error fetching inventory data:', inventoryError)
    }

    // Get donation center data
    const { data: centerData, error: centerError } = await supabase
      .from('donation_centers')
      .select('name, city, address')
      .limit(10)

    if (centerError) {
      console.error('Error fetching center data:', centerError)
    }

    // Get predictive demand data
    const { data: demandData, error: demandError } = await supabase
      .from('predictive_demand')
      .select('blood_type, urgency_level')
      .order('urgency_level', { ascending: false })
      .limit(3)

    if (demandError) {
      console.error('Error fetching demand data:', demandError)
    }

    // Format inventory data for the AI context
    const inventoryContext = inventoryData && inventoryData.length > 0 ? 
      `Current blood inventory status:\n${inventoryData.map(item => 
        `${item.blood_type}: ${item.units} units`).join('\n')}` : 
      'Blood inventory data not available';

    // Format donation center data for the AI context
    const centerContext = centerData && centerData.length > 0 ? 
      `Available donation centers:\n${centerData.map(center => 
        `${center.name} - ${center.city}, ${center.address}`).join('\n')}` : 
      'Donation center data not available';

    // Format demand data for the AI context
    const demandContext = demandData && demandData.length > 0 ? 
      `Current blood demand priorities:\n${demandData.map(item => 
        `${item.blood_type}: ${item.urgency_level} urgency`).join('\n')}` : 
      'Demand data not available';

    // Prepare system instructions for the AI model with real-time data
    const systemInstructions = `
      You are a helpful blood donation assistant for LifeFlow, a blood donation platform in Lebanon. 
      Your goal is to answer questions about blood donation, eligibility, process, and provide information 
      about LifeFlow's services.
      
      Use the following real-time information in your responses when relevant:
      
      ${inventoryContext}
      
      ${centerContext}
      
      ${demandContext}
      
      If asked about specific locations, provide information about the centers mentioned above.
      
      If asked about medical advice beyond basic eligibility, suggest consulting with healthcare professionals.
      
      If a user wants to donate, encourage them based on current demand, especially for blood types with high urgency.
      
      If a user mentions a specific location in Lebanon, try to reference nearby donation centers.
      
      Keep responses friendly, informative, and concise (max 3-4 sentences).
      
      If the user asks about how to navigate to a specific page on the platform, you can add [NAVIGATE:/page-path] 
      to your response to help them get there. Example pages: /donate, /request, /about.
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
    
    // Save the interaction to the database for future training
    try {
      await supabase
        .from('chatbot_responses')
        .insert({
          query_pattern: message,
          response_text: aiResponse,
          category: 'ai-generated',
          keywords: message.toLowerCase().split(' ').filter((word: string) => word.length > 3)
        });
    } catch (insertError) {
      console.error('Error saving interaction to database:', insertError);
      // Continue with the response even if saving fails
    }
    
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
