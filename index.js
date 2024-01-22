document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const host = document.getElementById('urlInput').value;
  const port = document.getElementById('portInput').value;
  sessionStorage.setItem('host', host);
  sessionStorage.setItem('port', port);
  const username = document.getElementById('username').value;
  sessionStorage.setItem('username', username);
  const password = document.getElementById('password').value;

  fetch(`https://${host}:${port}/services/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Login failed');
    }
    document.getElementById('result').innerText = 'Invalid login, try again';
    return response.text(); 
  })
  .then(data => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'application/xml');
    const sessionKey = xmlDoc.querySelector('sessionKey').textContent;

    sessionStorage.setItem('sessionKey', sessionKey);
    console.log(sessionKey);
    
    document.getElementById('result').innerText = 'Login successful!';

    // go to the dash to make other api calls with our key
    window.location.href = 'dashboard.html';
  })
  .catch(error => {
    let rec = '';
    if (error.message === 'Login failed') {
      rec = 'Incorrect username or password';
    } else {
      rec = 'Check your host and port';
    }
    document.getElementById('result').innerText = 'Error: ' + error.message + '\n' + rec;
  });
});