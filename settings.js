document.addEventListener('DOMContentLoaded', () => {
    const websitesTextarea = document.getElementById('websites');
    const apiKeyInput = document.getElementById('apiKey');
    const searchToggle = document.getElementById('searchToggle');
    const summaryToggle = document.getElementById('summaryToggle');
    const saveButton = document.getElementById('save');
    const openaiRadio = document.getElementById('openaiRadio');
    const geminiRadio = document.getElementById('geminiRadio');
    const claudeRadio = document.getElementById('claudeRadio');
  
    // Load saved settings from Chrome storage
    chrome.storage.sync.get(['preferredWebsites', 'openaiApiKey', 'claudeApiKey', 'searchEnabled', 'summaryEnabled', 'apiProvider'], (data) => {
      const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
      websitesTextarea.value = websites.join('\n');
      searchToggle.checked = data.searchEnabled !== false; // default to true
      summaryToggle.checked = data.summaryEnabled !== false; // default to true
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
  
    saveButton.addEventListener('click', () => {
      const websites = websitesTextarea.value.split('\n').map(website => website.trim());
      const apiKey = apiKeyInput.value.trim();
      const searchEnabled = searchToggle.checked;
      const summaryEnabled = summaryToggle.checked;
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
  
      // Save settings to Chrome storage
      chrome.storage.sync.set({
        preferredWebsites: websites,
        ...keyToSave,
        searchEnabled,
        summaryEnabled,
        apiProvider
      }, () => {
        alert('Settings saved!');
      });
    });
  });