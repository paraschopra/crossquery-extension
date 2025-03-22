// TODO
// Remove key
// Make it work on ChatGPT and Claude too? (Transform initial query to search)
// For example, it could use Hacker News for tech-related searches and switch to Twitter for political discussions. That way, it would align perfectly with the content type and offer even more targeted insights!
// Give a subset of sites to choose from
// perhaps user providing a list of websites and in what context they prefer them could be a good addition
// making it moveable/sticky will help

const isLocal = true; // make it true when testing localhost server, on production false
let isDarkMode = false;
let linkColorDark = '#99c3ff';
let linkColorLight = 'blue';

function applyDarkModeStyles() {
    const sidebar = document.getElementById('custom-sidebar');
    if (!sidebar) return;

    //console.log("Dark moade");
    isDarkMode = true;

    sidebar.style.backgroundColor = '#333';
    sidebar.style.color = '#fff';
    sidebar.style.border = '1px solid #444';

    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = '#99c3ff';
    });

    const madeBySection = sidebar.querySelector('div');
    if (madeBySection) {
        madeBySection.style.color = '#bbb';
    }
}

function applyLightModeStyles() {
    const sidebar = document.getElementById('custom-sidebar');
    if (!sidebar) return;

    //console.log("Light mode");

    isDarkMode = false;

    sidebar.style.backgroundColor = '#fafafa';
    sidebar.style.color = '#4d5156';
    sidebar.style.border = '1px solid #ccc';

    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = 'blue';
    });

    const madeBySection = sidebar.querySelector('div');
    if (madeBySection) {
        madeBySection.style.color = '#888';
    }
}

function applyColorScheme()
{
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeMediaQuery.matches) {
        applyDarkModeStyles();
    } else {
        applyLightModeStyles();
    }
}

function detectColorScheme() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeMediaQuery.matches) {
        applyDarkModeStyles();
    } else {
        applyLightModeStyles();
    }

    darkModeMediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
            applyDarkModeStyles();
        } else {
            applyLightModeStyles();
        }
    });
}

function isSearchEnabled() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('searchEnabled', (data) => {
            //console.log("Search enabled", data.searchEnabled);
            resolve(data.searchEnabled !== false); // default to true if not set
        });
    });
}

function isSummaryEnabled() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('summaryEnabled', (data) => {
            //console.log("Summary enabled", data.summaryEnabled);
            resolve(data.summaryEnabled !== false); // default to true if not set
        });
    });
}

function returnOpenAIKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('openaiApiKey', (data) => {
            //console.log("Key found", data.openaiApiKey);
            resolve(data.openaiApiKey); // default to true if not set
        });
    });
}

