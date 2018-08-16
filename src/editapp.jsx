/* React */
import React from 'react';

/* Electrons */
import electron, { ipcRenderer } from 'electron';

/* My IPC */
const ipc = ipcRenderer;

/* Alias for my console debug */
const Console = console;

export default class EditApp extends React.Component {
  constructor(props) {
    super(props);
    /* This state */
    this.state = {
      text: '',
      editId: -1,
    };

    /* IPC handler from another renderer */
    this.handleIpcR2RAsyncRecv = (event, arg) => {
      const { cmd, data } = arg;

      switch (cmd) {
        case 'launchQEdit':
          Console.log(`launchQEdit received: data: ${JSON.stringify(data)}`);
          break;

        default:
          Console.log(`CMD: ${cmd} is not supported yet (ASYNC). Data: ${JSON.stringify(data)}`);
          break;
      }
    };

    /* Send ASYNC to another renderer */
    this.sendRendererReqAsync = (dbCmd, paramObj = null) =>
      ipc.send('r2r-async-msg-resp', { cmd: dbCmd, data: paramObj });

    /* Receive ASYNC from another renderer */
    ipc.on('r2r-async-msg-req', this.handleIpcR2RAsyncRecv);
  }

  render() {
    return (
      <div>
        <h1>Hello Edit World!</h1>
      </div>
    );
  }
}
