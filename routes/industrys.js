const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`select * from industry`);
    let industry = [];
    for (let i = 0; i < results.rows.length; i++) {
      const results2 = await db.query(`
        SELECT c.code
        from companies as c
        join companies_industrys ci
        on c.code = ci.companies_code
        join industry as i
        on i.id = ci.industry_id
        where i.id in(${results.rows[i].id})
    `);
      industry.push({ industry: results.rows[0], companies: results2.rows });
    }
    return res.send(industry);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const results = await db.query(
      "insert into industry (name) values ($1) returning *",
      [name]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
