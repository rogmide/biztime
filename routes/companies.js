const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// ############################################
// GET /companies Get All Companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`select * from companies`);
    return res.json({ companies: results.rows });
  } catch (error) {
    next(error);
  }
});

// ############################################
// GET /companies/[code] Get company by code
router.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query(`SELECT * from companies where code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    const invoices = await db.query(
      ` SELECT id, comp_code, amt, paid, add_date, paid_date 
        from companies as c join invoices as i 
        on c.code = i.comp_code where c.code = $1`,
      [code]
    );
    const industrys = await db.query(
      ` SELECT i.name 
        from companies as c 
        join companies_industrys ci 
        on c.code = ci.companies_code
        join industry as i
        on i.id = ci.industry_id
        where c.code=$1`,
      [code]
    );
    return res.json({
      company: results.rows[0],
      invoices: invoices.rows,
      industrys: industrys.rows,
    });
  } catch (error) {
    next(error);
  }
});

// ############################################
// POST /companies Create new company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      "insert into companies (code, name, description) values ($1, $2, $3) returning *",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ############################################
// PATCH /companies/[code] Update company using the Code
router.patch("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = req.params.code;

    const results = await db.query(
      "update companies set name=$1, description=$2 where code=$3 returning *",
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    return res.status(200).json({ company: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ############################################
// DELETE /companies/[code] Delete a Company by code
router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query("delete from companies where code= $1", [
      code,
    ]);
    return res.send({ msg: "Deleted!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
