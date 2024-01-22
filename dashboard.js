document.getElementById('greeting').textContent = `Welcome, ${sessionStorage.getItem('username')}!`;

document.getElementById('splunkSearch').addEventListener('submit', async function(event) {
  event.preventDefault();
  let container = document.getElementById('output');
  container.className = '';
  container.innerHTML = "Processing search...";
  const searchTerms = 'search ' + document.getElementById('searchQuery').value;
  const apiBaseURL = `https://${sessionStorage.getItem('host')}:${sessionStorage.getItem('port')}`;

    
  const sid = await submitSearchJob(apiBaseURL, searchTerms);
  console.log(`====>sid: ${sid} <====`);

  await waitForSearchCompletion(apiBaseURL, sid);
  console.log(`====>search status: 1 <====`);

  console.log('retrieving the search results')
  const searchResults = await getSearchResults(apiBaseURL, sid);
  console.log('logging results from main');
  console.log(searchResults);
    
  displayResults(searchResults);
  
});

async function submitSearchJob(apiBaseURL, searchTerms) {
  const request = {
    method: 'POST',
    headers: {
      'Authorization': `Splunk ${sessionStorage.getItem('sessionKey')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ search: searchTerms }).toString(),
  };

  const response = await fetch(`${apiBaseURL}/services/search/jobs`, request);
  const data = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
  return xmlDoc.querySelector('sid').textContent;
}

async function waitForSearchCompletion(apiBaseURL, sid) {
  // this function is directly translated from here--
  //https://www.splunk.com/en_us/blog/tips-and-tricks/splunk-rest-api-is-easy-to-use.html
  let isDoneStatus = '0';
  while (isDoneStatus !== '1') {
    const response = await fetch(`${apiBaseURL}/services/search/jobs/${sid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Splunk ${sessionStorage.getItem('sessionKey')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await response.text();
    isDoneStatus = /isDone">(0|1)/.exec(data)[1];
    if (isDoneStatus !=='1') {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
  }
}

async function getSearchResults(apiBaseURL, sid) {
  //https://<host>:<mPort>/services/search/v2/jobs/{search_id}/results
  const response = await fetch(`${apiBaseURL}/services/search/v2/jobs/${sid}/results`, {
    method: 'GET',
    headers: {
      'Authorization': `Splunk ${sessionStorage.getItem('sessionKey')}`,
    },
    count: '10',
    output_mode: 'xml',
  });
  console.log('fetch results executed');
  const textResponse = await response.text();
  return textResponse;
}

async function displayResults(xmlResponse) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlResponse, "text/xml");

  const results = xmlDoc.getElementsByTagName("result");
  console.log('results gotten: ', results);

  let container = document.getElementById('output');
  container.innerHTML = "";

  // if no results, print that
  if (results.length == 0) {
    container.className = 'noResults';
    container.textContent = "No results for query";
  }

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    console.log('curr result: ', result);
    const rawField = result.querySelector("field[k='_raw'] v");

    let newEntry = document.createElement('div');
    newEntry.textContent = `result #${i}: \n` + rawField.textContent;
    newEntry.classList.add('resultEntry');
    if (rawField) {
      const rawValue = rawField.textContent;
      console.log("_raw:", rawValue);
      container.appendChild(newEntry);
    } else {
      console.error("Failed to find rawField in result", result);
    }
  }
}
