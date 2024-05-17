// TODO
// Remove key
// Make it work on ChatGPT and Claude too? (Transform initial query to search)
// For example, it could use Hacker News for tech-related searches and switch to Twitter for political discussions. That way, it would align perfectly with the content type and offer even more targeted insights!
// Give a subset of sites to choose from
// perhaps user providing a list of websites and in what context they prefer them could be a good addition
// making it moveable/sticky will help



const isLocal = false; // make it true when testing localhost server, on production false

function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar';
    sidebar.style.position = 'absolute';
    sidebar.style.top = '150px';
    sidebar.style.right = '50px';
    sidebar.style.width = '400px';
    sidebar.style.padding = '10px';
    sidebar.style.backgroundColor = '#fafafa';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.zIndex = '1';
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
                    console.log("Clicked on", website, "with query ", searchQuery);
                    hideSidebarStuff();
                    const response = await chrome.runtime.sendMessage({
                        action: 'performSearch',
                        query: searchQuery,
                        website: website
                    });
                    unblurResults();
                    updateSidebarWithResponse(response);

                    // Remove highlighting from all website links
                    const allWebsiteLinks = websiteContainer.querySelectorAll('a');
                    allWebsiteLinks.forEach(link => {
                        link.style.fontWeight = 'normal';
                        link.style.textDecoration = 'underline';
                        link.style.color = 'blue';
                    });

                    websiteLink.style.fontWeight = 'bold';
                    websiteLink.style.textDecoration = 'none';
                    websiteLink.style.color = 'black';
                    websiteLink.style.cursor = 'pointer';
                    

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
madeBySection.innerHTML = `Crossquery is made by <a href="https://x.com/paraschopra" target="_blank">@paraschopra</a>
<br/>For feedback, join this <a href="https://t.co/TnfFxwRFQi">WA group</a>`;

// Append the "Made by Paras" section to the sidebar
sidebar.appendChild(madeBySection);

    // Append the sidebar to the document body
document.body.appendChild(sidebar);
  }

  function hideSidebarStuff()
  {
    const resultsList = document.getElementById('results-list');
    const summaryElement = document.getElementById('summary-element');
    resultsList.style.filter = "blur(2px)";
    summaryElement.style.filter = "blur(2px)";
    console.log("Yay");
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
            <a name="result-${i}"></a>
            <span style='font-size: 16px;'>[${i++}] <a href="${result.link}" style="color: #1a0dab; font-weight: 600" target="_blank">${result.title}</a></span>
          <p style="margin-top:5px">${result.description}</p>
        `;
            resultsList.appendChild(listItem);
        });
    }
}

function updateSummary(summary) {
    unblurSummary();
    const summaryElement = document.getElementById('summary-element');
  const summaryReplaced = summary.replace(/<(\d+)>/g, (match, number) => {
    return `<a href="#result-${number}">[${number}]</a>`;
  });
    if (summaryElement) {
        summaryElement.innerHTML = `
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
        //console.log(descriptionElement);
        //const snippetElements = result.querySelectorAll('.g span:not([class])');

        const title = titleElement ? titleElement.textContent : '';
        const link = linkElement ? linkElement.href : '';
        
        const description = (descriptionElement.length!=0) ? descriptionElement[descriptionElement.length-1].textContent : '';

        return { title, link, description };
    });

    return results;
}

async function summarizeResults(results, searchQuery) {

    const apiUrl = isLocal
  ? 'http://localhost:4000/summarize'
  //: 'https://searchplusplus-server-production.up.railway.app/summarize';
  : 'https://crossquery.invertedpassion.com/summarize';

    

    console.log(apiUrl);

    if(results.length < 5) {
        return "Not enough results to summarize";
    }

    const response = await fetch(apiUrl, {
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

async function updateSidebarWithResponse(response, searchQuery){
    if (response && response.html) {
        const html = response.html;
        //console.log('Parsing search results');
        const results = parseSearchResults(html);
        //console.log('Search results:', results);
        updateSidebar(results);

        //console.log('Summarizing search results');
        const summary = await summarizeResults(results, searchQuery);
        //console.log('Summary:', summary);
    } else {
        console.log('No results found.');
    }
}

window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tbm = urlParams.get('tbm');
    if (tbm) {
        console.log('Disabling sidebar on non-text search results page');
        return;
    }

    createSidebar();

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