// Helper function for enhanced Google API mock responses
export function generateEnhancedGoogleMockResponse(service: string, toolName: string, parameters: any) {
  const timestamp = new Date().toISOString();
  
  switch (service) {
    case 'search':
      if (toolName === 'web_search') {
        return {
          success: true,
          items: [
            {
              title: `Enhanced Google Search: ${parameters.query}`,
              link: 'https://example.com/enhanced-result',
              snippet: `Comprehensive search results for "${parameters.query}" with AI-powered relevance ranking and real-time data integration.`,
              displayLink: 'example.com',
              formattedUrl: 'https://example.com/enhanced-result',
              pagemap: {
                cse_thumbnail: [{
                  src: 'https://example.com/thumbnail.jpg',
                  width: '225',
                  height: '225'
                }]
              }
            },
            {
              title: `${parameters.query} - Advanced Guide & Best Practices`,
              link: 'https://bestpractices.com/guide',
              snippet: `Expert insights and comprehensive guide for ${parameters.query} with industry standards and implementation examples.`,
              displayLink: 'bestpractices.com'
            }
          ],
          searchInformation: {
            totalResults: '145000000',
            searchTime: 0.28,
            formattedTotalResults: '145,000,000',
            formattedSearchTime: '0.28'
          },
          context: {
            title: 'Enhanced Google Search',
            totalResults: '145000000'
          }
        };
      } else if (toolName === 'image_search') {
        return {
          success: true,
          items: [
            {
              title: `${parameters.query} - High Quality Image`,
              link: 'https://example.com/image1.jpg',
              displayLink: 'example.com',
              snippet: `Professional ${parameters.query} image`,
              image: {
                contextLink: 'https://example.com/context1',
                height: 1080,
                width: 1920,
                byteSize: 245760,
                thumbnailLink: 'https://example.com/thumb1.jpg',
                thumbnailHeight: 150,
                thumbnailWidth: 267
              }
            }
          ],
          searchInformation: {
            totalResults: '5420000',
            searchTime: 0.15
          }
        };
      }
      break;
      
    case 'calendar':
      if (toolName === 'create_event') {
        return {
          success: true,
          event: {
            id: 'event_' + Date.now(),
            summary: parameters.summary || 'New Event',
            start: { 
              dateTime: parameters.startTime || new Date().toISOString(),
              timeZone: 'America/Los_Angeles'
            },
            end: { 
              dateTime: parameters.endTime || new Date(Date.now() + 3600000).toISOString(),
              timeZone: 'America/Los_Angeles'
            },
            description: parameters.description || 'Created via MCP Google Calendar integration',
            status: 'confirmed',
            htmlLink: 'https://calendar.google.com/event?eid=example',
            created: timestamp,
            updated: timestamp,
            creator: {
              email: 'user@example.com',
              displayName: 'MCP User'
            }
          }
        };
      } else if (toolName === 'list_events') {
        return {
          success: true,
          items: [
            {
              id: 'event1_' + Date.now(),
              summary: 'Team Meeting',
              start: { dateTime: new Date().toISOString() },
              end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
              status: 'confirmed',
              attendees: [
                { email: 'user1@example.com', responseStatus: 'accepted' },
                { email: 'user2@example.com', responseStatus: 'tentative' }
              ]
            },
            {
              id: 'event2_' + Date.now(),
              summary: 'Project Review',
              start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
              end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
              status: 'confirmed'
            }
          ],
          timeZone: 'America/Los_Angeles',
          summary: 'Enhanced Calendar Events',
          updated: timestamp
        };
      }
      break;
      
    case 'gmail':
      if (toolName === 'send_email') {
        return {
          success: true,
          message: {
            id: 'msg_' + Date.now(),
            threadId: 'thread_' + Date.now(),
            labelIds: ['SENT'],
            snippet: `Email sent to ${parameters.to}: ${parameters.subject}`,
            payload: {
              headers: [
                { name: 'To', value: parameters.to },
                { name: 'Subject', value: parameters.subject },
                { name: 'From', value: 'user@example.com' }
              ]
            },
            sizeEstimate: parameters.body?.length || 0,
            historyId: Date.now().toString()
          }
        };
      } else if (toolName === 'read_emails') {
        return {
          success: true,
          messages: [
            {
              id: 'msg1_' + Date.now(),
              threadId: 'thread1',
              snippet: 'Enhanced email preview with AI-powered categorization...',
              payload: {
                headers: [
                  { name: 'Subject', value: 'Important Update' },
                  { name: 'From', value: 'sender@example.com' },
                  { name: 'Date', value: timestamp }
                ]
              },
              labelIds: ['INBOX', 'IMPORTANT'],
              sizeEstimate: 2048
            },
            {
              id: 'msg2_' + Date.now(),
              threadId: 'thread2',
              snippet: 'Weekly report with analytics and insights...',
              payload: {
                headers: [
                  { name: 'Subject', value: 'Weekly Report' },
                  { name: 'From', value: 'reports@company.com' },
                  { name: 'Date', value: timestamp }
                ]
              },
              labelIds: ['INBOX'],
              sizeEstimate: 4096
            }
          ],
          resultSizeEstimate: 2,
          nextPageToken: 'next_page_token_example'
        };
      }
      break;
      
    default:
      return {
        success: true,
        message: `Enhanced mock response for Google ${service} service`,
        tool: toolName,
        parameters: parameters,
        timestamp: timestamp,
        service_info: {
          name: `Google ${service}`,
          version: '3.0',
          status: 'active'
        }
      };
  }
  
  return {
    success: true,
    message: `Google ${service} tool executed successfully`,
    tool: toolName,
    parameters: parameters,
    timestamp: timestamp
  };
}