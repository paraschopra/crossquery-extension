document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('searchToggle');
    const summaryToggle = document.getElementById('summaryToggle');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
  
    // Load the toggle states and API key from Chrome storage
    chrome.storage.sync.get(['searchEnabled', 'summaryEnabled', 'openaiApiKey'], (data) => {
      searchToggle.checked = data.searchEnabled !== false; // default to true
      summaryToggle.checked = data.summaryEnabled !== false; // default to true
      apiKeyInput.value = data.openaiApiKey || ''; // Load the saved API key or use an empty string
    });
  
    // Save the search toggle state to Chrome storage when changed
    searchToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ searchEnabled: searchToggle.checked });
    });
  
    // Save the summary toggle state to Chrome storage when changed
    summaryToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ summaryEnabled: summaryToggle.checked });
    });
  
    // Save the API key to Chrome storage when the Save button is clicked
    saveApiKeyButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        alert('API key saved!');
      });
    });

    // Open the extension settings when the link is clicked
    const openSettingsLink = document.getElementById('openSettings');
    openSettingsLink.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
  });