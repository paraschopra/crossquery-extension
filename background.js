import {GoogleGenerativeAI} from './dist/geneartive-ai-bundle.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'performSearch') {
      console.log('[CrossQuery:Background] Search request received:', { query: message.query, website: message.website });
      const searchQuery = message.query;
      const website = message.website;
      //const modifiedQuery = `${searchQuery} (site:ycombinator.com OR site:reddit.com)`;
      const modifiedQuery = `${searchQuery} site:${website}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(modifiedQuery)}&hl=en`;
  
      console.log('[CrossQuery:Background] Fetching from URL:', searchUrl);
  
      async function performSearch() {
        try {
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (!response.ok) {
            console.error('[CrossQuery:Background] Search request failed:', response.status, response.statusText);
            sendResponse({ html: null });
            return;
          }

          const html = await response.text();
          console.log('[CrossQuery:Background] Search response received, length:', html.length);
          
          if (html.includes('detected unusual traffic') || html.includes('CAPTCHA')) {
            console.error('[CrossQuery:Background] Google detected unusual traffic');
            sendResponse({ html: null, error: 'Google detected unusual traffic. Please try again later.' });
            return;
          }

          sendResponse({ html });
        } catch (error) {
          console.error('[CrossQuery:Background] Search error:', error);
          sendResponse({ html: null });
        }
      }
  
      performSearch();
  
      return true;
    } else if (message.action === 'generateContent') {
        console.log('[CrossQuery:Background] Generate content request received');
        const genAI = new GoogleGenerativeAI(message.apiKey);
        const model = genAI.getGenerativeModel({ model: message.model });
        model.generateContent(message.prompt).then(result => {
            console.log('[CrossQuery:Background] Sending generated content back to content script');
            sendResponse({ summary: result.response.text() });
        }).catch(error => {
            console.error('[CrossQuery:Background] Error generating content:', error);
            sendResponse({ error: error.message });
        });
        return true; // Keep the message channel open for async response
    }
});