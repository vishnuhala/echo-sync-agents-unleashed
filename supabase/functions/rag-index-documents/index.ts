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
    const { indexId, documentIds, userId } = await req.json();

    if (!indexId || !documentIds || !userId) {
      throw new Error('Missing required parameters');
    }

    if (!Array.isArray(documentIds)) {
      throw new Error('documentIds must be an array');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Indexing ${documentIds.length} documents for index: ${indexId}`);

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

    // Get documents to be indexed
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)
      .eq('user_id', userId);

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    if (!documents || documents.length === 0) {
      throw new Error('No documents found to index');
    }

    // Update index status to building
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

    // Process documents and generate embeddings
    // In a real implementation, you would:
    // 1. Chunk each document into smaller pieces
    // 2. Generate embeddings for each chunk using the specified model
    // 3. Store vectors in a vector database (like Pinecone, Weaviate, or PostgreSQL with pgvector)
    // 4. Update document processing status

    const processedDocs = [];
    let totalVectors = 0;

    for (const doc of documents) {
      console.log(`Processing document: ${doc.filename}`);
      
      // Simulate document processing
      const chunks = Math.ceil((doc.content?.length || 1000) / 500); // ~500 chars per chunk
      const vectors = chunks * 1; // 1 vector per chunk
      totalVectors += vectors;

      processedDocs.push({
        id: doc.id,
        filename: doc.filename,
        chunks: chunks,
        vectors: vectors
      });

      // Update document processing status
      await supabase
        .from('documents')
        .update({
          processed_at: new Date().toISOString()
        })
        .eq('id', doc.id);
    }

    // Update vector index with new counts
    const currentDocsCount = vectorIndex.documents_count + documents.length;
    const currentVectorsCount = vectorIndex.vectors_count + totalVectors;

    const { error: finalUpdateError } = await supabase
      .from('vector_indexes')
      .update({
        status: 'ready',
        documents_count: currentDocsCount,
        vectors_count: currentVectorsCount,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', indexId);

    if (finalUpdateError) {
      throw new Error(`Failed to update index counts: ${finalUpdateError.message}`);
    }

    console.log(`Successfully indexed ${documents.length} documents with ${totalVectors} vectors`);

    return new Response(JSON.stringify({ 
      success: true,
      index_name: vectorIndex.name,
      processed_documents: processedDocs,
      total_documents: currentDocsCount,
      total_vectors: currentVectorsCount,
      completed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error indexing documents:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});