document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getTopResult' }, response => {
      if (response && response.resultUrl) {
        const resultUrlElement = document.getElementById('resultUrl');
        resultUrlElement.textContent = response.resultUrl;
      } else {
        const resultUrlElement = document.getElementById('resultUrl');
        resultUrlElement.textContent = 'No results found.';
      }
    });
  });
});