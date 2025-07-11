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
      console.log('Starting document processing for:', documentId, 'URL:', fileUrl, 'Type:', fileType);
      
      // Download the file
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        console.error('Failed to download file:', fileResponse.status, fileResponse.statusText);
        throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      console.log('File downloaded successfully, size:', fileBuffer.byteLength);
      
      // Extract text based on file type
      if (fileType === 'text/plain') {
        // For text files, simply decode as UTF-8
        extractedText = new TextDecoder().decode(fileBuffer);
        console.log('Text file processed, length:', extractedText.length);
      } else if (fileType === 'application/pdf') {
        // For PDF files, provide basic analysis without complex extraction
        const textContent = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer);
        // Extract some readable content and metadata
        const readableText = textContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if (readableText.length > 50) {
          extractedText = `PDF Document Analysis:\n\nDocument Type: PDF\nFile Size: ${Math.round(fileBuffer.byteLength / 1024)} KB\n\nExtracted Content Preview:\n${readableText.substring(0, 2000)}${readableText.length > 2000 ? '...' : ''}`;
        } else {
          extractedText = `PDF Document Detected\n\nDocument Type: PDF\nFile Size: ${Math.round(fileBuffer.byteLength / 1024)} KB\n\nNote: This appears to be a complex PDF document. The file has been successfully uploaded and can be referenced by AI agents in conversations.`;
        }
        console.log('PDF processed, extracted text length:', extractedText.length);
      } else if (fileType?.includes('word') || fileType?.includes('document')) {
        // For Word documents, provide basic analysis
        const textContent = new TextDecoder('utf-8', { fatal: false }).decode(fileBuffer);
        const readableText = textContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        extractedText = `Word Document Analysis:\n\nDocument Type: ${fileType}\nFile Size: ${Math.round(fileBuffer.byteLength / 1024)} KB\n\nExtracted Content Preview:\n${readableText.substring(0, 2000)}${readableText.length > 2000 ? '...' : ''}`;
        console.log('Word document processed, extracted text length:', extractedText.length);
      } else {
        // For other document types, provide basic info
        extractedText = `Document Analysis:\n\nDocument Type: ${fileType || 'Unknown'}\nFile Size: ${Math.round(fileBuffer.byteLength / 1024)} KB\n\nNote: Document has been uploaded successfully and can be referenced by AI agents.`;
        console.log('Generic document processed');
      }

      // Perform AI analysis if we have OpenAI key and valid content
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      console.log('OpenAI API Key available:', !!openAIApiKey);
      
      if (openAIApiKey && extractedText.length > 100) {
        try {
          console.log('Starting AI analysis...');
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
                 content: 'You are an expert document analyzer. Provide a comprehensive analysis that includes: 1) Executive Summary (brief overview), 2) Key Points and Topics (main themes), 3) Important Data/Numbers (if any), 4) Actionable Insights (practical takeaways), 5) Potential Applications (how this could be used). Format your response clearly with headers and bullet points.' 
               },
               { 
                 role: 'user', 
                 content: `Please analyze this document thoroughly:\n\n${extractedText.substring(0, 4000)}` 
               }
             ],
             max_tokens: 1000,
             temperature: 0.3,
           }),
          });

          console.log('OpenAI API response status:', analysisResponse.status);
          
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            analysisResult = analysisData.choices[0].message.content;
            console.log('AI analysis completed successfully');
            
            // Combine original content with analysis
            extractedText = `${extractedText}\n\n${'='.repeat(50)}\n🤖 AI ANALYSIS\n${'='.repeat(50)}\n\n${analysisResult}`;
          } else {
            const errorData = await analysisResponse.text();
            console.error('OpenAI API error:', analysisResponse.status, errorData);
            // Continue with just the extracted text
          }
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          // Continue without analysis if it fails
        }
      } else {
        console.log('Skipping AI analysis - no API key or insufficient content');
        if (!openAIApiKey) {
          extractedText += '\n\n📝 Note: AI analysis is not available. Configure OpenAI API key for enhanced document insights.';
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
      console.error('Error details:', {
        message: processingError.message,
        stack: processingError.stack,
        documentId,
        fileType,
        fileUrl
      });
      
      // Update document with a more helpful error message
      const errorMessage = `Document Processing Error\n\nThe document was uploaded successfully but encountered an issue during processing.\n\nTechnical Details:\n- Document ID: ${documentId}\n- File Type: ${fileType}\n- Error: ${processingError.message}\n\nThe document file is still available and can be downloaded. You may try uploading again or contact support if the issue persists.`;
      
      await supabase
        .from('documents')
        .update({
          content: errorMessage,
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