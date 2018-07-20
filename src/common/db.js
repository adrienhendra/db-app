// Common DB access

// Load mysql module
import mysql from 'mysql';

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
        console.log(err.code);
        console.log(err.fatal);
      }
    });
  }
}
