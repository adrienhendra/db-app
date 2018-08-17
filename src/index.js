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
let mydbVer = null;

/* My IPC */
const ipc = ipcMain;

/* Console alias */
const Console = console;

/* Required just to create desktop shortcut ? */
if (squi) app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const qeditModalWindows = [];

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
      Console.log(`CMD: ${cmd}, DATA: ${JSON.stringify(data)} is not supported yet (SYNC).`);
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
        mydbVer = res.data.version.version;
        retVal.errMsg = null;
        retVal.data = { success: res.success, data: null };
      } catch (err) {
        // Console.log(err);
        mydbVer = null;
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

    case 'getDbVersion':
      try {
        // Console.log(data);
        if (mydbVer === null) {
          res = {
            success: false,
            errMsg: 'DB version unknown / connection failed',
            data: { version: { version: 'unknown' } },
          };
        } else {
          res = {
            success: true,
            errMsg: null,
            data: { version: { version: mydbVer } },
          };
        }
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
      Console.log(`CMD: ${cmd}, DATA: ${JSON.stringify(data)} is not supported yet (ASYNC).`);
      retVal.errMsg = 'This command is not supported yet.';
      retVal.data = { success: false, data: null };
      break;
  }
  event.sender.send('db-async-command-resp', retVal);
};

/* This is to handle ASYNC commands */
const handleIpcRendererAsyncCmd = async (event, arg) => {
  const { cmd, data } = arg;
  const retVal = {
    cmd,
    errMsg: null,
    data: null,
  };

  const passVal = {
    cmd,
    data,
  };

  let res = null;

  let newModalWindow = null;
  let existModId = -1;
  let modWinSizeW = 800;
  let modWinSizeH = 600;

  switch (cmd) {
    case 'launchQEdit':
      // Console.log(data);
      /* Check if selected modal window is already exists */
      existModId = qeditModalWindows.findIndex((o) => o.qID === data.editData.ID);
      if (existModId >= 0) {
        /* Already exist, refocus */
        qeditModalWindows[existModId].modal.focus();
      } else {
        if (isDevMode) {
          modWinSizeW = 1000;
          modWinSizeH = 600;
        }
        /* Not yet, create new QEdit modal */
        newModalWindow = new BrowserWindow({
          show: false,
          maximizable: true,
          minimizable: true,
          minWidth: modWinSizeW,
          minHeight: modWinSizeH,
          width: modWinSizeW,
          height: modWinSizeH,
        });

        /* Add new modal windows to list */
        qeditModalWindows.push({
          qID: data.editData.ID,
          modal: newModalWindow,
        });

        /* Print for debug */
        // Console.log('-----');
        // qeditModalWindows.forEach((m) => {
        //   Console.log(`Modal ID: ${m.qID}, ${typeof m.modal}`);
        // });
        // Console.log('-----');

        newModalWindow.loadURL(`file://${__dirname}/editpage.html`);
        newModalWindow.once('ready-to-show', async () => {
          newModalWindow.show();
        });

        newModalWindow.once('show', async () => {
          /* Open the DevTools. */
          if (isDevMode) {
            newModalWindow.webContents.openDevTools();
          }

          /* Pass value to other renderer */
          newModalWindow.webContents.send('r2r-async-msg-req', passVal);
        });

        newModalWindow.once('close', () => {
          // Console.log(`Closing modal for qID ${data.editData.ID}.`);
          /* Remove from array */
          const modIdx = qeditModalWindows.findIndex(
            (o) => o.qID === data.editData.ID && o.modal === newModalWindow,
          );
          // Console.log(`  Found modal idx: ${modIdx}`);
          if (modIdx >= 0) {
            qeditModalWindows[modIdx] = null;
            qeditModalWindows.splice(modIdx, 1);
            // Console.log(
            //   `  Modal window count: ${
            //     qeditModalWindows.length
            //   }, selected index: ${modIdx} has been destroyed!`,
            // );
          } else {
            Console.log(`Cannot find the modal for qID ${data.editData.ID}.`);
          }
        });
      }

      /* Summarize result */
      res = [];
      retVal.errMsg = null;
      retVal.data = { success: true, data: res };
      break;

    default:
      Console.log(`CMD: ${cmd}, DATA: ${JSON.stringify(data)} is not supported yet (ASYNC).`);
      retVal.errMsg = 'This command is not supported yet.';
      retVal.data = { success: false, data: null };
      break;
  }

  /* Reply to original renderer */
  event.sender.send('renderer-async-msg-resp', retVal);
};

const createWindow = async () => {
  let winSizeW = 1024;
  let winSizeH = 800;
  if (isDevMode) {
    winSizeW = 1680;
    winSizeH = 800;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: winSizeW,
    height: winSizeH,
    minWidth: winSizeW,
    minHeight: winSizeH,
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

  /* Emitted when the window is closing */
  mainWindow.on('close', () => {
    const openModalCount = qeditModalWindows.length;
    // Console.log(`Need to close ${openModalCount} modal windows.`);

    /* Close all modal windows (backwards ...) */
    if (openModalCount > 0) {
      let i = 0;
      for (i = openModalCount - 1; i >= 0; i -= 1) {
        Console.log(
          `Destroying Modal ID: ${qeditModalWindows[i].qID}, ${typeof qeditModalWindows[i].modal}`,
        );
        qeditModalWindows[i].modal.close();
      }
    }
  });

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
app.on('ready', async () => {
  /* Start connection to DB */
  let dbConnectStatus = null;
  try {
    dbConnectStatus = await mydb.connect();
    mydbVer = dbConnectStatus.data.version.version;
    Console.log(`DB connect success: ${dbConnectStatus.success}, version: ${mydbVer}`);
  } catch (err) {
    mydbVer = null;
    Console.log(`Cannot connect to database: ${err.errMsg}, ${err.data}`);
  }

  /* Connect IPCs */
  /* Handle SYNC commands */
  ipc.on('db-sync-command-req', handleDbSyncCommands);

  /* Handle ASYNC commands */
  ipc.on('db-async-command-req', handleDbAsyncCommands);

  /* Handle ASYNC commands from renderer */
  ipc.on('renderer-async-msg-req', handleIpcRendererAsyncCmd);

  createWindow();
});

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
