// Supabase Edge Function to handle Mailchimp subscriptions
// This keeps your API key secure on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY') || '';
const MAILCHIMP_AUDIENCE_ID = Deno.env.get('MAILCHIMP_AUDIENCE_ID') || '';
const MAILCHIMP_DC = 'us4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Subscribe to Mailchimp
    const url = `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`anystring:${MAILCHIMP_API_KEY}`)}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific Mailchimp errors
      if (data.title === 'Member Exists') {
        return new Response(
          JSON.stringify({ success: true, message: 'You are already subscribed!' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: data.detail || 'Failed to subscribe' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

