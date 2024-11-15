document.addEventListener('DOMContentLoaded', () => {
    const websitesTextarea = document.getElementById('websites');
    const apiKeyInput = document.getElementById('apiKey');
    const searchToggle = document.getElementById('searchToggle');
    const summaryToggle = document.getElementById('summaryToggle');
    const saveButton = document.getElementById('save');
    const openaiRadio = document.getElementById('openaiRadio');
    const geminiRadio = document.getElementById('geminiRadio');
  
    // Load saved settings from Chrome storage
    chrome.storage.sync.get(['preferredWebsites', 'openaiApiKey', 'searchEnabled', 'summaryEnabled', 'apiProvider'], (data) => {
      const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
      websitesTextarea.value = websites.join('\n');
      apiKeyInput.value = data.openaiApiKey || '';
      searchToggle.checked = data.searchEnabled !== false; // default to true
      summaryToggle.checked = data.summaryEnabled !== false; // default to true
      const apiProvider = data.apiProvider || 'gemini';
      if (apiProvider === 'openai') {
        openaiRadio.checked = true;
      } else {
        geminiRadio.checked = true;
      }
    });
  
    saveButton.addEventListener('click', () => {
      const websites = websitesTextarea.value.split('\n').map(website => website.trim());
      const apiKey = apiKeyInput.value.trim();
      const searchEnabled = searchToggle.checked;
      const summaryEnabled = summaryToggle.checked;
      const apiProvider = openaiRadio.checked ? 'openai' : 'gemini';
  
      // Save settings to Chrome storage
      chrome.storage.sync.set({
        preferredWebsites: websites,
        openaiApiKey: apiKey,
        searchEnabled,
        summaryEnabled,
        apiProvider
      }, () => {
        alert('Settings saved!');
      });
    });
  });