function createSidebar() {
    console.log('[CrossQuery:UI] Creating sidebar');
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar';
    sidebar.style.position = 'absolute';
    sidebar.style.top = '150px';
    sidebar.style.right = '50px';
    sidebar.style.width = '400px';
    sidebar.style.padding = '10px';
    sidebar.style.backgroundColor = '#fafafa';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.zIndex = '127';
    sidebar.style.color = '#4d5156';
    sidebar.style.lineHeight = '1.3';
    sidebar.style.overflowY = 'auto';
    sidebar.style.height = 'fit-content';
    sidebar.style.opacity = '0.95';

    // Create the close button
const closeButton = document.createElement('button');
closeButton.innerText = '✖';
//closeButton.style.position = 'absolute';
//closeButton.style.top = '5px';
//closeButton.style.right = '5px';
closeButton.style.float = 'right';
closeButton.style.background = 'none';
closeButton.style.border = 'none';
closeButton.style.fontSize = '16px';
closeButton.style.cursor = 'pointer';

// Add event listener to close the sidebar
closeButton.addEventListener('click', () => {
    sidebar.style.display = 'none';
});

// Append the close button to the sidebar
sidebar.appendChild(closeButton);

    const websiteContainer = document.createElement('div');
    websiteContainer.id = 'website-container';
    websiteContainer.style.marginTop = '3px';
    
   
    sidebar.appendChild(websiteContainer);

    // Create the "TLDR from" heading
    //const tldrHeading = document.createElement('h3');
    //tldrHeading.textContent = 'Search++ TLDR of';
    //websiteContainer.appendChild(tldrHeading);

    // Populate website options from user preferences
    chrome.storage.sync.get('preferredWebsites', (data) => {
        console.log('[CrossQuery:UI] Loading preferred websites:', data.preferredWebsites);
        const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
        websites.forEach((website, index) => {
            const websiteLink = document.createElement('a');
            websiteLink.href = '#';
            websiteLink.textContent = website;
            websiteLink.addEventListener('click', async (event) => {
                event.preventDefault();
                const searchInput = document.querySelector('input[name="q"]');
                const searchQuery = searchInput.value;

                try {
                    console.log('[CrossQuery:Search] Initiating search:', { query: searchQuery, website });
                    hideSidebarStuff();
                    const response = await chrome.runtime.sendMessage({
                        action: 'performSearch',
                        query: searchQuery,
                        website: website
                    });
                    console.log('[CrossQuery:Search] Search response received');
                    unblurResults();
                    updateSidebarWithResponse(response);

                    // Remove highlighting from all website links
                    const allWebsiteLinks = websiteContainer.querySelectorAll('a');
                    allWebsiteLinks.forEach(link => {
                        link.style.fontWeight = 'normal';
                        link.style.textDecoration = 'underline';
                        link.style.color = isDarkMode ? linkColorDark : linkColorLight;
                    });

                    websiteLink.style.fontWeight = 'bold';
                    websiteLink.style.textDecoration = 'none';
                    websiteLink.style.color = isDarkMode ? "#fff" : "black";
                    websiteLink.style.cursor = 'pointer';
                    

                } catch (error) {
                    console.error('[CrossQuery:Search] Error during search:', error);
                }
            });

            websiteContainer.appendChild(websiteLink);

            if (index < websites.length - 1) {
                const separator = document.createTextNode(' | ');
                websiteContainer.appendChild(separator);
            }
            if (index === 0) {
                // Automatically click the first website link
                websiteLink.click();
            }
        });
    });

  
    const summaryElement = document.createElement('div');
    summaryElement.id = 'summary-element';
    summaryElement.style.boxSizing = 'border-box';
    summaryElement.style.fontSize = '17px';
    summaryElement.style.lineHeight = '1.58';
    const loaderText = document.createElement('p');
    loaderText.innerHTML = 'Loading..';
    summaryElement.appendChild(loaderText);
    sidebar.appendChild(summaryElement);

    // Add this CSS to your stylesheet or within a <style> tag in your HTML
const style = document.createElement('style');
style.innerHTML = `
.anchor-offset {
        
    scroll-margin-top: 70px;
}

`;
document.head.appendChild(style);

    
                    // Process the response and update the sidebar
                    // ...existing code...

  
    const resultsList = document.createElement('ul');
    resultsList.id = 'results-list';
    resultsList.style.listStyleType = 'none';
    sidebar.appendChild(resultsList);

    /*
    const insertIntoDiv = document.querySelector("div#rcnt");
    if(insertIntoDiv){
        sidebar.style.position = 'inherit';
        sidebar.style.zIndex = '0';
        sidebar.style.marginLeft = '25px';
        sidebar.style.marginTop = '25px';
        insertIntoDiv.appendChild(sidebar);
    } else {
        document.body.appendChild(sidebar);
    } */

    // Create the "Made by Paras" section
const madeBySection = document.createElement('div');
madeBySection.style.marginTop = '20px';
madeBySection.style.textAlign = 'center';
madeBySection.style.fontSize = '14px';
madeBySection.style.color = '#888';
madeBySection.innerHTML = `CrossQuery is made by <a href="https://x.com/paraschopra" target="_blank">@paraschopra</a>
<br/>For feedback, <a href="https://github.com/paraschopra/crossquery-extension/issues">raise an issue</a> or tweet to me
<br/><br/><em>AI generated summaries can contain errors</em>`;

// Append the "Made by Paras" section to the sidebar
sidebar.appendChild(madeBySection);

    // Append the sidebar to the document body
document.body.appendChild(sidebar);
  }

  function alertAddWebsites(){
    alert("To add more websites to search, go to extension options (by right clicking on the extension icon");
  }
  

  function hideSidebarStuff()
  {
    const resultsList = document.getElementById('results-list');
    const summaryElement = document.getElementById('summary-element');
    resultsList.style.filter = "blur(2px)";
    summaryElement.style.filter = "blur(2px)";
  }

  function unblurResults()
  {
    const resultsList = document.getElementById('results-list');
    resultsList.style.filter = "blur(0px)";
  }

  function unblurSummary()
  {
  
    const summaryElement = document.getElementById('summary-element');
    summaryElement.style.filter = "blur(0px)";
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
            <a id="result-${i}" class="anchor-offset" name="result-${i}"></a>
            <span style='font-size: 16px;'>[${i++}] <a href="${result.link}" style="color: ${isDarkMode ? linkColorDark : linkColorLight}; font-weight: 600" target="_blank">${result.title}</a></span>
          <p style="margin-top:5px">${result.description}</p>
        `;
            resultsList.appendChild(listItem);
        });
    }
}

function updateSummary(summary) {
    unblurSummary();
    const summaryElement = document.getElementById('summary-element');
    const summaryReplaced = summary.replace(/<(\d+(?:\s*,\s*\d+)*)>/g, (match, numbers) => {
        return numbers.split(',')
            .map(num => num.trim())
            .map(num => `<a style="color: ${isDarkMode ? linkColorDark : linkColorLight};" href="#result-${num}">[${num}]</a>`)
            .join(' ');
    });
    if (summaryElement) {
        summaryElement.innerHTML = `
        <p>${summaryReplaced}</p>
      `;
    }
}

function parseSearchResults(html) {
    console.log('[CrossQuery:Parser] Starting to parse search results');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Updated selectors to match Google's latest structure
    const searchResults = doc.querySelectorAll('div[data-header-feature], div[data-content-feature], div.g, div[jscontroller][data-sokoban-container], div[data-snc]');
    console.log('[CrossQuery:Parser] Found search result elements:', searchResults.length);
    
    const results = Array.from(searchResults).map(result => {
        // Try multiple possible selectors for title and link
        const titleElement = 
            result.querySelector('h3') || 
            result.querySelector('[role="heading"]') ||
            result.querySelector('a > h3') ||
            result.querySelector('div[role="heading"]');

        const linkElement = 
            result.querySelector('a[ping]') ||
            result.querySelector('a[data-ved]') ||
            result.querySelector('div[data-snc] > a') ||
            result.querySelector('a[href]:not([href="#"])');

        // Try multiple possible selectors for description
        const descriptionElement = 
            result.querySelector('div[data-content-feature="1"]') ||
            result.querySelector('div.VwiC3b') ||
            result.querySelector('div[style*="webkit-line-clamp"]') ||
            result.querySelector('div[data-sncf="1"]') ||
            result.querySelector('div[data-snf="nke7rc"]');
        
        if (!titleElement || !linkElement) {
            console.log('[CrossQuery:Parser] Skipping result - missing title or link', {
                hasTitle: !!titleElement,
                hasLink: !!linkElement
            });
            return null;
        }

        const title = titleElement.textContent.trim();
        const link = linkElement.href;
        const description = descriptionElement ? descriptionElement.textContent.trim() : '';

        // Log successful parsing of each result
        console.log('[CrossQuery:Parser] Successfully parsed result:', {
            title: title.substring(0, 50) + '...',
            hasDescription: !!description
        });

        return { title, link, description };
    }).filter(result => result !== null);

    console.log('[CrossQuery:Parser] Successfully parsed results:', results.length);
    return results;
}

async function updateSidebarWithResponse(response, searchQuery) {
    console.log('[CrossQuery:UI] Updating sidebar with response');
    if (response && response.html) {
        const results = parseSearchResults(response.html);

        if (results.length === 0) {
            console.log('[CrossQuery:UI] No results found');
            updateSidebar([]);
            updateSummary('No results found.');
            return;
        }

        console.log('[CrossQuery:UI] Updating sidebar with results:', results.length);
        updateSidebar(results);

        console.log('[CrossQuery:UI] Generating summary');
        const summary = await summarizeResults(results, searchQuery);
    } else {
        console.log('[CrossQuery:UI] No HTML in response');
    }
}

async function getApiProvider() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('apiProvider', (data) => {
            resolve(data.apiProvider || 'gemini');
        });
    });
}

async function summarizeResults(results, searchQuery) {
    console.log('[CrossQuery:Summary] Starting summarization');
    if (!summaryEnabled) {
        console.log('[CrossQuery:Summary] Summary disabled');
        updateSummary('');
        return;
    }

    const apiKey = openaiApiKey;

    if (!apiKey) {
        console.log('[CrossQuery:Summary] No API key found');
        updateSummary('<strong>Add your API key to summarize results</strong> by clicking on the extension icon.');
        return;
    }
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
    ${snippet}`;

    const apiProvider = await getApiProvider();
    try {
        let summary = '';
        if (apiProvider === 'openai') {
            // OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0,
                    stream: true,
                }),
            });

            if (!response.ok) {
                updateSummary('Either your OpenAI credits are exhausted or you have entered the wrong OpenAI token');
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            unblurSummary();
                            return;
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
        } else {
            // Gemini API
            console.log('[CrossQuery:Summary] Sending message to background for Gemini API');
            chrome.runtime.sendMessage({
                action: 'generateContent',
                apiKey: apiKey,
                model: 'gemini-2.0-flash-lite-preview-02-05',
                prompt: prompt
            }, (response) => {
                if (response.error) {
                    console.error('[CrossQuery:Summary] Error from background:', response.error);
                    updateSummary('Error generating summary. Please check your API key and try again.');
                } else {
                    console.log('[CrossQuery:Summary] Received summary from background');
                    updateSummary(response.summary);
                }
            });

        }
    } catch (error) {
        console.error('[CrossQuery:Summary] Error during summarization:', error);
        updateSummary('Error generating summary. Please check your API key and try again.');
    }
}

