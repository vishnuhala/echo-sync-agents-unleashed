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

    // For now, simulate RAG query with simple text matching
    // In a real implementation, you would:
    // 1. Convert query to embeddings using the same model as the index
    // 2. Perform vector similarity search
    // 3. Retrieve the most relevant document chunks
    
    const mockResults = [];
    
    if (documents && documents.length > 0) {
      // Simple text matching simulation
      for (const doc of documents.slice(0, 3)) {
        if (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) {
          const excerpt = doc.content.substring(0, 200) + '...';
          mockResults.push({
            content: excerpt,
            source: doc.filename || 'Unknown Document',
            score: Math.random() * 0.3 + 0.7 // Random score between 0.7-1.0
          });
        }
      }
    }

    // If no matches found, provide generic results
    if (mockResults.length === 0) {
      mockResults.push(
        {
          content: `This is a relevant excerpt that matches your query about "${query}". The content discusses related concepts and provides valuable insights.`,
          source: `${vectorIndex.name}_doc_1.pdf`,
          score: 0.85
        },
        {
          content: `Additional context regarding "${query}" can be found in this section. It provides supplementary information and background details.`,
          source: `${vectorIndex.name}_doc_2.pdf`,
          score: 0.78
        }
      );
    }

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