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
    const { indexId, userId } = await req.json();

    if (!indexId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Rebuilding vector index: ${indexId}`);

    // Get vector index details
    const { data: vectorIndex, error: indexError } = await supabase
      .from('vector_indexes')
      .select('*')
      .eq('id', indexId)
      .eq('user_id', userId)
      .single();

    if (indexError || !vectorIndex) {
      throw new Error('Vector index not found or access denied');
    }

    // Update status to building
    const { error: updateError } = await supabase
      .from('vector_indexes')
      .update({
        status: 'building',
        last_updated_at: new Date().toISOString()
      })
      .eq('id', indexId);

    if (updateError) {
      throw new Error(`Failed to update index status: ${updateError.message}`);
    }

    // Simulate rebuilding process
    // In a real implementation, you would:
    // 1. Fetch all documents for this user
    // 2. Process and chunk the documents
    // 3. Generate embeddings using the specified model
    // 4. Store vectors in a vector database
    // 5. Update the index status and counts

    // For now, simulate with a delay and then mark as ready
    setTimeout(async () => {
      try {
        // Get document count for this user
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('id')
          .eq('user_id', userId);

        const documentsCount = documents?.length || 0;
        const vectorsCount = documentsCount * 50; // Simulate ~50 vectors per document

        await supabase
          .from('vector_indexes')
          .update({
            status: 'ready',
            documents_count: documentsCount,
            vectors_count: vectorsCount,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', indexId);

        console.log(`Vector index ${indexId} rebuild completed`);
      } catch (error) {
        console.error('Error completing index rebuild:', error);
        // Mark as error if rebuild fails
        await supabase
          .from('vector_indexes')
          .update({
            status: 'error',
            last_updated_at: new Date().toISOString()
          })
          .eq('id', indexId);
      }
    }, 5000); // 5 second delay to simulate processing

    console.log(`Vector index rebuild started for: ${vectorIndex.name}`);

    return new Response(JSON.stringify({ 
      success: true,
      index_name: vectorIndex.name,
      status: 'building',
      started_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error rebuilding vector index:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});