let openaiApiKey = '';
let summaryEnabled = true;


window.addEventListener('load', async () => {

    const searchEnabled = await isSearchEnabled();
                    if (!searchEnabled) {
                        console.log("Search disabled");
                        return;
                    }
    //console.log("Search enabled: ", searchEnabled);

    openaiApiKey = await returnOpenAIKey();
    //console.log("Key: ", openaiApiKey);

    summaryEnabled = await isSummaryEnabled();
    //console.log("Summary enabled: ", summaryEnabled);

    const urlParams = new URLSearchParams(window.location.search);
    const tbm = urlParams.get('tbm');
    const searchDiv = document.querySelector("div#search");
    if (!searchDiv) {
        console.log('Disabling sidebar on non-text search results page');
        return;
    }

    createSidebar(openaiApiKey);

    //console.log("Detecting color scheme");
    detectColorScheme();

    const searchInput = document.querySelector('input[name="q"]');
    const searchQuery = searchInput.value;

    //console.log('Sending search request to background.js');

    /*
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'performSearch',
            query: searchQuery,
            website: 'reddit.com'
        });

        updateSidebarWithResponse(response);
        //console.log('Received response from background.js:', response);
  
        
    } catch (error) {
        console.error('Error sending message to background.js:', error);
    }   */
});
