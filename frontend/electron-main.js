const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');

const startLocalServer = (done) => {
  localServerApp.use(express.json({ limit: "100mb" }));
  localServerApp.use(cors());
  localServerApp.use(express.static('./build/'));
  localServerApp.listen(PORT, async () => {
    console.log("Server Started on PORT ", PORT);
    done();
  });
};
const check = (callback) => {
  exec('docker --version', (err, stdout, stderr) => {
      if (err) {
          throw new Error(`Ensure Docker is installed and running.`);
      } else {
          callback();
      }
  });
};
let containerId = null
const automate = () => {
  check(() => {
    exec('docker ps -q -f "ancestor=myapi"', (err, stdout, stderr) => {
      if (err) {
        console.error("Error checking running containers:", stderr);
        return;
      }

      const running = stdout.trim();
      if (running) {
        console.log(`Container is already running with ID: ${running}`);
        containerId = running; // Save the container ID
        return;
      }

      exec('docker ps -a -q -f "ancestor=myapi"', (err, stdout, stderr) => {
        if (err) {
          console.error("Error checking existing containers:", stderr);
          return;
        }

        const exist = stdout.trim();
        if (exist) {
          console.log(`Found stopped container with ID: ${exist}. Restarting...`);
          exec(`docker start ${exist}`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Error starting container "${exist}":`, stderr);
              return;
            }
            console.log(`Container "${exist}" started successfully.`);
            containerId = exist; // Save the container ID
          });
        } else {
          console.log("No existing container found. Running a new one...");

          exec('docker run -p 8080:8080 -d myapi', { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
            if (err) {
              console.error("Error running Docker container:", stderr);
              return;
            }
            containerId = stdout.trim(); // Save the container ID
            console.log(`New container started with ID: ${containerId}`);
          });
        }
      });
    });
  });
};

let containerName = null;
let conId = null;
const isWindows = os.platform() === 'win32'; 
const downloadsPath = isWindows ? `${process.env.USERPROFILE}\\Downloads`: '~/Downloads'; 

const automateFile = (id) => {
  check(() => {
    containerName = `fileshare-container-${id}`;
    exec(`docker ps -q -f "name=${containerName}"`, (err, stdout, stderr) => {
      if (err) {
        console.log(`Error checking running containers: ${stderr}`);
        return;
      }
      const running = stdout.trim();

      if (running) {
        console.log(`Container is already running with ID: ${running}`);
        conId = running;
        console.log(`Container ${conId} is already running.`);
        return;
      }

      exec(`docker ps -a -q -f "name=${containerName}"`, (err, stdout, stderr) => {
        if (err) {
          console.log(`Error checking existing containers: ${stderr}`);
          return;
        }

        const exist = stdout.trim();

        if (exist) {
          console.log(`Found stopped container with ID: ${exist}. Restarting...`);
          exec(`docker start ${exist}`, (err, stdout, stderr) => {
            if (err) {
              console.log(`Error starting container "${exist}": ${stderr}`);
              return;
            }
            console.log(`Container "${exist}" started successfully.`);
            conId = exist;
          });
        } else {
          console.log("No existing container found. Creating a new one...");

          exec(`docker run -p 8081:1234 --name ${containerName} -v ${downloadsPath}:/downloads -d fileshare:v ${id}`, { cwd: path.join(__dirname, '../fileshare') }, (err, stdout, stderr) => {
            if (err) {
              console.error("Error running Docker container:", stderr);
              return;
            }
            conId = stdout.trim();
          });
        }
      });
    });
  });
};
const terminate = () => {
  if (containerId) {
    const stop = `docker stop ${containerId}`;
    exec(stop, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error stopping container "${containerId}":`, err);
        console.error('stderr:', stderr);
      } else {
        console.log(`Container "${containerId}" stopped successfully.`);
      }
    });
  } else {
    console.log("No container is running.");
  }
};

const terminateFile = () => {
  if (containerName) {
    const stop = `docker stop ${containerName}`;
    exec(stop, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error stopping container "${containerName}":`, err);
        console.error('stderr:', stderr);
      } else {
        console.log(`Container "${containerName}" stopped successfully.`);
      }
    });
  } else {
    console.log("No container is running.");
  }
};

function createWindow() {

  const mainWindow = new BrowserWindow({
    width: 2000,
    height: 1000,
    title: "OrcaNet Desktop App",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  automate();
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.on('close', async (e) => {
    if (process.platform === 'darwin') {
      try {
        await axios.get("http://localhost:8080/logout");
      } catch (error) {
        console.error("Error during logout request:", error.message);
      } finally {
        terminateFile(); 
        mainWindow.destroy(); 
      }
    }
  });
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

const copyFileToContainer = (filePath) => {
  return new Promise((resolve, reject) => {
    // console.log("HELLO ")
    const fileName = path.basename(filePath); // Extract filename
    const targetPath = `/media/${fileName}`;
    console.log(filePath);
    console.log(fileName);
    const command = `docker cp "${filePath}" ${containerName}:"${targetPath}"`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(`Failed to copy file: ${stderr}`);
        return;
      }
      resolve(targetPath);
    });
  });
};

ipcMain.handle('copy-file-to-container', async (event, filePath) => {
  try {

    const targetPath = await copyFileToContainer(filePath);
    return { success: true, path: targetPath };
  } catch (error) {
    console.error("Error in copy-file-to-container:", error.message);
    return { error: error.message };
  }
});



ipcMain.handle('start-docker', async (event, id) => {
  try {
    const result = await automateFile(id); 
    return result; 
  } catch (error) {
    console.error("Error in starting Docker:", error);
    return { error: error.message };
  }
});

ipcMain.handle('stop-docker', async () => {
  try {
    const result = terminateFile(); 
    return result; 
  } catch (error) {
    console.error("Error in stopping Docker:", error);
    return { error: error.message };
  }
});

app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on('will-quit', (event) => {
  terminate(); 
  terminateFile();
  app.quit();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    terminate();
    terminateFile();
    app.quit();
  }
});

process.on("SIGINT", () => {
  console.log("Caught interrupt signal (Ctrl+C). Cleaning up...");
  terminate();
  terminateFile();
  app.quit();
});