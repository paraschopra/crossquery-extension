chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'performSearch') {
      const searchQuery = message.query;
      const website = message.website;
      //const modifiedQuery = `${searchQuery} (site:ycombinator.com OR site:reddit.com)`;
      const modifiedQuery = `${searchQuery} site:${website}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(modifiedQuery)}`;
  
      //console.log('Received search request:', message);
  
      async function performSearch() {
        try {
          const response = await fetch(searchUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          
          const html = await response.text();
  
          console.log('Sending HTML response to content script');
          // Don't log the entire HTML as it's too large
          console.log('HTML size:', html.length);
          sendResponse({ html });
        } catch (error) {
          console.error('Error:', error);
          sendResponse({ error: error.message, html: null });
        }
      }
  
      performSearch();
  
      return true;
    }
  });