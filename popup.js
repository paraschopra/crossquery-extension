document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.getElementById('searchToggle');
  const summaryToggle = document.getElementById('summaryToggle');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const groqApiKeyInput = document.getElementById('groqApiKey');
  const groqModelSelect = document.getElementById('groqModel');
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const geminiModelSelect = document.getElementById('geminiModel');
  const aiSelectionRadios = document.querySelectorAll('input[name="aiSelection"]');
  const saveSettingsButton = document.getElementById('saveSettings');

  // Load saved settings from Chrome storage
  chrome.storage.sync.get(
    [
      'searchEnabled',
      'summaryEnabled',
      'openaiApiKey',
      'groqApiKey',
      'groqModel',
      'geminiApiKey',
      'geminiModel',
      'aiSelection',
    ],
    (data) => {
      // Toggle states
      searchToggle.checked = data.searchEnabled !== false;
      summaryToggle.checked = data.summaryEnabled !== false;

      // API keys
      openaiApiKeyInput.value = data.openaiApiKey || '';
      groqApiKeyInput.value = data.groqApiKey || '';
      geminiApiKeyInput.value = data.geminiApiKey || '';

      // Model selection
      groqModelSelect.value = data.groqModel || 'llama3-8b-8192';
      geminiModelSelect.value = data.geminiModel || 'gemini-1.5-flash';

      // AI selection
      document.querySelector(`input[name="aiSelection"][value="${data.aiSelection || 'openai'}"]`).checked = true;
    }
  );

  // Save the settings when Save button is clicked
  saveSettingsButton.addEventListener('click', () => {
    const searchEnabled = searchToggle.checked;
    const summaryEnabled = summaryToggle.checked;

    // Get selected AI and corresponding settings
    const aiSelection = document.querySelector('input[name="aiSelection"]:checked').value;
    const openaiApiKey = openaiApiKeyInput.value.trim();
    const groqApiKey = groqApiKeyInput.value.trim();
    const groqModel = groqModelSelect.value;
    const geminiApiKey = geminiApiKeyInput.value.trim();
    const geminiModel = geminiModelSelect.value;

    console.log("my gemini APi key is  in popup.js ", geminiApiKey);
    // Save settings to Chrome storage
    chrome.storage.sync.set(
      {
        searchEnabled,
        summaryEnabled,
        aiSelection,
        openaiApiKey,
        groqApiKey,
        groqModel,
        geminiApiKey,
        geminiModel,
      },
      () => {
        alert('Settings saved!');
      }
    );
  });
  const openSettingsLink = document.getElementById('openSettings');
  openSettingsLink.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
  });

});
