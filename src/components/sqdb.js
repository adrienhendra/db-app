/* DB access with SQLite */

/* Load FS module */
import fs from 'fs';

/* Load SQLite3 module */
import sqlite3 from 'sqlite3';

/* Alias for my console debug */
const Console = console;

export default class SQDB {
  constructor() {
    Console.log('SQDB Constructor called !!!');

    /* Init */
    this.connection = null;

    /* Object state */
    this.state = {
      connected: false,
      lastStatus: '',
    };

    /* Bind methods */
    // this.connect = this.connect.bind(this);
    // this.disconnect = this.disconnect.bind(this);
    // this.doSingleQuery = this.doSingleQuery.bind(this);
    // this.updateCategoryList = this.updateCategoryList.bind(this);
    // this.updateQuestionList = this.updateQuestionList.bind(this);
    // this.insertNewQuestion = this.insertNewQuestion.bind(this);

    this.connect = (dbPath = './db/sqdb.db') => {
      if (!this.state.connected) {
        if (fs.existsSync(dbPath)) {
          Console.log(`DB file (${dbPath}) exists`);
          this.state.connected = true;
        } else {
          Console.log(`DB file (${dbPath}) doesn't exists`);
          this.state.connected = false;
        }

        /* Connect to db */
        this.connection = new sqlite3.Database(dbPath);
        this.state.lastStatus = 'OK';

        /* Set pragmas */
        this.connection.run('PRAGMA foreign_keys = ON');

        Console.log('SQDB connected !!!');
      } else {
        Console.log('SQDB is already connected !!!');
      }
      return this.state.connected;
    };

    this.disconnect = () => {
      if (this.state.connected) {
        /* Disconnect */
        this.connection.close((err) => {
          this.state.lastStatus = err;
        });
        this.state.connected = false;
        Console.log('SQDB disconnected !!!');
      } else {
        Console.log('SQDB is not connected !!!');
      }
    };

    /* Main query function */
    this.doSingleQuery = (sqlStatement, callbackFn = null) => {
      let isOk = false;
      if (this.state.connected) {
        /* Prepare statement */
        this.connection.serialize(() => {
          this.connection.all(sqlStatement, callbackFn);
        });

        // let sql = this.connection.prepare(sqlStatement);
        // sql.finalize();

        // retVal =
        isOk = true;
      } else {
        Console.log('SQDB is not connected !!!');
        isOk = false;
      }

      return isOk;
    };

    /* Application specific queries */
    this.updateCategoryList = () => {
      let isOk = false;
      if (this.state.connected) {
        Console.log('updateCategoryList: TODO!');
      } else {
        Console.log('SQDB is not connected !!!');
        isOk = false;
      }
      return isOk;
    };

    this.updateQuestionList = () => {
      let isOk = false;
      if (this.state.connected) {
        Console.log('updateQuestionList: TODO!');
      } else {
        Console.log('SQDB is not connected !!!');
        isOk = false;
      }
      return isOk;
    };

    this.insertNewQuestion = (category, questionData, difficultyLv) =>
      new Promise((resolve, reject) => {
        const retVal = { success: false, errMsg: null, data: null };
        if (this.state.connected) {
          /* Prepare statement */
          this.connection.serialize(() => {
            /* Run */
            this.connection.run(
              'INSERT INTO QUESTIONS (CATEGORY, QUESTION_DATA, DIFFICULTY_LV) VALUES($cat, $qd, $dl)',
              {
                $cat: category,
                $qd: questionData,
                $dl: difficultyLv,
              },
              (err) => {
                if (err !== null) {
                  Console.log(`SQDB error: ${err}`);
                  retVal.success = false;
                  retVal.errMsg = `SQDB error code: ${err.name}, ${err.message}`;
                  reject(retVal);
                } else {
                  Console.log('SQDB insert new question OK!');
                  retVal.success = true;
                  retVal.errMsg = null;
                  resolve(retVal);
                }
              },
            );
          });
        } else {
          Console.log('SQDB is not connected!');
          retVal.success = false;
          retVal.errMsg = 'SQDB is not connected!';
          reject(retVal);
        }
      });
  }
}
