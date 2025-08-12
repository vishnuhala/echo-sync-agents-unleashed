import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function htmlToText(html: string): string {
  try {
    // Remove script and style tags
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    // Replace breaks and paragraphs with newlines
    html = html.replace(/<(br|p|div|li|tr|h[1-6])[^>]*>/gi, '\n');
    // Strip remaining tags
    const text = html.replace(/<[^>]+>/g, ' ');
    // Decode basic entities
    const decoded = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Collapse whitespace
    return decoded.replace(/\s+/g, ' ').trim();
  } catch (_e) {
    return html;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, userId, title } = await req.json();
    if (!url || !userId) {
      throw new Error('Missing required parameters: url, userId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Scraping URL for user ${userId}: ${url}`);

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Lovable RAG Ingest)' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }
    const html = await res.text();

    // Try to extract <title>
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = (title || (titleMatch ? titleMatch[1] : '') || '').trim();

    const text = htmlToText(html).slice(0, 50000); // cap size

    const urlObj = new URL(url);
    const safePath = `${urlObj.hostname}${urlObj.pathname}`.replace(/[^a-zA-Z0-9-_./]/g, '-');
    const filename = `${pageTitle || 'web_page'} - ${safePath}`.slice(0, 120) + '.html';

    // Insert document row directly (treat as processed content)
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        filename,
        file_url: url,
        file_type: 'text/html',
        file_size: null,
        content: `Source URL: ${url}\n\n${text}`,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (docError) {
      console.error('Insert document error:', docError);
      throw new Error(`Failed to save scraped document: ${docError.message}`);
    }

    console.log('Scraped document saved with id:', doc.id);

    return new Response(JSON.stringify({ success: true, document: doc }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in rag-ingest-url:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
