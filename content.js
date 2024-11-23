// TODO
// Remove key
// Make it work on ChatGPT and Claude too? (Transform initial query to search)
// For example, it could use Hacker News for tech-related searches and switch to Twitter for political discussions. That way, it would align perfectly with the content type and offer even more targeted insights!
// Give a subset of sites to choose from
// perhaps user providing a list of websites and in what context they prefer them could be a good addition
// making it moveable/sticky will help



const isLocal = false; // make it true when testing localhost server, on production false
let isDarkMode = false;
let linkColorDark = '#99c3ff';
let linkColorLight = 'blue';

function applyDarkModeStyles() {
    const sidebar = document.getElementById('custom-sidebar');
    if (!sidebar) return;

    isDarkMode = true;

    
    sidebar.style.backgroundColor = '#2c3e50'; 
    sidebar.style.color = '#ecf0f1'; 
    sidebar.style.border = '1px solid #34495e'; 

    
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = '#3498db'; 
    });

  
    const madeBySection = sidebar.querySelector('div');
    if (madeBySection) {
        madeBySection.style.color = '#bdc3c7'; 
    }
}


function applyLightModeStyles() {
    const sidebar = document.getElementById('custom-sidebar');
    if (!sidebar) return;

    isDarkMode = false;

    
    sidebar.style.backgroundColor = '#e5f6f0';
    sidebar.style.color = '#2c3e50';
    sidebar.style.border = '1px solid #ddd';

   
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = '#007bff'; 
    });

   
    const madeBySection = sidebar.querySelector('div');
    if (madeBySection) {
        madeBySection.style.color = '#888'; // Soft gray text for footer in light mode
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


function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar';
    sidebar.style.position = 'absolute';
    sidebar.style.top = '150px';
    sidebar.style.right = '50px';
    sidebar.style.width = '350px'; 
    sidebar.style.padding = '20px'; 
    sidebar.style.backgroundColor = '#ffffff'; 
    sidebar.style.borderRadius = '12px'; 
    sidebar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    sidebar.style.zIndex = '127';
    sidebar.style.color = '#333'; 
    sidebar.style.fontFamily = 'Arial, sans-serif'; 
    sidebar.style.lineHeight = '1.6'; 
    sidebar.style.overflowY = 'auto';
    sidebar.style.maxHeight = '80vh'; 
    sidebar.style.opacity = '0.95';
    sidebar.style.transition = 'opacity 0.3s ease'; 

    
    const closeButton = document.createElement('button');
    closeButton.innerText = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#888';
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.color = '#e74c3c'; 
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.color = '#888'; 
    });
    closeButton.addEventListener('click', () => {
        sidebar.style.display = 'none';
    });

    sidebar.appendChild(closeButton);

  
    const websiteContainer = document.createElement('div');
    websiteContainer.id = 'website-container';
    websiteContainer.style.marginTop = '20px';
    websiteContainer.style.fontSize = '16px'; 
    websiteContainer.style.color = '#555'; 
    sidebar.appendChild(websiteContainer);

    
    chrome.storage.sync.get('preferredWebsites', (data) => {
        const websites = data.preferredWebsites || ['reddit.com', 'ycombinator.com'];
        websites.forEach((website, index) => {
            const websiteLink = document.createElement('a');
            websiteLink.href = '#';
            websiteLink.textContent = website;
            websiteLink.style.display = 'inline-block';
            websiteLink.style.marginRight = '15px'; 
            websiteLink.style.color = '#4a90e2'; 
            websiteLink.style.fontWeight = 'normal';
            websiteLink.style.textDecoration = 'underline';
            websiteLink.style.transition = 'color 0.3s ease'; 
            websiteLink.addEventListener('mouseenter', () => {
                websiteLink.style.color = '#357ab8'; 
            });
            websiteLink.addEventListener('mouseleave', () => {
                websiteLink.style.color = '#4a90e2'; 
            });
            websiteLink.addEventListener('click', async (event) => {
                event.preventDefault();
                const searchInput = document.querySelector('input[name="q"]');
                const searchQuery = searchInput.value;

                try {
                    hideSidebarStuff();
                    const response = await chrome.runtime.sendMessage({
                        action: 'performSearch',
                        query: searchQuery,
                        website: website
                    });
                    unblurResults();
                    updateSidebarWithResponse(response);

                
                    const allWebsiteLinks = websiteContainer.querySelectorAll('a');
                    allWebsiteLinks.forEach(link => {
                        link.style.fontWeight = 'normal';
                        link.style.textDecoration = 'underline';
                        link.style.color = '#4a90e2';
                    });

                    websiteLink.style.fontWeight = 'bold';
                    websiteLink.style.textDecoration = 'none';
                    websiteLink.style.color = '#e74c3c';
                } catch (error) {
                    console.error('Error sending message to background.js:', error);
                }
            });

            websiteContainer.appendChild(websiteLink);

            if (index < websites.length - 1) {
                const separator = document.createTextNode(' | ');
                websiteContainer.appendChild(separator);
            }

            if (index === 0) {
               
                websiteLink.click();
            }
        });
    });

    // Create the summary element section
    const summaryElement = document.createElement('div');
    summaryElement.id = 'summary-element';
    summaryElement.style.boxSizing = 'border-box';
    summaryElement.style.fontSize = '17px';
    summaryElement.style.lineHeight = '1.58';
    summaryElement.style.padding = '15px';
    summaryElement.style.borderRadius = '8px';
    summaryElement.style.backgroundColor = '#f4f6f9'; 
    summaryElement.style.color = '#333'; 
    const loaderText = document.createElement('p');
    loaderText.innerHTML = 'Loading...';
    loaderText.style.fontSize = '16px';
    loaderText.style.color = '#4a90e2'; 
    summaryElement.appendChild(loaderText);
    sidebar.appendChild(summaryElement);

    
    const resultsList = document.createElement('ul');
    resultsList.id = 'results-list';
    resultsList.style.listStyleType = 'none';
    resultsList.style.marginTop = '20px'; 
    resultsList.style.paddingLeft = '0';
    resultsList.style.maxHeight = '400px'; 
    resultsList.style.overflowY = 'auto'; 
    resultsList.style.borderTop = '1px solid #ddd'; 
    resultsList.style.paddingTop = '15px'; 
    sidebar.appendChild(resultsList);

  
    const madeBySection = document.createElement('div');
    madeBySection.style.marginTop = '20px';
    madeBySection.style.textAlign = 'center';
    madeBySection.style.fontSize = '14px';
    madeBySection.style.color = '#888';
    madeBySection.innerHTML = `
        CrossQuery is made by <a href="https://x.com/paraschopra" target="_blank" style="color: #4a90e2;">@paraschopra</a>
        <br/>For feedback, <a href="https://github.com/paraschopra/crossquery-extension/issues" style="color: #4a90e2;">raise an issue</a> or tweet to me
        <br/><br/><em style="font-size: 12px; color: #777;">AI generated summaries can contain errors</em>
    `;

    sidebar.appendChild(madeBySection);

   
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
        let i = 1;
        results.forEach(result => {
            const listItem = document.createElement('li');
            listItem.style.marginTop = '15px'; 
            listItem.style.padding = '10px'; 
            listItem.style.backgroundColor = '#f9f9f9'; 
            listItem.style.borderRadius = '8px'; 
            listItem.style.transition = 'background-color 0.3s ease'; 
            listItem.addEventListener('mouseenter', () => {
                listItem.style.backgroundColor = '#f1f1f1'; 
            });
            listItem.addEventListener('mouseleave', () => {
                listItem.style.backgroundColor = '#f9f9f9'; 
            });

            listItem.innerHTML = `
                <a id="result-${i}" class="anchor-offset" name="result-${i}"></a>
                <span style="font-size: 16px; font-weight: 600; color: #4a90e2;">[${i}]</span>
                <a href="${result.link}" style="color: #4a90e2; font-weight: 600;" target="_blank">${result.title}</a>
                <p style="margin-top: 10px; font-size: 14px; color: #555;">${result.description}</p>
            `;
            resultsList.appendChild(listItem);
            i++;
        });
    }
}


