import React from 'react';

/* File open dialog */
// import dialog from 'electron';
import electron from 'electron';
// const { dialog } = require('electron').remote;
const { dialog } = electron.remote;

/* React router components */
import { BrowserRouter as Router, Route, NavLink, Link } from 'react-router-dom';

/* Semantic UI example */
import {
  Button,
  Icon,
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment,
  Sidebar,
} from 'semantic-ui-react';

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
    };

    /* Function bindings */
    // this.updateSqlResult = this.updateSqlResult.bind(this);
    this.openFileButtonFn = this.openFileButtonFn.bind(this);

    /* Router target */
    this.Home = () => (
      <div>
        <p>This is home</p>
        <Button icon labelPosition="left" onClick={() => this.openFileButtonFn()}>
          <Icon name="pause" />
          Hello World!
        </Button>
      </div>
    );

    this.ComposeApp = () => (
      <div>
        <h1>Test only</h1>
        <Icon loading name="spinner" />
        <Icon loading name="certificate" />
        <Icon loading name="asterisk" />
      </div>
    );

    this.ViewApp = () => (
      <div>
        <h1>This is view app</h1>
      </div>
    );

    this.PrintApp = () => (
      <div>
        <h1>This is print app</h1>
      </div>
    );

    this.AboutApp = () => (
      <div>
        <p>About Hello World</p>
      </div>
    );

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

  openFileButtonFn() {
    Console.log(dialog);
    Console.log(dialog.showOpenDialog({ properties: ['openFile'] }));
  }

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

    return (
      // <Router>
      //   <div>
      //     <Sidebar.Pushable as={Segment}>
      //       <Sidebar as={Menu} animation="push" direction="top" visible>
      //         <Menu.Item name="home" as={NavLink} exact to="/">
      //           <Icon name="home" />
      //           Home
      //         </Menu.Item>
      //         <Menu.Item name="view" as={NavLink} to="/view">
      //           <Icon name="asterisk" />
      //           View
      //         </Menu.Item>
      //         <Menu.Item name="compose" as={NavLink} to="/compose">
      //           <Icon name="compose" />
      //           Compose
      //         </Menu.Item>
      //         <Menu.Item name="print" as={NavLink} to="/print">
      //           <Icon name="print" />
      //           Print
      //         </Menu.Item>
      //         <Menu.Item name="about" as={NavLink} to="/about" position="right">
      //           <Icon name="help circle" />
      //           About
      //         </Menu.Item>
      //       </Sidebar>
      //       <Sidebar.Pusher>
      //         <Segment basic className="App-content">
      //           <Route exact path="/" component={this.Home} />
      //           <Route path="/view" component={ViewApp} />
      //           <Route path="/compose" component={this.ComposeApp} />
      //           <Route path="/print" component={PrintApp} />
      //           <Route path="/about" component={AboutApp} />
      //         </Segment>
      //       </Sidebar.Pusher>
      //     </Sidebar.Pushable>
      //   </div>
      // </Router>

      <div>
        <header className="toolbar toolbar-header">
          <h1 className="title">Soepriatna DB App</h1>
          <div className="toolbar-actions">
            <div className="btn-group">
              <button className="btn btn-default">
                <span className="icon icon-home" />
              </button>
            </div>
          </div>
        </header>

        <div className="window-content">
          <div className="pane-group">
            <div className="pane-sm sidebar">A</div>

            <div className="pane">
              <div>
                <h2>Welcome to React!</h2>
                <Button icon labelPosition="left" onClick={() => this.openFileButtonFn()}>
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
            </div>
          </div>
        </div>

        <footer className="toolbar toolbar-footer">
          <h1 className="title">By Adrien Soepriatna (c) 2018</h1>
        </footer>
      </div>
    );
  }
}
