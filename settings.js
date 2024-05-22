document.addEventListener('DOMContentLoaded', () => {
    const websitesTextarea = document.getElementById('websites');
    const apiKeyInput = document.getElementById('apiKey');
    const searchToggle = document.getElementById('searchToggle');
    const summaryToggle = document.getElementById('summaryToggle');
    const saveButton = document.getElementById('save');
  
    // Load saved settings from Chrome storage
    chrome.storage.sync.get(['preferredWebsites', 'openaiApiKey', 'searchEnabled', 'summaryEnabled'], (data) => {
      const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
      websitesTextarea.value = websites.join('\n');
      apiKeyInput.value = data.openaiApiKey || '';
      searchToggle.checked = data.searchEnabled !== false; // default to true
      summaryToggle.checked = data.summaryEnabled !== false; // default to true
    });
  
    saveButton.addEventListener('click', () => {
      const websites = websitesTextarea.value.split('\n').map(website => website.trim());
      const apiKey = apiKeyInput.value.trim();
      const searchEnabled = searchToggle.checked;
      const summaryEnabled = summaryToggle.checked;
  
      // Save settings to Chrome storage
      chrome.storage.sync.set({
        preferredWebsites: websites,
        openaiApiKey: apiKey,
        searchEnabled,
        summaryEnabled
      }, () => {
        alert('Settings saved!');
      });
    });
  });