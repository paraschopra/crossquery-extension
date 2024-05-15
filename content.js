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

async function summarizeResults_old(results, searchQuery) {
    const titles = results.map(result => result.title).join('\n');
    const snippets = results.map(result => result.description).join('\n');

    let snippet = '';
    let i =1;

    results.forEach(result => {
        snippet += `<${i++}> ${result.title}: ${result.description}\n`;
    });


    const prompt = `You will be given search results from discussion forums like reddit in the format:
    <result-index> result-title: result-description
    
    You need to summarize the search results and cite relevant results inline like this <result-index>. Your summary needs to be simple, useful and direct. Assume summary is all that a user has access to. So don't do an academic job of summarizing, rather try to help.
    
    IMPORTANT: get straight to the point. Don't say "search results say.."
    
    Search query: ${searchQuery}

    ${snippet}
    `;

    //const prompt = `Please summarize the following search results:\n\n${snippet}`;

    console.log(prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer KEY'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let summary = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                    return summary;
                }
                try {
                    const { choices } = JSON.parse(data);
                    const { delta } = choices[0];
                    if (delta.content) {
                        summary += delta.content;
                        updateSummary(summary);
                    }
                } catch (error) {
                    console.error('Error parsing API response:', error);
                }
            }
        }
    }
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