function updateSummary(summary) {
    unblurSummary();
    const summaryElement = document.getElementById('summary-element');

   
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const linkColorDark = '#1e90ff'; 
    const linkColorLight = '#0000ff';

    
    const summaryReplaced = summary.replace(/<([\d,\s]+)>/g, (match, numbers) => {
        const linkColor = isDarkMode ? linkColorDark : linkColorLight;

    
        const linkedNumbers = numbers.split(',')
            .map(number => `<a style="color: ${linkColor};" href="#result-${number.trim()}">[${number.trim()}]</a>`)
            .join(', ');

        return linkedNumbers;
    });

    
    if (summaryElement) {
        summaryElement.innerHTML = `<p>${summaryReplaced}</p>`;
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
        //console.log(descriptionElement);
        //const snippetElements = result.querySelectorAll('.g span:not([class])');

        const title = titleElement ? titleElement.textContent : '';
        const link = linkElement ? linkElement.href : '';
        
        const description = (descriptionElement.length!=0) ? descriptionElement[descriptionElement.length-1].textContent : '';

        return { title, link, description };
    });

    return results;
}

async function summarizeResults_own_key(results, searchQuery) {

    const settings = await chrome.storage.sync.get(['aiSelection', 'openaiApiKey', 'groqApiKey', 'groqModel', 'summaryEnabled' ,'geminiModel', 'geminiApiKey']);

    const summaryEnabled =  await isSummaryEnabled();
    const aiSelection = settings.aiSelection || 'openai';
    const openaiApiKey = settings.openaiApiKey;
    const groqApiKey = settings.groqApiKey;
    const geminiApiKey = settings.geminiApiKey;
    const groqModel = settings.groqModel || 'llama3-8b-8192';
    const geminiModel = settings.geminiModel || 'gemini-1.5-flash';
    console.log("Summary enabled: ", summaryEnabled);
    console.log("AI selection: ", aiSelection);
    console.log("OpenAI API key: ", openaiApiKey);
    console.log("Groq API key: ", groqApiKey);
    console.log("Gemini API key: ", geminiApiKey);
    console.log("Groq model: ", groqModel);
    console.log("Gemini model : ", geminiModel);
    if(!summaryEnabled){
        
        console.log("Summary disabled");
        updateSummary('Summary is disabled. Please enable it by clicking on the extension icon if you want to see the summary.');
        return;
    }

    if(aiSelection === 'openai' && !openaiApiKey){
        updateSummary(`<strong>Add your OpenAI API key to summarize results</strong> (or disable summary) by clicking on the extension icon.`);
        return;
    } else if(aiSelection === 'groq' && !groqApiKey){
        updateSummary(`<strong>Add your GROQ API key to summarize results</strong> (or disable summary) by clicking on the extension icon.`);
        return;
    }
    else if (aiSelection === 'gemini' && !geminiModel){
        updateSummary(`<strong>Add your Gemini API key to summarize results</strong> (or disable summary) by clicking on the extension icon.`);
        return;
    }


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
    console.log("prompt value is ",prompt);


    try {
        
        if(aiSelection === 'openai') {
            await getOpenAISummary(prompt, openaiApiKey, updateSummary);

        } else if (aiSelection === 'groq') {
            const summaryText = await getGroqSummary(prompt, groqApiKey, groqModel);
            console.log("summary text insider the sumarizeResult method is ",summaryText);
            updateSummary(summaryText);
        }
        else{
            const summaryText = await getGeminiSummary(prompt, geminiApiKey, geminiModel);
            console.log("summary text insider the sumarizeResult method is ",summaryText);
            updateSummary(summaryText);
        }
        
    } catch (error) {
        console.error('Error getting summary:', error);
        updateSummary('Error generating summary. Please check your API key and try again.');
    }
   
}

