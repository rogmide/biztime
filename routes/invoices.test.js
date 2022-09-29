process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testComp;
beforeEach(async () => {
  const result1 = await db.query(
    `insert into companies
     (code, name, description) 
     values ('apple', 'Apple Inc.', 'MacBook Pro') 
     returning code, name, description`
  );
  testComp = result1.rows[0];
  const result = await db.query(
    `insert into invoices
     (comp_code, amt) 
     values ('apple', 100) 
     returning *`
  );
  testInv = result.rows[0];
});

afterEach(async () => {
  await db.query("delete from companies");
  await db.query("delete from invoices");
});

afterAll(async () => {
  await db.end();
});

describe("Get /invoices", () => {
  test("Get a list with one invoice", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body.invoices.length).toEqual(1);
  });
});

describe("Get /invoices/:id", () => {
  test("Get a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInv.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.amt).toEqual(100);
  });

  describe("Get /invoices/:id", () => {
    test("Responds with 404 for invalid code", async () => {
      const res = await request(app).get(`/invoices/0`);
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("Post /invoices/", () => {
  test("Create a invoice", async () => {
    const res = await request(app)
      .post(`/invoices`)
      .send({ comp_code: "apple", amt: 100 });
    expect(res.statusCode).toBe(201);
    expect(res.body.invoice.amt).toEqual(100);
  });
});

describe("Patch /invoices/", () => {
  test("Update a single invoice", async () => {
    const res = await request(app)
      .patch(`/invoices/${testInv.id}`)
      .send({ amt: 200 });
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.amt).toEqual(200);
  });
  test("Not invoices found", async () => {
    const res = await request(app).patch(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("Delete /invoice/", () => {
  test("Delete a single invoice", async () => {
    const res = await request(app).delete(`/invoices/${testInv.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "Deleted!" });
  });
});
