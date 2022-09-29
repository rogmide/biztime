process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testComp;
beforeEach(async () => {
  const result = await db.query(
    `insert into companies
     (code, name, description) 
     values ('apple', 'Apple Inc.', 'MacBook Pro') 
     returning code, name, description`
  );
  testComp = result.rows[0];
});

afterEach(async () => {
  await db.query("delete from companies");
});

afterAll(async () => {
  await db.end();
});

describe("Get /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testComp] });
  });
});

describe("Get /companies/:code", () => {
  test("Get a single company", async () => {
    const res = await request(app).get(`/companies/${testComp.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testComp, invoices: [] });
  });

  describe("Get /companies/:code", () => {
    test("Responds with 404 for invalid code", async () => {
      const res = await request(app).get(`/companies/notHere`);
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("Post /companies/", () => {
  test("Create a company", async () => {
    const res = await request(app)
      .post(`/companies`)
      .send({ code: "TestCode", name: "TestName", description: "TestDes" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: "TestCode", name: "TestName", description: "TestDes" },
    });
  });
});

describe("Patch /companies/", () => {
  test("Update a single company", async () => {
    const res = await request(app)
      .patch(`/companies/${testComp.code}`)
      .send({ code: "apple", name: "TestName", description: "TestDes" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: "apple", name: "TestName", description: "TestDes" },
    });
  });
  test("Not company found", async () => {
    const res = await request(app).patch(`/companies/NotACompany`);
    expect(res.statusCode).toBe(404);
  });
});

describe("Delete /company/", () => {
  test("Delete a single company", async () => {
    const res = await request(app).delete(`/companies/${testComp.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "Deleted!" });
  });
});
