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
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.doSingleQuery = this.doSingleQuery.bind(this);
    this.updateCategoryList = this.updateCategoryList.bind(this);
    this.updateQuestionList = this.updateQuestionList.bind(this);
    this.insertNewQuestion = this.insertNewQuestion.bind(this);
  }

  connect(dbPath = './db/sqdb.db') {
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

      Console.log('SQDB connected !!!');
    } else {
      Console.log('SQDB is already connected !!!');
    }
    return this.state.connected;
  }

  disconnect() {
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
  }

  /* Main query function */
  doSingleQuery(sqlStatement, callbackFn = null) {
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
  }

  /* Application specific queries */
  updateCategoryList() {
    let isOk = false;
    if (this.state.connected) {
    } else {
      Console.log('SQDB is not connected !!!');
      isOk = false;
    }
    return isOk;
  }

  updateQuestionList() {
    let isOk = false;
    if (this.state.connected) {
    } else {
      Console.log('SQDB is not connected !!!');
      isOk = false;
    }
    return isOk;
  }

  insertNewQuestion(category, questionData, difficultyLv) {
    let isOk = false;
    if (this.state.connected) {
      /* Prepare statement */
      this.connection.serialize(() => {
        this.connection.run(
          'INSERT INTO QUESTIONS (CATEGORY, QUESTION_DATA, DIFFICULTY_LV) VALUES($cat, $qd, $dl)',
          {
            $cat: category,
            $qd: questionData,
            $dl: difficultyLv,
          },
        );
      });
      isOk = true;
    } else {
      Console.log('SQDB is not connected !!!');
      isOk = false;
    }
    return isOk;
  }

  /* !!!!!!!!!!!!!!!!!!!!!!!!!!!! */
  readAll(callbackFn) {
    this.connection = null;

    /* Call callback function */
    if (callbackFn !== null) callbackFn();

    // const sqlTxt = 'SELECT * FROM `questions` WHERE 1';
    // let result = null;
    // this.connection.query(sqlTxt, (err, res, field) => {
    //   if (err) {
    //     Console.log('Query error!');
    //     result = null;
    //   } else {
    //     Console.log(res);
    //     Console.log(field);

    //     result = [];
    //     let i = 0;
    //     for (i = 0; i < res.length; i += 1) {
    //       const obj = {
    //         id: res[i].id,
    //         cat_id: res[i].cat_id,
    //         subcat_id: res[i].subcat_id,
    //         level: res[i].level,
    //         quest_text: JSON.parse(res[i].quest_text),
    //         comment: res[i].comment,
    //         date_created: res[i].date_created,
    //         date_modified: res[i].date_modified,
    //       };
    //       result.push(obj);
    //     }
    //     cb(result);
    //   }
    // });

    return result;
  }
}
