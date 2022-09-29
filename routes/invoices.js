const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// ############################################
// GET /invoices Get All invoices
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (error) {
    next(error);
  }
});

// ############################################
// GET /invoices/[id] Get invoices by id
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const results = await db.query(`select * from invoices where id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ############################################
// POST /invoices Create new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "insert into invoices (comp_code, amt) values ($1, $2) returning *",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ############################################
// PATCH /invoice/[id] Update invoice using the id
router.patch("/:id", async (req, res, next) => {
  try {
    const { amt } = req.body;
    const id = req.params.id;
    const results = await db.query(
      "update invoices set amt=$1 where id=$2 returning *",
      [amt, id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
    }
    return res.status(200).json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ############################################
// DELETE /invoices/[id] Delete a invoices by id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const results = await db.query("delete from invoices where id= $1", [id]);
    return res.send({ msg: "Deleted!" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
