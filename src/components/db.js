/* Common DB access */

/* Uncomment the desired database backend to use */
// import MYSQLDB from './mysql';
import SQDB from './sqdb';

/* Uncomment desired DB connection type */
// const MYDB = MYSQLDB;
const MYDB = SQDB;

/* Alias for my console debug */
const Console = console;

export default class DB {
  constructor() {
    Console.log('DB constructed!');
    this.dbConn = new MYDB();
    this.dbConnParam = null;
    this.state = {
      lastCatList: null,
      lastQuestionList: null,
    };

    /* Bind methods */
    this.setDbParam = this.setDbParam.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.doSingleQuery = this.doSingleQuery.bind(this);
    this.updateCategoryList = this.updateCategoryList.bind(this);
    this.updateQuestionList = this.updateQuestionList.bind(this);
    this.insertNewQuestion = this.insertNewQuestion.bind(this);
  }

  setDbParam(dbPath) {
    this.dbConnParam = { type: 'sqlite3', path: dbPath };
  }

  connect() {
    const dbParam = this.dbConnParam;
    if (dbParam !== null) {
      if (dbParam.type === 'sqlite3') {
        this.dbConn.connect(dbParam);
      } else {
        Console.log(`DB ${dbParam.type} is not supported yet. Defaults to SQLite3`);
        /* Defaults to local SQLITE DB */
        this.dbConn.connect();
      }
    } else {
      /* Defaults to local SQLITE DB */
      Console.log('DB no param supplied. Defaults to SQLite3');
      this.dbConn.connect();
    }
  }

  disconnect() {
    this.dbConn.disconnect();
  }

  /* Common SQL functions here */
  doSingleQuery(sqlStatement, callbackFn = null) {
    if (this.dbConn === null) {
      return null;
    }

    /* Connection is valid */
    return this.dbConn.doSingleQuery(sqlStatement, callbackFn);
  }

  /* Application specific queries */
  updateCategoryList() {
    this.state.lastCatList = null;
  }

  updateQuestionList() {
    this.state.lastQuestionList = null;
  }

  insertNewQuestion(category, questionData, difficultyLv) {
    if (this.dbConn === null) {
      return null;
    }

    /* Connection is valid */
    return this.dbConn.insertNewQuestion(category, questionData, difficultyLv);
  }
}
