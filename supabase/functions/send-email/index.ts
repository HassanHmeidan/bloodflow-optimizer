
// Follow this setup guide to integrate the Deno runtime with your project:
// https://docs.supabase.com/guides/functions/connect-to-postgres

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body, from } = await req.json()
    
    // Get the email service credentials from environment variables
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    
    if (!emailServiceUrl || !emailApiKey) {
      throw new Error("Email service configuration missing")
    }
    
    if (!to || !subject || !body) {
      throw new Error("Missing required email fields")
    }
    
    // Make request to email service (like SendGrid, Mailgun, etc.)
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        from: from || 'noreply@blooddonation.com'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Email API responded with ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
