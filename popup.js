document.addEventListener('DOMContentLoaded', () => {
    const searchToggle = document.getElementById('searchToggle');

    // Load the toggle state from Chrome storage
    chrome.storage.sync.get('searchEnabled', (data) => {
        searchToggle.checked = data.searchEnabled !== false; // default to true
    });

    // Save the toggle state to Chrome storage when changed
    searchToggle.addEventListener('change', () => {
        chrome.storage.sync.set({ searchEnabled: searchToggle.checked });
    });
});