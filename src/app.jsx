import React from 'react';

/* Import electron components */
import electron from 'electron';

/* React router components */
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';

/* Semantic UI example */
import { Button, Icon, Container, Grid, Header, Menu, Segment, Label } from 'semantic-ui-react';

/* Get dialog from electron */
const { dialog } = electron.remote;

/* My components */
// import './components/home';
// import Home from './components/home';

/* Alias for my console debug */
const Console = console;

/* React Quill */
// import ReactQuill from 'react-quill';

/* React table */
// import ReactTable from 'react-table';

/* SQLite3 */
// import sqlite3 from 'sqlite3';

/* DB common lib */
// import DB from './components/db';

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
    };

    /* Function bindings */
    // this.updateSqlResult = this.updateSqlResult.bind(this);
    // this.openDbFileFn = this.openDbFileFn.bind(this);

    /* Router target */
    this.HomePage = () => (
      <div>
        <p>This is home</p>
        <Button icon labelPosition="left" onClick={() => this.openDbFileFn()}>
          <Icon name="pause" />
          Hello World!
        </Button>
      </div>
    );

    this.CreatePage = () => (
      <div>
        <h1>Create only</h1>
        <Icon loading name="spinner" />
        <Icon loading name="certificate" />
        <Icon loading name="asterisk" />
      </div>
    );

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
        this.setState({ dbDataFile: filePath[0] });
      }

      /* Automatically refresh DB cache */
      this.refreshDbCache();
    };

    this.refreshDbCache = () => {
      let dbCache = null;
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

    // /* Query database once */
    // let sqdbStat = ''; // SQLite db status
    // const mydb = new DB();
    // mydb.connect();
    // mydb.readAll(this.updateSqlResult);

    // /* Try SQLite3 module */
    // const mySqDb = new sqlite3.Database('./db/sqdb.db');
    // this.sqdbStat = 'OK';
    // mySqDb.serialize(function() {
    //   mySqDb.run('CREATE TABLE lorem (info TEXT)');
    //   let stmt = mySqDb.prepare('INSERT INTO lorem VALUES (?)', () => {
    //     this.sqdbStat = 'SQL error!';
    //   });

    //   for (let i = 0; i < 10; i++) {
    //     stmt.run('Ipsum ' + i);
    //   }

    //   stmt.finalize();

    //   mySqDb.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
    //     console.log(row.id + ': ' + row.info);
    //   });
    // });

    // mySqDb.close();
  }

  updateSqlResult(value) {
    this.setState({ tempdatas: value });
  }

  // openDbFileFn() {
  //   let filePath = null;
  //   if (dialog !== null) {
  //     filePath = dialog.showOpenDialog({
  //       filters: [
  //         { name: 'DB File', extensions: ['db'] },
  //         { name: 'All Files', extensions: ['*'] },
  //       ],
  //       properties: ['openFile'],
  //     });
  //     if (filePath === undefined) {
  //       filePath = null;
  //     }
  //   } else {
  //     Console.log(`Error obtaining dialog object ${dialog}`);
  //   }

  //   if (filePath !== null) {
  //     this.setState({ dbDataFile: filePath[0] });
  //   }
  // }

  render() {
    // const mydb = new DB();
    // mydb.connect();
    // mydb.readAll(this.updateSqlResult);

    // /* Trial react table */
    // const testDataTbl = [
    //   { name: 'Lala', age: 20, friend: { name: 'lili', age: 23 } },
    //   { name: 'Lulu', age: 12, friend: { name: 'lele', age: 24 } },
    // ];

    // const testDataCols = [
    //   { Header: 'Name', accessor: 'name' },
    //   {
    //     Header: 'Age',
    //     accessor: 'age',
    //     Cell: props => <span className="number">{props.value}</span>,
    //   },
    //   { id: 'friendName', Header: 'Friend Name', accessor: d => d.friend.name },
    //   { Header: () => <span> Friend Age </span>, accessor: 'friend.age' },
    // ];

    const { dbDataFile } = this.state.dbDataFile;

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
                    {this.state.dbDataFile}
                  </Label>
                </Container>
                <br />
                <Container>
                  <Button
                    icon
                    compact
                    labelPosition="right"
                    size="mini"
                    onClick={() => this.refreshDbCache()}>
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
                      <Icon loading name="spinner" />
                      <Icon loading name="certificate" />
                      <Icon loading name="asterisk" />
                    </div>
                  </Container>
                  <Container>{/* <Home /> */}</Container>
                </div>
              </Segment>
              <Segment basic className="App-content">
                <Route exact path="/" component={this.HomePage} />
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
