/* DB access with SQLite */

/* Load FS module */
import fs from 'fs';

/* Load SQLite3 module */
import sqlite3 from 'sqlite3';

import path from 'path';

/* Alias for my console debug */
const Console = console;

export default class SQDB {
  constructor() {
    Console.log('SQDB Constructor called !!!');

    /* Init */
    this.connection = null;

    this.defDbPath = path.resolve(__dirname, '../..', 'db', 'sqdb.db');

    Console.log(`db file path: ${this.defDbPath}`);

    /* Object state */
    this.state = {
      connected: false,
    };

    /* Get DB status */
    this.getStatus = () =>
      new Promise((resolve) => {
        const retVal = { success: false, errMsg: null, data: null };
        const { connected } = this.state;
        retVal.success = true;
        retVal.errMsg = null;
        retVal.data = {
          connected,
        };
        resolve(retVal);
      });

    /* Connect to SQLite DB */
    // this.connect = (dbPath = './db/sqdb.db') =>
    this.connect = (dbPath = this.defDbPath) =>
      new Promise((resolve, reject) => {
        let activeDbPath = dbPath;
        const retVal = { success: false, errMsg: null, data: null };

        if (!this.state.connected) {
          if (fs.existsSync(activeDbPath)) {
            Console.log(`DB file (${activeDbPath}) exists`);
          } else {
            Console.log(`DB file (${activeDbPath}) doesn't exists. Using default DB.`);
            // activeDbPath = './db/sqdb.db';
            activeDbPath = this.defDbPath;
          }

          /* Connect to db */
          this.connection = new sqlite3.Database(activeDbPath, (err) => {
            if (err !== null) {
              /* Error */
              Console.log(`SQDB connect error: ${err}`);
              Console.log('SQDB not yet connected !!!');

              retVal.success = false;
              retVal.errMsg = `SQDB error code: ${err.name}, ${err.message}`;
              reject(retVal);
            } else {
              /* Good? Now check simple query to see if this is correct DB file */
              this.connection.run(
                'SELECT VERSION_HISTORY AS ver FROM META WHERE ID=(SELECT MAX(ID) FROM META)',
                (err2) => {
                  if (err2 !== null) {
                    Console.log(`SQDB most likely not database file: ${err2}`);
                    retVal.success = false;
                    retVal.errMsg = `SQDB error code: ${err2.name}, ${err2.message}`;
                    reject(retVal);
                  } else {
                    Console.log(`Valid database file ${activeDbPath}.`);

                    /* Set pragmas */
                    this.connection.run('PRAGMA foreign_keys = ON');

                    /* Assume it is already connected */
                    this.state.connected = true;

                    Console.log('SQDB connected !!!');

                    retVal.success = true;
                    retVal.errMsg = null;
                    resolve(retVal);
                  }
                },
              );
            }
          });
        } else {
          Console.log('SQDB is already connected !!!');
          retVal.success = false;
          retVal.errMsg = 'SQDB is already connected!';
          resolve(retVal);
        }
      });

    /* Disconnect from SQLite DB */
    this.disconnect = () =>
      new Promise((resolve, reject) => {
        const retVal = { success: false, errMsg: null, data: null };
        if (this.state.connected) {
          /* Disconnect */
          this.connection.close((err) => {
            if (err !== null) {
              Console.log(`SQDB disconnect error: ${err}`);
              retVal.success = false;
              retVal.errMsg = `SQDB error code: ${err.name}, ${err.message}`;
              reject(retVal);
            } else {
              Console.log('SQDB disconnected!');
              retVal.success = true;
              retVal.errMsg = null;
              resolve(retVal);
            }
          });
          /* Force to disconnected state */
          this.state.connected = false;
        } else {
          Console.log('SQDB is not connected !!!');
          retVal.success = false;
          retVal.errMsg = 'SQDB is not connected!';
          resolve(retVal);
        }
      });

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

    this.getQuestionList = () =>
      new Promise((resolve, reject) => {
        const retVal = { success: false, errMsg: null, data: null };
        if (this.state.connected) {
          /* Prepare statement */
          this.connection.serialize(() => {
            /* Run */
            this.connection.all('SELECT * FROM QUESTIONS', {}, (err, rows) => {
              if (err !== null) {
                Console.log(`SQDB error, cannot get question list: ${err}`);
                retVal.success = false;
                retVal.errMsg = `SQDB error code: ${err.name}, ${err.message}`;
                reject(retVal);
              } else {
                Console.log('SQDB get question list OK!');
                retVal.success = true;
                retVal.errMsg = null;

                /* Convert to proper array of object here */
                const dataRows = [];
                rows.forEach((v) => {
                  const rowObj = {
                    ID: v.ID,
                    CATEGORY: v.CATEGORY,
                    QUESTION_DATA: JSON.parse(v.QUESTION_DATA),
                    DIFFICULTY_LV: v.DIFFICULTY_LV,
                    CREATED_DATE: v.CREATED_DATE,
                    LAST_UPDATED: v.LAST_UPDATED,
                  };
                  dataRows.push(rowObj);
                });
                retVal.data = dataRows;
                resolve(retVal);
              }
            });
          });
        } else {
          Console.log('SQDB is not connected!');
          retVal.success = false;
          retVal.errMsg = 'SQDB is not connected!';
          reject(retVal);
        }
      });

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
                  Console.log(`SQDB error, cannot insert new question: ${err}`);
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
