process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testUser;
beforeEach(async () => {
  const result = await db.query(
    `insert into users
     (code, name, description) 
     values ('apple', 'Apple Inc.', 'MacBook Pro') 
     returning id, name, type`
  );
  testUser = result.rows[0];
});

afterEach(async () => {
  await db.query("delete from users");
});

afterAll(async () => {
  await db.end();
});
