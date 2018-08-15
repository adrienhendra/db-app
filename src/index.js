import { app, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';

/* My database component */
import DB from './components/db';

/* Required for squirrel, maybe? */
// if (require('electron-squirrel-startup')) app.quit();
const squi = require('electron-squirrel-startup');

/* My database */
const mydb = new DB();

/* My IPC */
const ipc = ipcMain;

/* Console alias */
const Console = console;

/* Required just to create desktop shortcut ? */
if (squi) app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

/* This is to handle SYNC commands */
const handleDbSyncCommands = async (event, arg) => {
  const { cmd, data } = arg;
  const retVal = {
    cmd,
    errMsg: null,
    data: null,
  };

  let res = null;

  switch (cmd) {
    case 'insertNew':
      try {
        res = await mydb.insertNewQuestion(
          JSON.stringify(data.cat),
          JSON.stringify(data.qd),
          data.dl,
        );
        retVal.errMsg = res.errMsg;
        retVal.data = { success: res.success, data: res.data };
      } catch (err) {
        // Console.log(err);
        retVal.errMsg = err.errMsg;
        retVal.data = { success: err.success, data: err.data };
      }
      break;

    case 'hello':
      Console.log(data);
      res = 'world';
      retVal.errMsg = null;
      retVal.data = { success: true, data: res };
      break;

    default:
      Console.log(`CMD: ${cmd}, DATA: ${data} is not supported yet (SYNC).`);
      retVal.errMsg = 'This command is not supported yet.';
      retVal.data = { success: false, data: null };
      break;
  }

  event.returnValue = retVal;
};

/* This is to handle ASYNC commands */
const handleDbAsyncCommands = async (event, arg) => {
  const { cmd, data } = arg;
  const retVal = {
    cmd,
    errMsg: null,
    data: null,
  };

  let res = null;

  switch (cmd) {
    case 'reloadDb':
      try {
        // Console.log(data);
        res = await mydb.reloadDb(data.newPath);
        retVal.errMsg = null;
        retVal.data = { success: res.success, data: null };
      } catch (err) {
        // Console.log(err);
        retVal.errMsg = err.errMsg;
        retVal.data = { success: err.success, data: err.data };
      }
      break;

    case 'getStatus':
      try {
        // Console.log(data);
        res = await mydb.getStatus();
        retVal.errMsg = res.errMsg;
        retVal.data = { success: res.success, data: res.data };
      } catch (err) {
        // Console.log(err);
        retVal.errMsg = err.errMsg;
        retVal.data = { success: err.success, data: err.data };
      }
      break;

    case 'getQuestionList':
      try {
        // Console.log(data);
        res = await mydb.getQuestionList();
        // Console.log(res);
        retVal.errMsg = res.errMsg;
        retVal.data = { success: res.success, data: res.data };
      } catch (err) {
        // Console.log(err);
        retVal.errMsg = err.errMsg;
        retVal.data = { success: err.success, data: err.data };
      }
      break;

    case 'hello':
      Console.log(data);
      res = 'world';
      retVal.errMsg = null;
      retVal.data = { success: true, data: res };
      break;

    default:
      Console.log(`CMD: ${cmd}, DATA: ${data} is not supported yet (ASYNC).`);
      retVal.errMsg = 'This command is not supported yet.';
      retVal.data = { success: false, data: null };
      break;
  }
  event.sender.send('db-async-command-resp', retVal);
};

const createWindow = async () => {
  try {
    /* Start connection to DB */
    await mydb.connect();
  } catch (err) {
    Console.log(`Cannot connect to database: ${err.errMsg}, ${err.data}`);
  }

  /* Connect IPCs */
  /* Handle SYNC commands */
  ipc.on('db-sync-command-req', handleDbSyncCommands);
  /* Handle ASYNC commands */
  ipc.on('db-async-command-req', handleDbAsyncCommands);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 960,
    minWidth: 1280,
    minHeight: 960,
    frame: true,
    title: 'Soepriatna DB App',
    useContentSize: false,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', async () => {
  /* End connection to DB */
  // mydb.disconnect();

  try {
    /* End connection to DB */
    await mydb.disconnect();
  } catch (err) {
    Console.log(`Cannot disconnect database: ${err.errMsg}, ${err.data}`);
  }

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
