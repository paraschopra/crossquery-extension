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
          const html = await response.text();
  
          console.log('Sending HTML response to content script');
          console.log(html);
          sendResponse({ html });
        } catch (error) {
          console.error('Error:', error);
          sendResponse({ html: null });
        }
      }
  
      performSearch();
  
      return true;
    }
  });