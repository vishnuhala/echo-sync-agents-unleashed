import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, businessInfo, targetAudience } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let prompt = '';
    if (contentType === 'blog') {
      prompt = `Write a blog post for:\n\nBusiness: ${businessInfo.name}\nIndustry: ${businessInfo.industry}\nTarget Audience: ${targetAudience}\nTopic: ${businessInfo.topic}\n\nCreate an engaging 500-word blog post with:\n- Catchy title\n- Introduction\n- 3-4 main points\n- Conclusion with CTA`;
    } else if (contentType === 'social') {
      prompt = `Create 5 social media posts for:\n\nBusiness: ${businessInfo.name}\nIndustry: ${businessInfo.industry}\nTarget Audience: ${targetAudience}\n\nMix of:\n- Educational content\n- Engagement posts\n- Product highlights\n\nInclude relevant hashtags.`;
    } else if (contentType === 'email') {
      prompt = `Write a marketing email for:\n\nBusiness: ${businessInfo.name}\nIndustry: ${businessInfo.industry}\nTarget Audience: ${targetAudience}\nCampaign Goal: ${businessInfo.goal}\n\nInclude:\n- Subject line\n- Preview text\n- Body copy\n- Clear CTA`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a marketing copywriter AI. Create compelling, conversion-focused content that resonates with the target audience.' },
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Content generation failed. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
