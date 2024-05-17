document.addEventListener('DOMContentLoaded', () => {
    const websitesTextarea = document.getElementById('websites');
    const saveButton = document.getElementById('save');

    // Load saved websites from Chrome storage
    chrome.storage.sync.get('preferredWebsites', (data) => {
        const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
        websitesTextarea.value = websites.join('\n');
    });

    saveButton.addEventListener('click', () => {
        const websites = websitesTextarea.value.split('\n').map(website => website.trim());
        chrome.storage.sync.set({ preferredWebsites: websites }, () => {
            alert('Settings saved!');
        });
    });
});