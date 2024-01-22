const { app, BrowserWindow, ipcMain, path, nativeImage } = require("electron");
// const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
let image = nativeImage.createFromPath('icon.png');
//image = image.resize({ width: image.getSize().width, height: image.getSize().height, quality: 'best' });
app.dock.setIcon(image);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 1000,
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  win.loadFile("index.html");
  // win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on("saveUserData", (event, userData) => {
  console.log("username/password: ", JSON.stringify(userData));
});

// code from https://stackoverflow.com/questions/38986692/how-do-i-trust-a-self-signed-certificate-from-an-electron-app
// allows app to connect to self signed certificate (my splunk server)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // On certificate error we disable default behaviour (stop loading the page)
  // and we then say "it is all fine - true" to the callback
  event.preventDefault();
  callback(true);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/*
contextBridge.exposeInMainWorld('electronIPC', {
  send: (channel, data) => {
    ipcMain.send(channel, data);
  }
});
*/
