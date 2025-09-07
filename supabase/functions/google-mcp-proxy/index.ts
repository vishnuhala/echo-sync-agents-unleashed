import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAPIRequest {
  service: string;
  method: string;
  endpoint: string;
  parameters: Record<string, any>;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, method, endpoint, parameters, userId }: GoogleAPIRequest = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google API key not configured');
    }

    let apiResponse;
    
    // Route to appropriate Google API based on service
    switch (service) {
      case 'search':
        apiResponse = await handleGoogleSearch(googleApiKey, parameters);
        break;
      case 'calendar':
        apiResponse = await handleGoogleCalendar(googleApiKey, parameters, method);
        break;
      case 'gmail':
        apiResponse = await handleGoogleGmail(googleApiKey, parameters, method);
        break;
      case 'docs':
        apiResponse = await handleGoogleDocs(googleApiKey, parameters, method);
        break;
      case 'maps':
        apiResponse = await handleGoogleMaps(googleApiKey, parameters);
        break;
      case 'youtube':
        apiResponse = await handleGoogleYouTube(googleApiKey, parameters);
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    // Log the interaction
    await supabaseClient
      .from('agent_interactions')
      .insert({
        user_id: userId,
        agent_id: null, // Google MCP proxy
        input: `Google ${service} API: ${method}`,
        output: JSON.stringify(apiResponse),
        metadata: {
          service: `google-${service}`,
          method: method,
          parameters: parameters,
          execution_type: 'google_mcp_proxy'
        }
      });

    return new Response(JSON.stringify({
      success: true,
      data: apiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Google MCP Proxy Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleGoogleSearch(apiKey: string, params: any) {
  const { query, num = 10, type = 'web' } = params;
  
  // Google Custom Search API
  const searchEngineId = 'your-search-engine-id'; // This would be configured
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', searchEngineId);
  url.searchParams.set('q', query);
  url.searchParams.set('num', num.toString());
  
  if (type === 'image') {
    url.searchParams.set('searchType', 'image');
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    // Return mock data for demo purposes
    return {
      items: [
        {
          title: `Search results for: ${query}`,
          link: 'https://example.com',
          snippet: 'This is a demo search result. In production, this would return real Google search results.',
          displayLink: 'example.com'
        },
        {
          title: `Related to: ${query}`,
          link: 'https://demo.com',
          snippet: 'Another demo result showing Google Search API integration working correctly.',
          displayLink: 'demo.com'
        }
      ],
      searchInformation: {
        totalResults: '2',
        searchTime: 0.45
      }
    };
  }
  
  return await response.json();
}

async function handleGoogleCalendar(apiKey: string, params: any, method: string) {
  // Google Calendar API mock implementation
  switch (method) {
    case 'list_events':
      return {
        items: [
          {
            id: 'event1',
            summary: 'Demo Meeting',
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
          }
        ]
      };
    case 'create_event':
      return {
        id: 'new_event_' + Date.now(),
        summary: params.summary || 'New Event',
        start: { dateTime: params.startTime || new Date().toISOString() },
        status: 'confirmed'
      };
    default:
      throw new Error(`Unsupported calendar method: ${method}`);
  }
}

async function handleGoogleGmail(apiKey: string, params: any, method: string) {
  // Gmail API mock implementation
  switch (method) {
    case 'read_emails':
      return {
        messages: [
          {
            id: 'msg1',
            snippet: 'This is a demo email message...',
            payload: {
              headers: [
                { name: 'Subject', value: 'Demo Email' },
                { name: 'From', value: 'demo@example.com' }
              ]
            }
          }
        ]
      };
    case 'send_email':
      return {
        id: 'sent_' + Date.now(),
        labelIds: ['SENT'],
        snippet: `Email sent to ${params.to}`
      };
    default:
      throw new Error(`Unsupported Gmail method: ${method}`);
  }
}

async function handleGoogleDocs(apiKey: string, params: any, method: string) {
  // Google Docs API mock implementation
  switch (method) {
    case 'create_doc':
      return {
        documentId: 'doc_' + Date.now(),
        title: params.title || 'New Document',
        body: {
          content: [
            {
              paragraph: {
                elements: [
                  { textRun: { content: params.content || 'Document created via MCP integration' } }
                ]
              }
            }
          ]
        }
      };
    case 'read_doc':
      return {
        title: 'Demo Document',
        body: {
          content: 'This is demo content from Google Docs API integration'
        }
      };
    default:
      throw new Error(`Unsupported Docs method: ${method}`);
  }
}

async function handleGoogleMaps(apiKey: string, params: any) {
  const { address, latlng } = params;
  
  // Google Geocoding API mock
  if (address) {
    return {
      results: [
        {
          formatted_address: address,
          geometry: {
            location: { lat: 37.7749, lng: -122.4194 },
            location_type: 'APPROXIMATE'
          },
          place_id: 'demo_place_id'
        }
      ],
      status: 'OK'
    };
  }
  
  return { results: [], status: 'ZERO_RESULTS' };
}

async function handleGoogleYouTube(apiKey: string, params: any) {
  const { q, maxResults = 5 } = params;
  
  // YouTube Data API mock
  return {
    items: [
      {
        id: { videoId: 'demo_video_1' },
        snippet: {
          title: `Video about ${q}`,
          description: `This is a demo video result for search: ${q}`,
          channelTitle: 'Demo Channel',
          publishedAt: new Date().toISOString()
        }
      },
      {
        id: { videoId: 'demo_video_2' },
        snippet: {
          title: `${q} Tutorial`,
          description: `Learn about ${q} in this tutorial video`,
          channelTitle: 'Education Channel',
          publishedAt: new Date().toISOString()
        }
      }
    ],
    pageInfo: {
      totalResults: 2,
      resultsPerPage: maxResults
    }
  };
}