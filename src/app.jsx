/* React */
import React from 'react';

/* Electrons */
import electron, { ipcRenderer, MenuItem } from 'electron';

/* React router components */
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';

/* Semantic UI example */
import {
  Button,
  Icon,
  Container,
  Grid,
  Header,
  Menu,
  Segment,
  Label,
  Dropdown,
  Rating,
} from 'semantic-ui-react';

/* React table */
import ReactTable from 'react-table';

/* React Quill */
// import ReactQuill from 'react-quill';

/* Get dialog from electron */
const { dialog } = electron.remote;

/* My IPC */
const ipc = ipcRenderer;

/* Alias for my console debug */
const Console = console;

/* Globals */
const DbStatusColors = ['red', 'green', 'yellow'];

export default class App extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      text: '', // You can also pass a Quill Delta here
      dbDataFile: './db/sqdb.db',
      dbStatus: -1,
      dbVersion: 'unknown',
      dbDataRows: [],
      dbCatList: [],
      dbCatGroupList: [],
      pageLoading: false,
      qListLoading: false,
      qTableHeight: 200,
    };

    /* Edit helper */
    this.showEdit = (row) => {
      const { dbDataRows, dbCatList, dbCatGroupList } = this.state;
      return (
        <Button
          size="mini"
          onClick={() => {
            const drIdx = dbDataRows.findIndex((x) => x.ID === row);
            const datarow = dbDataRows[drIdx];
            this.sendRendererReqAsync('launchQEdit', {
              editData: datarow,
              categories: dbCatList,
              cat_groups: dbCatGroupList,
            });
          }}>
          Edit
        </Button>
      );
    };

    /* Recalculate table size */
    this.recalcQtableSize = () => {
      const windowBound = electron.remote.getCurrentWindow().getBounds();
      Console.log(`Current window bound: ${windowBound.width}x ${windowBound.height}`);
      let tableHeight = windowBound.height - 300;
      if (tableHeight < 200) {
        tableHeight = 200;
      }
      this.setState({ qTableHeight: tableHeight });
    };

    /* Router targets */

    /* Home / main page */
    this.HomePage = () => {
      /* Get data rows */
      const { dbDataRows, qListLoading, qTableHeight } = this.state;
      const dbHeader = [
        { Header: 'ID', accessor: 'ID', width: 75, style: { textAlign: 'center' } },
        { Header: 'Category', accessor: 'CATEGORY', width: 75, style: { textAlign: 'center' } },
        {
          Header: 'Questions',
          accessor: 'QUESTION_DATA',
          Cell: (p) => {
            const { q, o, a } = p.value;
            return (
              <div>
                <div>{`Q: ${q}`}</div>
                <div>{`O: ${o}`}</div>
                <div>{`A: ${a}`}</div>
              </div>
            );
          },
        },
        {
          Header: 'Level',
          accessor: 'DIFFICULTY_LV',
          Cell: (p) => <Rating icon="star" disabled maxRating={5} rating={p.value} />,
          width: 110,
          style: { textAlign: 'center' },
        },
        {
          Header: 'Created date',
          accessor: 'CREATED_DATE',
          width: 150,
          style: { textAlign: 'center' },
        },
        {
          Header: 'Edit',
          accessor: 'ID',
          Cell: (p) => this.showEdit(p.value),
          width: 75,
          style: { textAlign: 'center' },
        },
      ];

      return (
        <Segment>
          <Label attached="top left">Question Database View</Label>
          <Container textAlign="right">
            <Button
              icon
              compact
              labelPosition="right"
              size="mini"
              onClick={() => {
                /* Fetch data from DB */
                this.sendGetQList();
              }}>
              <Icon name="refresh" />
              Update table
            </Button>
          </Container>
          <br />
          <Container>
            <ReactTable
              data={dbDataRows}
              columns={dbHeader}
              defaultPageSize={10}
              loading={qListLoading}
              style={{ height: qTableHeight }}
              className="-striped -highlight"
            />
          </Container>
        </Segment>
      );
    };

    /* DB Info / detail page */
    this.DbPage = () => {
      const { dbDataFile, dbStatus, dbVersion } = this.state;

      return (
        <Segment textAlign="center">
          <Label attached="top left">Database control</Label>
          <Container>
            <Label size="medium">Select active database:</Label>
            <Label size="medium" color="teal" onClick={() => this.openDbFileFn()}>
              {dbDataFile}
            </Label>
            <Icon name="circle" color={DbStatusColors[dbStatus]} />
            <Label horizontal pointing="left">{`version: ${dbVersion}`}</Label>
          </Container>
          <br />
          <Container>
            <Button icon compact labelPosition="right" size="mini" onClick={() => this.reloadDb()}>
              <Icon name="refresh" />
              Refresh DB
            </Button>
            <Button icon compact labelPosition="right" size="mini" onClick={() => this.exportDb()}>
              <Icon name="download" />
              Export DB
            </Button>
          </Container>
        </Segment>
      );
    };

    this.AdvPage = () => {
      const { dbDataFile, dbStatus, pageLoading } = this.state;
      return (
        <Segment textAlign="center">
          <Label attached="top left">Advanced Options</Label>
          <Container>
            <Header>TBD</Header>
          </Container>
        </Segment>
      );
    };

    /* Methods */
    this.openDbFileFn = () => {
      let filePath = null;
      if (dialog !== null) {
        filePath = dialog.showOpenDialog({
          filters: [
            { name: 'DB File', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        });
        if (filePath === undefined) {
          filePath = null;
        }
      } else {
        Console.log(`Error obtaining openfile dialog object ${dialog}`);
      }

      /* Need to update state? */
      if (filePath !== null) {
        this.setState({ dbDataFile: filePath[0] }, () => {
          /* Automatically refresh DB cache */
          this.reloadDb();
        });
      }
    };

    /* Force to reload the database */
    this.reloadDb = () => {
      this.sendDbCmdAsync('reloadDb', {
        newPath: this.state.dbDataFile,
      });
      Console.log('Reload DB requested!');
    };

    /* Get known DB version */
    this.getDbVersion = () => {
      this.sendDbCmdAsync('getDbVersion');
      Console.log('Get DB version requested!');
    };

    /* Export current DB file */
    this.exportDb = () => {
      /* Open Save dialog */
      let saveFilePath = null;
      if (dialog !== null) {
        saveFilePath = dialog.showSaveDialog({
          filters: [{ name: 'DB File', extensions: ['db'] }],
        });
        if (saveFilePath === undefined) {
          saveFilePath = null;
        }
      } else {
        Console.log(`Error obtaining savefile dialog object ${dialog}`);
      }

      /* Send save command */
      if (saveFilePath !== null) {
        this.sendDbCmdAsync('exportDb', {
          newPath: this.state.dbDataFile,
          savePath: saveFilePath,
        });
        Console.log('Export DB requested!');
      }
    };

    /* Insert new question test */
    this.insertQuestion = () => {
      const res = this.sendDbCmdSync('insertNew', {
        cat: 2,
        qd: { q: 'Test Question', o: ['a', 'b', 'c', 'd'], a: ['a'] },
        dl: 5,
      });

      /* Extract result */
      const { cmd, errMsg, data } = res;
      if (cmd === 'insertNew' && data !== null) {
        if (data.success === true) {
          Console.log('Insert data succeeded!');
          /* Auto refresh question list */
          this.sendGetQList();
        } else {
          Console.log(`Insert data failed: ${errMsg}, data: ${data}`);
        }
      }
    };

    /* Helper functions */
    this.sendGetQList = () => {
      /* Set loading status */
      this.setState({ qListLoading: true });
      this.sendDbCmdAsync('getQuestionList');
      this.sendDbCmdAsync('getCategoryList');
      this.sendDbCmdAsync('getCatGroupList');
    };

    /* IPC handlers */
    this.handleIpcAsyncResp = (event, arg) => {
      const { cmd, errMsg, data } = arg;

      switch (cmd) {
        case 'reloadDb':
          if (data.success === true) {
            Console.log('Reload DB succeeded');
          } else {
            Console.log(`Reload DB failed: ${errMsg}, data: ${data}`);
          }
          /* Auto request for status */
          this.sendDbCmdAsync('getStatus');

          /* Auto refresh last question list from DB */
          this.sendGetQList();
          break;

        case 'getStatus':
          if (data.success === true) {
            // Console.log('Get DB status succeeded');
            // Console.log(`DB status: ${data.data.connected}`);
            if (data.data.connected === true) {
              this.setState({ dbStatus: 1 });
            } else {
              this.setState({ dbStatus: 0 });
            }
          } else {
            Console.log(`Get DB status failed: ${errMsg}, data: ${data}`);
            this.setState({ dbStatus: 2 });
          }

          /* Auto request for version */
          this.sendDbCmdAsync('getDbVersion');
          break;

        case 'getDbVersion':
          if (data.success === true) {
            // Console.log('Get DB version succeeded');
            // Console.log(`DB version: ${data.data.version.version}`);
            this.setState({ dbVersion: data.data.version.version });
          } else {
            Console.log(`Get DB version failed: ${errMsg}, data: ${data}`);
            this.setState({ dbVersion: 'unknown' });
          }
          break;

        case 'getQuestionList':
          /* Refresh table height */
          this.recalcQtableSize();
          if (data.success === true) {
            // Console.log('Get question list succeeded');
            this.setState({ dbDataRows: data.data, qListLoading: false });
          } else {
            Console.log(`Get question list failed: ${errMsg}, data: ${data}`);
            this.setState({ dbDataRows: [], qListLoading: true });
          }
          break;

        case 'getCategoryList':
          if (data.success === true) {
            // Console.log('Get category list succeeded');
            this.setState({ dbCatList: data.data, qListLoading: false });
          } else {
            Console.log(`Get category list failed: ${errMsg}, data: ${data}`);
            this.setState({ dbCatList: [], qListLoading: true });
          }
          break;

        case 'getCatGroupList':
          if (data.success === true) {
            // Console.log('Get category group list succeeded');
            this.setState({ dbCatGroupList: data.data, qListLoading: false });
          } else {
            Console.log(`Get category group list failed: ${errMsg}, data: ${data}`);
            this.setState({ dbCatGroupList: [], qListLoading: true });
          }
          break;

        case 'hello':
          Console.log(data);
          break;

        default:
          Console.log(
            `CMD: ${cmd} is not supported yet (ASYNC). Error MSG: ${errMsg}, data: ${JSON.stringify(
              data,
            )}`,
          );
          break;
      }
    };

    /* Connect IPC */
    /* Send SYNC command through IPC */
    this.sendDbCmdSync = (dbCmd, paramObj = null) => {
      const res = ipc.sendSync('db-sync-command-req', { cmd: dbCmd, data: paramObj });
      return res;
    };

    /* Send ASYNC command through IPC */
    this.sendDbCmdAsync = (dbCmd, paramObj = null) =>
      ipc.send('db-async-command-req', { cmd: dbCmd, data: paramObj });

    /* Receive ASYNC response from IPC */
    ipc.on('db-async-command-resp', this.handleIpcAsyncResp);

    /* IPC handler from another renderer */
    this.handleIpcRendererAsyncRecv = (event, arg) => {
      const { cmd, errMsg, data } = arg;

      switch (cmd) {
        case 'launchQEdit':
          if (data.success === true) {
            Console.log('launchQEdit succeeded');
          } else {
            Console.log(`launchQEdit failed: ${errMsg}, data: ${data}`);
          }
          break;

        default:
          Console.log(
            `CMD: ${cmd} is not supported yet (ASYNC). Error MSG: ${errMsg}, data: ${JSON.stringify(
              data,
            )}`,
          );
          break;
      }
    };

    /* Send ASYNC to another renderer */
    this.sendRendererReqAsync = (dbCmd, paramObj = null) =>
      ipc.send('renderer-async-msg-req', { cmd: dbCmd, data: paramObj });

    /* Receive ASYNC from another renderer */
    ipc.on('renderer-async-msg-resp', this.handleIpcRendererAsyncRecv);

    /* Watchdog */
    this.watchdog = () => {
      this.sendDbCmdAsync('getStatus');
    };

    /* Auto request for status, every 30 seconds */
    setInterval(this.watchdog, 30000);

    /* Update watchdog once */
    this.watchdog();

    /* Force to fetch and populate data from DB */
    this.sendDbCmdAsync('getQuestionList');
    this.sendDbCmdAsync('getCategoryList');
    this.sendDbCmdAsync('getCatGroupList');

    /* Window related functions */
    this.resizeDebounceTimer = null;

    this.handleOnResize = () => {
      /* Debouncer */
      if (this.resizeDebounceTimer !== null) clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => {
        this.recalcQtableSize();
      }, 250);
    };
    electron.remote.getCurrentWindow().on('resize', this.handleOnResize);

    /* End of constructor */
  }

  render() {
    const { dbDataFile, dbStatus, pageLoading } = this.state;

    return (
      <Router>
        <Grid container padded="vertically">
          <Grid.Row centered columns={1}>
            <Menu fluid>
              <Menu.Item name="home" position="left" as={NavLink} exact to="/" />
              <Menu.Menu position="right">
                <Menu.Item name="db" position="right" as={NavLink} to="/db">
                  <Label horizontal color={DbStatusColors[dbStatus]}>
                    DB
                  </Label>
                </Menu.Item>
                <Menu.Item name="adv" position="right" as={NavLink} to="/adv">
                  Advance
                </Menu.Item>
              </Menu.Menu>
            </Menu>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Route exact path="/" component={this.HomePage} />
            <Route path="/db" component={this.DbPage} />
            <Route path="/adv" component={this.AdvPage} />
          </Grid.Row>
          <Grid.Row centered columns={1}>
            <Container />
          </Grid.Row>
        </Grid>
      </Router>
    );
  }
}
