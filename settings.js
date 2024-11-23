document.addEventListener('DOMContentLoaded', () => {
  const websitesTextarea = document.getElementById('websites');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const groqApiKeyInput = document.getElementById('groqApiKey');
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const searchToggle = document.getElementById('searchToggle');
  const summaryToggle = document.getElementById('summaryToggle');
  const saveButton = document.getElementById('save');
  const aiSelectionRadios = document.querySelectorAll('input[name="aiSelection"]');
  const openaiOptions = document.getElementById('openaiOptions');
  const groqOptions = document.getElementById('groqOptions');
  const geminiOptions = document.getElementById('geminiOptions');
  const groqModelSelect = document.getElementById('groqModel');
  const geminiModelSelect = document.getElementById('geminiModel');

  // Load saved settings from Chrome storage
  chrome.storage.sync.get(
    ['preferredWebsites', 'openaiApiKey', 'groqApiKey', 'geminiApiKey', 'searchEnabled', 'summaryEnabled', 'aiSelection', 'groqModel', 'geminiModel'],
    (data) => {
      const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
      const openaiApiKey = data.openaiApiKey || '';
      const groqApiKey = data.groqApiKey || '';
      const geminiApiKey = data.geminiApiKey || '';
      const searchEnabled = data.searchEnabled !== false; 
      const summaryEnabled = data.summaryEnabled !== false;
      const aiSelection = data.aiSelection || 'openai';
      const groqModel = data.groqModel || 'llama3-8b-8192';
      const geminiModel = data.geminiModel || 'gemini-1.5-flash';

      websitesTextarea.value = websites.join('\n');
      openaiApiKeyInput.value = openaiApiKey;
      groqApiKeyInput.value = groqApiKey;
      geminiApiKeyInput.value = geminiApiKey;
      searchToggle.checked = searchEnabled;
      summaryToggle.checked = summaryEnabled;
      document.querySelector(`input[name="aiSelection"][value="${aiSelection}"]`).checked = true;
      openaiOptions.style.display = aiSelection === 'openai' ? 'block' : 'none';
      groqOptions.style.display = aiSelection === 'groq' ? 'block' : 'none';
      geminiOptions.style.display = aiSelection === 'gemini' ? 'block' : 'none';
      groqModelSelect.value = groqModel;
      geminiModelSelect.value = geminiModel;
    }
  );

  aiSelectionRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedAI = radio.value;
      openaiOptions.style.display = selectedAI === 'openai' ? 'block' : 'none';
      groqOptions.style.display = selectedAI === 'groq' ? 'block' : 'none';
      geminiOptions.style.display = selectedAI === 'gemini' ? 'block' : 'none';
    });
  });

  saveButton.addEventListener('click', () => {
    const websites = websitesTextarea.value.split('\n').map((website) => website.trim());
    const openaiApiKey = openaiApiKeyInput.value.trim();
    const groqApiKey = groqApiKeyInput.value.trim();
    const geminiApiKey = geminiApiKeyInput.value.trim();
    const searchEnabled = searchToggle.checked;
    const summaryEnabled = summaryToggle.checked;
    const aiSelection = document.querySelector('input[name="aiSelection"]:checked').value;
    const groqModel = groqModelSelect.value;
    const geminiModel = geminiModelSelect.value;

    // Save settings to Chrome storage
    console.log("my gemini APi key is ", geminiApiKey);
    chrome.storage.sync.set(
      {
        preferredWebsites: websites,
        openaiApiKey,
        groqApiKey,
        geminiApiKey,
        searchEnabled,
        summaryEnabled,
        aiSelection,
        groqModel,
        geminiModel,
      },
      () => {
        alert('Settings saved!');
      }
    );
  });
});
