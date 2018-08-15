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

    /* Set special DB parameters */
    this.setDbParam = (dbPath) => {
      this.dbConnParam = { type: 'sqlite3', path: dbPath };
      Console.log(this.dbConnParam);
    };

    /* Get DB status */
    this.getStatus = async () => {
      const res = await this.dbConn.getStatus();
      return res;
    };

    /* Connect to DB */
    this.connect = async () => {
      const dbParam = this.dbConnParam;
      let res = null;
      if (dbParam !== null) {
        if (dbParam.type === 'sqlite3') {
          res = await this.dbConn.connect(dbParam.path);
        } else {
          Console.log(`DB ${dbParam.type} is not supported yet. Defaults to SQLite3`);
          /* Defaults to local SQLITE DB */
          res = await this.dbConn.connect();
        }
      } else {
        /* Defaults to local SQLITE DB */
        Console.log('DB no param supplied. Defaults to SQLite3');
        res = await this.dbConn.connect();
      }

      return res;
    };

    /* Disconnect from DB */
    this.disconnect = async () => {
      const res = this.dbConn.disconnect();
      return res;
    };

    /* Reload DB */
    this.reloadDb = async (dbPath) => {
      let res = null;
      /* Disconnect from DB if it is already connected */
      if (this.dbConn !== null) {
        res = await this.disconnect();
      }

      /* Update DB path */
      this.setDbParam(dbPath);

      /* Reconnect DB with new file */
      res = await this.connect();

      return res;
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
