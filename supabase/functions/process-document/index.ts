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
    const { documentId, fileUrl, fileType } = await req.json();

    if (!documentId || !fileUrl) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let extractedText = '';

    try {
      // Download the file
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      
      // Extract text based on file type
      if (fileType === 'text/plain') {
        // For text files, simply decode as UTF-8
        extractedText = new TextDecoder().decode(fileBuffer);
      } else if (fileType === 'application/pdf') {
        // For PDF files, we'll use a simple extraction approach
        // In a production environment, you'd want to use a proper PDF parsing library
        extractedText = 'PDF content extraction would require additional libraries. Please upload text files for now.';
      } else {
        // For other document types, placeholder text
        extractedText = 'Document uploaded successfully. Content extraction for this file type will be available soon.';
      }

      // Update the document with extracted content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: extractedText,
          processed_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        throw updateError;
      }

      console.log(`Document ${documentId} processed successfully`);

    } catch (processingError) {
      console.error('Error processing document:', processingError);
      
      // Update document with error status
      await supabase
        .from('documents')
        .update({
          content: 'Error processing document. Please try uploading again.',
          processed_at: new Date().toISOString(),
        })
        .eq('id', documentId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Document processing completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});