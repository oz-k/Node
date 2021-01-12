const path = require('path');
require('dotenv').config({path:path.join(__dirname, '/../resources/info.env')});

const development = {
    username: process.env.DB_NAME,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    host: "127.0.0.1",
    dialect: "mysql",
    logging:false
}

const test = {
  username: "root",
  password: null,
  database: "database_test",
  host: "127.0.0.1",
  dialect: "mysql"
}

const production = {
  username: "root",
  password: null,
  database: "database_production",
  host: "127.0.0.1",
  dialect: "mysql"
}

module.exports = {development, production, test}