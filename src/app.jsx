/* React */
import React from 'react';

/* Electrons */
import electron, { ipcRenderer } from 'electron';

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
} from 'semantic-ui-react';

/* React table */
import ReactTable from 'react-table';

/* My components */
// import './components/home';
// import Home from './components/home';

/* Get dialog from electron */
const { dialog } = electron.remote;

/* My IPC */
const ipc = ipcRenderer;

/* Alias for my console debug */
const Console = console;

/* React Quill */
// import ReactQuill from 'react-quill';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      text: '', // You can also pass a Quill Delta here
      data: {
        rating: 0,
        lastUpdate: 'unknown',
      },
      tempdatas: [],
      dbDataFile: './db/sqdb.db',
      dbStatus: -1,
      pageLoading: false,
    };

    /* Router target */
    this.HomePage = () => (
      <div>
        <p>This is home</p>
        <Button icon labelPosition="left" onClick={() => this.openDbFileFn()}>
          <Icon name="pause" />
          Hello World!
        </Button>

        {/* Add data */}
        <Button icon labelPosition="left" onClick={() => this.insertQuestion()}>
          <Icon name="add" />
          Insert data
        </Button>

        {/* IPC data */}
        <Button icon labelPosition="left" onClick={() => this.sendDbCmdAsync('hello')}>
          <Icon name="eye" />
          IPC test
        </Button>
      </div>
    );

    this.ViewPage = () => {
      /* TODO: Fetch data from DB */

      /* Create dummy table data */
      const testDataTbl = [
        { name: 'Lala', age: 20, friend: { name: 'lili', age: 23 } },
        { name: 'Lulu', age: 12, friend: { name: 'lele', age: 24 } },
      ];
      const testDataCols = [
        { Header: 'Name', accessor: 'name' },
        {
          Header: 'Age',
          accessor: 'age',
          Cell: (p) => <span className="number">{p.value}</span>,
        },
        { id: 'friendName', Header: 'Friend Name', accessor: (d) => d.friend.name },
        { Header: () => <span> Friend Age </span>, accessor: 'friend.age' },
      ];
      return <ReactTable data={testDataTbl} columns={testDataCols} />;
    };

    this.CreatePage = () => {
      const dataOptions = [
        { key: '1', value: '1', text: 'LALA' },
        { key: '2', value: '2', text: 'LILI' },
        { key: '3', value: '3', text: 'LULU' },
      ];
      return (
        <div>
          <h1>Create only</h1>
          <Icon loading name="spinner" />
          <Icon loading name="certificate" />
          <Icon loading name="asterisk" />
          <Dropdown placeholder="Category" multiple search selection options={dataOptions} />
        </div>
      );
    };

    this.UpdatePage = () => (
      <div>
        <h1>This is Update app</h1>
      </div>
    );

    this.DeletePage = () => (
      <div>
        <h1>This is Delete Page</h1>
      </div>
    );

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
        Console.log(`Error obtaining dialog object ${dialog}`);
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
        } else {
          Console.log(`Insert data failed: ${errMsg}, data: ${data}`);
        }
      }
    };

    // /* React Quill setup */
    // this.modules = {
    //   formula: true,
    //   toolbar: [
    //     [{ header: [1, 2, 3, false] }],
    //     ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    //     [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    //     ['link', 'image'],
    //     ['clean'],
    //     ['formula'],
    //   ],
    // };

    // /* React Quill formats */
    // this.formats = [
    //   'header',
    //   'bold',
    //   'italic',
    //   'underline',
    //   'strike',
    //   'blockquote',
    //   'list',
    //   'bullet',
    //   'indent',
    //   'link',
    //   'image',
    // ];

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
          break;

        case 'getStatus':
          if (data.success === true) {
            Console.log('Get DB status succeeded');
            Console.log(`DB status: ${data.data.connected}`);
            if (data.data.connected === true) {
              this.setState({ dbStatus: 1 });
            } else {
              this.setState({ dbStatus: 0 });
            }
          } else {
            Console.log(`Get DB status failed: ${errMsg}, data: ${data}`);
            this.setState({ dbStatus: -1 });
          }
          break;

        case 'hello':
          Console.log(data);
          break;

        default:
          Console.log(
            `CMD: ${cmd} is not supported yet (ASYNC). Error MSG: ${errMsg}, data: ${data}`,
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

    /* End of constructor */
    /* Auto request for status */
    this.sendDbCmdAsync('getStatus');
  }

  updateSqlResult(value) {
    this.setState({ tempdatas: value });
  }

  render() {
    const { dbDataFile, dbStatus, pageLoading } = this.state;
    /* Calculate status color */
    let dbStatusColor = 'yellow'; // Assume unknown

    if (dbStatus === 0) {
      /* Not connected */
      dbStatusColor = 'red';
    } else if (dbStatus === 1) {
      /* Connected */
      dbStatusColor = 'green';
    } else {
      /* Unknown */
      dbStatusColor = 'yellow';
    }

    return (
      <Router>
        <Grid>
          <Grid.Row centered columns={1}>
            <Header>Soepriatna DB App</Header>
          </Grid.Row>
          <Grid.Row centered columns={1}>
            <Grid.Column width={16}>
              <Segment textAlign="center">
                <Container>
                  <Label size="medium">Select active database:</Label>
                  <Label size="medium" color="teal" onClick={() => this.openDbFileFn()}>
                    {dbDataFile}
                  </Label>
                  <Icon name="circle" color={dbStatusColor} />
                </Container>
                <br />
                <Container>
                  <Button
                    icon
                    compact
                    labelPosition="right"
                    size="mini"
                    onClick={() => this.reloadDb()}>
                    <Icon name="refresh" />
                    Refresh DB
                  </Button>
                </Container>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={2}>
            <Grid.Column width={2}>
              <Menu fluid vertical tabular>
                <Menu.Item name="home" as={NavLink} exact to="/" />
                <Menu.Item name="view" as={NavLink} to="/view" />
                <Menu.Item name="create" as={NavLink} to="/create" />
                <Menu.Item name="update" as={NavLink} to="/update" />
                <Menu.Item name="delete" as={NavLink} to="/delete" />
              </Menu>
            </Grid.Column>
            <Grid.Column width={14}>
              <Segment>
                <div>
                  <h2>Welcome to React!</h2>
                  <Button icon labelPosition="left" onClick={() => this.openDbFileFn()}>
                    <Icon name="pause" />
                    Hello World!
                  </Button>
                  <Container>
                    <div>
                      <Icon loading={pageLoading} name="spinner" />
                      <Icon loading={pageLoading} name="certificate" />
                      <Icon loading={pageLoading} name="asterisk" />
                    </div>
                  </Container>
                  <Container>{/* <Home /> */}</Container>
                </div>
              </Segment>
              <Segment basic className="App-content">
                <Route exact path="/" component={this.HomePage} />
                <Route path="/view" component={this.ViewPage} />
                <Route path="/create" component={this.CreatePage} />
                <Route path="/update" component={this.UpdatePage} />
                <Route path="/delete" component={this.DeletePage} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row centered columns={1}>
            <Header>By Adrien Soepriatna (c) 2018</Header>
          </Grid.Row>
        </Grid>
      </Router>
    );
  }
}
