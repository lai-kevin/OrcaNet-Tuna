const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
const fs = require('fs');
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
        containerId = running; 
        return;
      }
      exec('docker ps -a -q -f "ancestor=myapi"', (err, stdout, stderr) => {
        if (err) {
          console.error("Error checking existing containers:", stderr);
          return;
        }

        const exist= stdout.trim();

        if (exist) {
          console.log(`Found stopped container with ID: ${exist}. Restarting...`);
          exec(`docker start ${exist}`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Error starting container "${exist}":`, stderr);
              return;
            }
            console.log(`Container "${exist}" started successfully.`);
            containerId = exist; 
          });
        } else {
          console.log("No existing container found. Creating a new one...");
          const com = [
            'docker build -t myapi .',
            'docker run -p 8080:8080 -d myapi'
          ];

          com.forEach((cmd, index) => {
            exec(cmd, { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
              if (err) {
                console.error(`Error executing "${cmd}":`, err);
                console.error('stderr:', stderr);
              } else {
                console.log(`Command "${cmd}" executed successfully:`);
                console.log(stdout);

                if (index === 1) {
                  containerId = stdout.trim();
                  console.log(`New container started with ID: ${containerId}`);
                }
              }
            });
          });
        }
      });
    });
  });
};

let containerName = null;
let conId = null;
const automateFile = (id) => {
  return new Promise((resolve, reject) => {
    check(() => {
      containerName = `fileshare-container-${id}`;

      exec(`docker ps -q -f "name=${containerName}"`, (err, stdout, stderr) => {
        if (err) {
          reject(`Error checking running containers: ${stderr}`);
          return;
        }
        const running = stdout.trim();

        if (running) {
          console.log(`Container is already running with ID: ${running}`);
          conId = running;
          resolve(`Container ${conId} is already running.`);
          return;
        }

        exec(`docker ps -a -q -f "name=${containerName}"`, (err, stdout, stderr) => {
          if (err) {
            reject(`Error checking existing containers: ${stderr}`);
            return;
          }

          const exist = stdout.trim();

          if (exist) {
            console.log(`Found stopped container with ID: ${exist}. Restarting...`);
            exec(`docker start ${exist}`, (err, stdout, stderr) => {
              if (err) {
                reject(`Error starting container "${exist}": ${stderr}`);
                return;
              }
              console.log(`Container "${exist}" started successfully.`);
              conId = exist;
              resolve(`Container "${conId}" started successfully.`);
            });
          } else {
            console.log("No existing container found. Creating a new one...");
            console.log("ID", id)
            const com = [
              `docker build -t fileshare:v1 .`,
              `docker run -p 8081:1234 --name ${containerName} -v ~/Downloads:/downloads -d fileshare:v1 ${id}`
            ];

            com.forEach((cmd, index) => {
              exec(cmd, { cwd: path.join(__dirname, '../fileshare') }, (err, stdout, stderr) => {
                if (err) {
                  reject(`Error executing "${cmd}": ${err}`);
                  reject(stderr);
                  return;
                }

                console.log(`Command "${cmd}" executed successfully:`);
                console.log(stdout);

                if (index === 1) {
                  containerId = stdout.trim();
                  console.log(`New container started with ID: ${conId} and name: ${containerName}`);
                  resolve(`New container started with ID: ${conId} and name: ${containerName}`);
                }
              });
            });
          }
        });
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
    resizable:true,
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
