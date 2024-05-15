// TODO
// Remove key
// Make it work on ChatGPT and Claude too? (Transform initial query to search)
// For example, it could use Hacker News for tech-related searches and switch to Twitter for political discussions. That way, it would align perfectly with the content type and offer even more targeted insights!
// Give a subset of sites to choose from
// perhaps user providing a list of websites and in what context they prefer them could be a good addition
// making it moveable/sticky will help



let topResultUrl = null;

// sk-proj-nTz8yvpnXHd4rXfNb9dzT3BlbkFJl7IgRb1t4gup6Wea7BZV

function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '100px';
    sidebar.style.right = '50px';
    sidebar.style.width = '400px';
    sidebar.style.padding = '10px';
    sidebar.style.maxHeight = '90vh';
    sidebar.style.overflowY = 'auto';
    sidebar.style.backgroundColor = '#fafafa';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.zIndex = '9999';
    sidebar.style.color = '#4d5156';
    sidebar.style.lineHeight = '1.3';

    const summaryElement = document.createElement('div');
    summaryElement.id = 'summary-element';
    summaryElement.style.minHeight = '100px';
    summaryElement.style.boxSizing = 'border-box';
    summaryElement.style.fontSize = '17px';
    summaryElement.style.lineHeight = '1.58';
    sidebar.appendChild(summaryElement);

    const resultsList = document.createElement('ul');
    resultsList.id = 'results-list';
    resultsList.style.listStyleType = 'none';
    sidebar.appendChild(resultsList);

   



    document.body.appendChild(sidebar);
}


function updateSidebar(results) {
    const resultsList = document.getElementById('results-list');
    if (resultsList) {
        resultsList.innerHTML = '';
        let i=1;
        results.forEach(result => {
            const listItem = document.createElement('li');
            listItem.style.marginTop = '10px';
            listItem.innerHTML = `
            <a name="result-${i}"></a>
            <span style='font-size: 16px;'>[${i++}] <a href="${result.link}" style="color: #1a0dab; font-weight: 600" target="_blank">${result.title}</a></span>
          <p style="margin-top:5px">${result.description}</p>
        `;
            resultsList.appendChild(listItem);
        });
    }
}

function updateSummary(summary) {
    const summaryElement = document.getElementById('summary-element');
  const summaryReplaced = summary.replace(/<(\d+)>/g, (match, number) => {
    return `<a href="#result-${number}">[${number}]</a>`;
  });
    if (summaryElement) {
        summaryElement.innerHTML = `
        <h3>TLDR from Reddit</h3>
        <p>${summaryReplaced}</p>
      `;
    }
}

function parseSearchResults(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const searchResults = doc.querySelectorAll('.g');
    const results = Array.from(searchResults).map(result => {
        const titleElement = result.querySelector('h3');
        const linkElement = result.querySelector('a');
        const descriptionElement = result.querySelectorAll("span");
        console.log(descriptionElement);
        //const snippetElements = result.querySelectorAll('.g span:not([class])');

        const title = titleElement ? titleElement.textContent : '';
        const link = linkElement ? linkElement.href : '';
        
        const description = (descriptionElement.length!=0) ? descriptionElement[descriptionElement.length-1].textContent : '';

        return { title, link, description };
    });

    return results;
}

async function summarizeResults(results, searchQuery) {
    const response = await fetch('http://localhost:4000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ searchQuery, results })
    });
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let summary = '';
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      summary += chunk;
      updateSummary(summary);
    }
  
    return summary;
  }

window.addEventListener('load', async () => {
    createSidebar();

    const searchInput = document.querySelector('input[name="q"]');
    const searchQuery = searchInput.value;

    console.log('Sending search request to background.js');

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'performSearch',
            query: searchQuery
        });

        console.log('Received response from background.js:', response);
        if (response && response.html) {
            const html = response.html;
            console.log('Parsing search results');
            const results = parseSearchResults(html);
            console.log('Search results:', results);
            updateSidebar(results);

            console.log('Summarizing search results');
            const summary = await summarizeResults(results, searchQuery);
            console.log('Summary:', summary);
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error sending message to background.js:', error);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTopResult') {
        console.log('Received request for top result URL');
        sendResponse({ resultUrl: topResultUrl });
    }
});