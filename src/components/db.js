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
  }

  connect() {
    this.dbConn.connect();
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
}
