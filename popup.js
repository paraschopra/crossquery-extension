document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('searchToggle');
    const summaryToggle = document.getElementById('summaryToggle');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const openaiRadio = document.getElementById('openaiRadio');
    const geminiRadio = document.getElementById('geminiRadio');
    const claudeRadio = document.getElementById('claudeRadio');
  
    // Load the toggle states and API key from Chrome storage
    chrome.storage.sync.get(['searchEnabled', 'summaryEnabled', 'openaiApiKey', 'claudeApiKey', 'apiProvider'], (data) => {
      searchToggle.checked = data.searchEnabled !== false; // default to true
      summaryToggle.checked = data.summaryEnabled !== false; // default to true
      apiKeyInput.value = data.openaiApiKey || ''; // Load the saved API key or use an empty string
      const apiProvider = data.apiProvider || 'gemini';
      if (apiProvider === 'openai') {
        openaiRadio.checked = true;
        apiKeyInput.value = data.openaiApiKey || '';
      } else if (apiProvider === 'claude') {
        claudeRadio.checked = true;
        apiKeyInput.value = data.claudeApiKey || '';
      } else {
        geminiRadio.checked = true;
        apiKeyInput.value = data.openaiApiKey || '';
      }
    });

    // Update API key input when radio buttons change
    openaiRadio.addEventListener('change', () => {
      chrome.storage.sync.get(['openaiApiKey'], (data) => {
        apiKeyInput.value = data.openaiApiKey || '';
      });
    });

    claudeRadio.addEventListener('change', () => {
      chrome.storage.sync.get(['claudeApiKey'], (data) => {
        apiKeyInput.value = data.claudeApiKey || '';
      });
    });

    geminiRadio.addEventListener('change', () => {
      chrome.storage.sync.get(['openaiApiKey'], (data) => {
        apiKeyInput.value = data.openaiApiKey || '';
      });
    });
  
    // Save the search toggle state to Chrome storage when changed
    searchToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ searchEnabled: searchToggle.checked });
    });
  
    // Save the summary toggle state to Chrome storage when changed
    summaryToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ summaryEnabled: summaryToggle.checked });
    });
  
    // Save the API key and provider when the Save button is clicked
    saveApiKeyButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      let apiProvider;
      let keyToSave = {};

      if (openaiRadio.checked) {
        apiProvider = 'openai';
        keyToSave = { openaiApiKey: apiKey };
      } else if (claudeRadio.checked) {
        apiProvider = 'claude';
        keyToSave = { claudeApiKey: apiKey };
      } else {
        apiProvider = 'gemini';
        keyToSave = { openaiApiKey: apiKey };
      }

      chrome.storage.sync.set({ ...keyToSave, apiProvider }, () => {
        alert('API key and provider saved!');
      });
    });

    // Open the extension settings when the link is clicked
    const openSettingsLink = document.getElementById('openSettings');
    openSettingsLink.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
  });