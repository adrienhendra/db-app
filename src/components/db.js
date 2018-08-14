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

    this.setDbParam = (dbPath) => {
      this.dbConnParam = { type: 'sqlite3', path: dbPath };
    };

    this.connect = () => {
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
    };

    this.disconnect = () => {
      this.dbConn.disconnect();
    };

    /* Common SQL functions here */
    this.doSingleQuery = (sqlStatement, callbackFn = null) => {
      if (this.dbConn === null) {
        return null;
      }

      /* Connection is valid */
      return this.dbConn.doSingleQuery(sqlStatement, callbackFn);
    };

    /* Application specific queries */
    this.updateCategoryList = () => {
      this.state.lastCatList = null;
    };

    this.updateQuestionList = () => {
      this.state.lastQuestionList = null;
    };

    this.insertNewQuestion = async (category, questionData, difficultyLv) => {
      if (this.dbConn === null) {
        return null;
      }

      /* Connection is valid */
      const res = await this.dbConn.insertNewQuestion(category, questionData, difficultyLv);
      return res;
    };
  }
}
