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
    this.connection.connect((err) => {
      if (err) {
        Console.log(`[ERR] DB Connection, Code: ${err.code}, Fatal?: ${err.fatal}`);
      } else {
        Console.log('[AOK] DB Connected ...');
      }
    });
  }
}
