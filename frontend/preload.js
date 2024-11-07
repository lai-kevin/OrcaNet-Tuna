const { contextBridge, ipcRenderer } = require('electron');
//preload script to expose some of the functionality of electron to other parts of the app
//using this so i can create a dialog for selecting a file
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
});