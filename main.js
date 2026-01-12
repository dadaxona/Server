const { app, BrowserWindow, ipcMain, Menu } = require("electron/main");
const path = require("node:path");
const Crude = require(path.join(__dirname, "App", "Crude"));
const Cmd = require(path.join(__dirname, "App", "Cmd"));
const { Server } = require("./models");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  // Menu.setApplicationMenu(null)
  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(async () => {
  await Server.update({ status: false }, { where: { status: true } });
  createWindow();
});


app.on("before-quit", (event) => {
  event.preventDefault();
  (async () => {
    try {
      await Cmd.stopAll();
      app.exit(0);
    } catch (err) {
      app.exit(1);
    }
  })();
});

ipcMain.handle("get", () => Crude.get());
ipcMain.handle("create", (_, data) => Crude.create(data));
ipcMain.handle("update", (_, data) => Crude.update(data));
ipcMain.handle("destroy", (_, data) => Crude.destroy(data));

// asosiy joy
ipcMain.handle("start", (_, data) => Cmd.start(data));
ipcMain.handle("stop", (_, data) => Cmd.stop(data));
