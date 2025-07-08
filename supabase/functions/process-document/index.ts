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
    let analysisResult = '';

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
        // For PDF files, we'll extract what we can and provide guidance
        extractedText = new TextDecoder().decode(fileBuffer);
        // Try to extract readable text (basic approach)
        if (extractedText.includes('%PDF')) {
          extractedText = 'PDF document detected. Content: ' + extractedText.replace(/[^\x20-\x7E]/g, ' ').substring(0, 1000) + '...';
        }
      } else if (fileType?.includes('word') || fileType?.includes('document')) {
        // For Word documents, extract what we can
        extractedText = new TextDecoder().decode(fileBuffer);
        extractedText = 'Word document detected. Raw content extracted: ' + extractedText.replace(/[^\x20-\x7E]/g, ' ').substring(0, 1000) + '...';
      } else {
        // For other document types, at least show some content
        extractedText = new TextDecoder().decode(fileBuffer);
        extractedText = 'Document content: ' + extractedText.replace(/[^\x20-\x7E]/g, ' ').substring(0, 1000) + '...';
      }

      // Perform AI analysis if we have OpenAI key and valid content
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openAIApiKey && extractedText.length > 50) {
        try {
          const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a document analyzer. Provide a concise summary and analysis of the document content. Include key points, topics, and potential insights.' 
                },
                { 
                  role: 'user', 
                  content: `Analyze this document content:\n\n${extractedText.substring(0, 2000)}` 
                }
              ],
              max_tokens: 500,
              temperature: 0.3,
            }),
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            analysisResult = analysisData.choices[0].message.content;
            
            // Combine original content with analysis
            extractedText = `Original Content:\n${extractedText}\n\n--- AI Analysis ---\n${analysisResult}`;
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          // Continue without analysis if it fails
        }
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