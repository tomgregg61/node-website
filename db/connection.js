"use strict";

import { MongoClient } from "mongodb";

const dbName = "SSP";
const dbUName = encodeURIComponent("tom");
const dbPass = encodeURIComponent("h1lls1de");
const url = `mongodb+srv://${dbUName}:${dbPass}@sspa2.inrnbkn.mongodb.net/?retryWrites=true&w=majority&appName=sspa2`;

const dbClient = new MongoClient(url);

let conn;
let db;

try {
  conn = await dbClient.connect();
} catch (err) {
  console.error("Error connecting to the database", err);
  throw err;
}

db = conn.db(dbName);

export default db;
