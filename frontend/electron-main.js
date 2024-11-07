const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
const fs = require('fs');

const startLocalServer = (done) => {
  localServerApp.use(express.json({ limit: "100mb" }));
  localServerApp.use(cors());
  localServerApp.use(express.static('./build/'));
  localServerApp.listen(PORT, async () => {
    console.log("Server Started on PORT ", PORT);
    done();
  });
};

function createWindow() {

  const mainWindow = new BrowserWindow({
    width: 2000,
    height: 1000,
    title: "OrcaNet Desktop App",
    resizable:true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  
  mainWindow.loadURL('http://localhost:3000');
}

//requires ipc to talk between electron main process and our react components
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });

  if (result.canceled) {
    return null;
  }
  const filePath = result.filePaths[0];
  const fileStats = fs.statSync(filePath); // get file stats, will leave it open for modifying DHT insertion with some additional info
  //for demo we had file size and timestamp as a part of the displayed metadata
  return {
    path: filePath,
    size: fileStats.size,           // size in bytes
    // isFile: fileStats.isFile(),      // Tells us if its a file not a directory
    // isDirectory: stats.isDirectory(), // Tells us if it's a directory
  };
});

app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