async function getGeminiSummary(prompt, apiKey, model) {
   

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt,
                        }],
                    }],
                }),
            }
        );

        console.log("Response from the API:", response);

        // Check if the response status is not OK
        if (!response.ok) {
            if (response.status === 429) {
                // Handle rate limit error
                const errorData = await response.json();
                console.error("Rate limit reached:", errorData.error.message);
                return "API request limit reached. Please try again later.";
            }

            // For other errors, throw an exception
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();
        console.log("Data value is:", data);

        // Extract and return the summary text
        const summary = data.candidates[0].content.parts[0].text;
        console.log("Summary of Google API is:", summary);
        return summary;

    } catch (error) {
        console.error("Error in getGeminiSummary:", error.message);
        // Return a fallback message for any unexpected errors
        return "An error occurred while generating the summary. Please try again later.";
    }
}

async function getOpenAISummary(prompt, apiKey) {

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            stream: true
        })
    });

    if (!response.ok) {
        throw new Error('OpenAI API error');
    }

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
    return summary;
}

async function getGroqSummary(prompt, apiKey, model) {
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: 1000,
        })
    });

    if (!response.ok) {
        throw new Error('GROQ API error');
    }

    const data = await response.json();
    if (data.choices && data.choices[0]?.message) {
        return data.choices[0].message.content;
    }
    
    throw new Error('No summary available from GROQ');
}


async function updateSidebarWithResponse(response, searchQuery){
    if (response && response.html) {
        const html = response.html;
        //console.log('Parsing search results');
        const results = parseSearchResults(html);

        if (results.length === 0) {
            // No results found
            updateSidebar([]);
            updateSummary('No results found.');
            return;
        }

        //console.log('Search results:', results);
        updateSidebar(results);

        //console.log('Summarizing search results');
        summarizeResults_own_key(results, searchQuery);
        //console.log('Summary:', summary);
    } else {
        console.log('No results found.');
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

    summaryEnabled = await isSummaryEnabled();
    //console.log("Summary enabled: ", summaryEnabled);

    const urlParams = new URLSearchParams(window.location.search);
    const tbm = urlParams.get('tbm');
    const searchDiv = document.querySelector("div#search");
    if (!searchDiv) {
        console.log('Disabling sidebar on non-text search results page');
        return;
    }

    createSidebar();

    //console.log("Detecting color scheme");
    detectColorScheme();

    const searchInput = document.querySelector('input[name="q"]');
    const searchQuery = searchInput.value;


});
