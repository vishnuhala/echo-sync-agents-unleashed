import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, vectorIndexId, userId } = await req.json();

    if (!query || !vectorIndexId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing RAG query: "${query}" for index: ${vectorIndexId}`);

    // Get vector index details
    const { data: vectorIndex, error: indexError } = await supabase
      .from('vector_indexes')
      .select('*')
      .eq('id', vectorIndexId)
      .eq('user_id', userId)
      .single();

    if (indexError || !vectorIndex) {
      throw new Error('Vector index not found or access denied');
    }

    if (vectorIndex.status !== 'ready') {
      throw new Error('Vector index is not ready for queries');
    }

    // Get documents associated with this index
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    // Perform direct content search and return real excerpts from user documents
    const mockResults: Array<{ content: string; source: string; score: number }> = [];

    if (documents && documents.length > 0) {
      const q = String(query).toLowerCase().trim();
      for (const doc of documents) {
        const content: string = (doc as any).content || '';
        const lower = content.toLowerCase();
        const idx = q ? lower.indexOf(q) : -1;
        if (idx !== -1) {
          const window = 220;
          const start = Math.max(0, idx - Math.floor(window / 2));
          const end = Math.min(content.length, idx + q.length + Math.floor(window / 2));
          const excerpt = content.slice(start, end).trim();

          // Basic score based on query length vs content length (naive)
          const score = Math.min(0.99, 0.7 + Math.min(0.29, q.length / Math.max(80, content.length)));

          mockResults.push({
            content: excerpt,
            source: (doc as any).file_url || (doc as any).filename || 'Document',
            score,
          });
        }
      }
    }

    // No generic fallbacks — if no matches in your sources, return an empty list so the UI can inform the user.

    // Sort by score descending
    mockResults.sort((a, b) => b.score - a.score);

    console.log(`RAG query completed. Found ${mockResults.length} results`);

    return new Response(JSON.stringify({ 
      results: mockResults,
      query,
      index_name: vectorIndex.name,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG query:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});