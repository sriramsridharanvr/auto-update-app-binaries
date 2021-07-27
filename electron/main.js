const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require("electron");
const { channels } = require("../src/shared/constants");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const path = require("path");
const url = require("url");

const { agentStatus, isDev } = require("./utils");
// const { startAgent, stopAgent, getAgentStatus } = require("./agentWrapper");

let mainWindow;
let currentAgentStatus = agentStatus.stopped;
let tray = null;

const initTray = () => {
  tray = new Tray(trayIcons["Stopped"]);
  refreshTray();
};

const parsePlatform = (platform) => {
  switch (platform) {
    default:
      return "Unknown";

    case "darwin":
      return "Mac OS X";

    case "win32":
      return "Windows";
  }
};

let dataFilePath = isDev()
  ? path.join(__dirname, "../components/tenjinagent")
  : path.join(process.resourcesPath, "/tenjinagent");

log.info("Data file path would be ", dataFilePath);

const agentOptions = {
  "server.port": "7777",
  "spring.datasource.url": "jdbc:h2:file:" + dataFilePath,
  "agent.home": isDev()
    ? path.join(__dirname, "../components/work")
    : path.join(process.resourcesPath, "/components/work"),
  "logging.file.name": isDev()
    ? path.join(__dirname, "../components/logs/agent.log")
    : path.join(process.resourcesPath, "/components/logs/agent.log"),
};

log.info("jdbc:h2:file: " + agentOptions["spring.datasource.url"]);

// ###########################
// Method definitions
// ###########################
const createWindow = () => {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(startUrl);
  //   pingAgentStatus();

  mainWindow.on("close", function (event) {
    mainWindow = null;
  });

  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
};

const trayIcons = {
  Running: path.join(
    __dirname,
    `assets/tray/${process.platform}/favicon${
      process.platform === "win32" ? ".ico" : ".png"
    }`
  ),

  Starting: path.join(
    __dirname,
    `assets/tray/${process.platform}/favicon_grayscale${
      process.platform === "win32" ? ".ico" : ".png"
    }`
  ),

  Stopped: path.join(
    __dirname,
    `assets/tray/${process.platform}/favicon_grayscale${
      process.platform === "win32" ? ".ico" : ".png"
    }`
  ),
};

const buildContextMenu = () => {
  return Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      },
    },

    {
      label: process.platform !== "darwin" ? "Exit" : "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);
};

const refreshTray = () => {
  tray.setToolTip(`Tenjin Agent - ${currentAgentStatus}`);
  tray.setImage(trayIcons[currentAgentStatus]);
  tray.setContextMenu(buildContextMenu());
};

const pingAgentStatus = () => {
  const status = agentStatus.stopped;
  if (status !== currentAgentStatus) {
    currentAgentStatus = status;
    // sendStatusToRenderer({
    //   agentStatus: status,
    // });
    refreshTray();
  }
};

const sendStatusToRenderer = (payload) => {
  //console.log("Sending AGENT_STATUS to renderer: ", payload);
  mainWindow.webContents.send(channels.AGENT_STATUS, payload);
};

const handleAgentStart = (event, args) => {
  const promise = startAgent(agentOptions);
  promise
    .then(
      () => {
        pingAgentStatus();
      },
      (reason) => {
        currentAgentStatus = getAgentStatus();
        sendStatusToRenderer({
          agentStatus: currentAgentStatus,
          message: reason,
        });
      }
    )
    .catch((error) => {
      currentAgentStatus = getAgentStatus();
      sendStatusToRenderer({
        agentStatus: currentAgentStatus,
        message: error.message,
      });
    });
};

const handleAgentStop = (event, args) => {
  stopAgent();
  pingAgentStatus();
};

// ###########################
// Main Application Events
// ###########################
app.on("ready", () => {
  createWindow();
  initTray();
  //   handleAgentStart();
  if (process.platform === "darwin") {
    // app.dock.setMenu(buildContextMenu());
  }
});

app.on("window-all-closed", function () {
  //console.log("All Windows Closed!! Application is now running in background");
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", (event) => {
  const agentStatus = getAgentStatus();
  if (agentStatus === "Running") {
    //console.log("Stopping Agent");
    // handleAgentStop();
  }
});

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: "Tenjin Agent",
    appVersion: app.getVersion(),
    platform: parsePlatform(process.platform),
    startDir: __dirname,
    resourcesDir: process.resourcesPath,
    env: isDev() ? "Dev" : "Production",
    jarPath: isDev()
      ? path.join(__dirname, "../components/agent.jar")
      : path.join(process.resourcesPath, "components/agent.jar"),
  });
});

// On agent start
ipcMain.on(channels.AGENT_START, (event, args) => {
  //console.log("Recd Message --> ", channels.AGENT_START);
  //   handleAgentStart(event, args);
});

// On agent stop
ipcMain.on(channels.AGENT_END, (event) => {
  //console.log("Recd Message --> ", channels.AGENT_END);
  //   handleAgentStop();
});

// On agent status
ipcMain.on(channels.AGENT_STATUS, (event) => {
  pingAgentStatus();
  event.sender.send(channels.AGENT_STATUS, {
    agentStatus: currentAgentStatus,
  });
});

// Auto updater events
ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
autoUpdater.on(channels.UPDATE_AVAILABLE, () => {
  mainWindow.webContents.send(channels.UPDATE_AVAILABLE);
});
autoUpdater.on(channels.UPDATE_DOWNLOADED, () => {
  mainWindow.webContents.send(channels.UPDATE_DOWNLOADED);
});
