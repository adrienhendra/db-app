/* Common DB access */

/* Load mysql module */
import mysql from 'mysql';

/* Alias for my console debug */
const Console = console;

export default class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: 'as-server.local',
      user: 'soep-db-app',
      password: 'Nike@12345',
      database: 'soep-db-app',
    });
  }

  connect() {
    this.connection.connect(err => {
      if (err) {
        Console.log(`[ERR] DB Connection, Code: ${err.code}, Fatal?: ${err.fatal}`);
      } else {
        Console.log('[AOK] DB Connected ...');
      }
    });
  }

  readAll(cb) {
    const sqlTxt = 'SELECT * FROM `questions` WHERE 1';
    let result = null;
    this.connection.query(sqlTxt, (err, res, field) => {
      if (err) {
        Console.log('Query error!');
        result = null;
      } else {
        Console.log(res);
        Console.log(field);

        result = [];
        let i = 0;
        for (i = 0; i < res.length; i += 1) {
          const obj = {
            id: res[i].id,
            cat_id: res[i].cat_id,
            subcat_id: res[i].subcat_id,
            level: res[i].level,
            quest_text: JSON.parse(res[i].quest_text),
            comment: res[i].comment,
            date_created: res[i].date_created,
            date_modified: res[i].date_modified,
          };
          result.push(obj);
        }
        cb(result);
      }
    });

    return result;
  }
}
