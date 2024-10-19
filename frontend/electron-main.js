const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
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
