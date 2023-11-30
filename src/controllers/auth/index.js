const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');
const bcrypt = require('bcrypt');

const authRouter = express.Router()
authRouter.use(express.json());

authRouter.get('/:idAuth', (req, res) => {
  const sql = `SELECT * FROM auth WHERE auth_id = "${req.params?.idAuth}"`

  try {
    db.query(sql, (err, fields) => {
      const data = {}
      response(200, fields, "SUCCESS", res)
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: "error", message: "An error occured" })
  }
});

authRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ status: "error", message: "Password is required" });
    }

    // Generate salt using bcrypt
    const salt = await bcrypt.genSalt(10);

    // Hash password using bcrypt with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();

    const sql = 'INSERT INTO auth (auth_id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    const values = [uuid.v4(), email, hashedPassword, created_at, updated_at];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          auth_id: values[0], // assuming auth_id is the first value in the array
        };
        return res.status(200).json({
          status: "success",
          data,
          message: "Data Added Successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

authRouter.put('/:idAuth', async (req, res) => {
  const { email, password } = req.body;
  const authId = req.params.idAuth;

  try {
    if (!password) {
      return res.status(400).json({ status: "error", message: "Password is required" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const updated_at = new Date().toISOString();

    const sql = 'UPDATE auth SET email=?, password=?, updated_at=? WHERE auth_id=?';
    const values = [email, hashedPassword, updated_at, authId];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          auth_id: authId,
        };
        return res.status(200).json({
          status: "success",
          data,
          message: "Data Updated Successfully",
        });
      } else {
        return res.status(404).json({ status: "error", message: "Auth not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

authRouter.delete('/:idAuth', (req, res) => {
  const authId = req.params.idAuth;

  const sql = 'DELETE FROM auth WHERE auth_id=?';

  try {
    db.query(sql, [authId], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          auth_id: authId,
        };
        return res.status(200).json({
          status: "success",
          data,
          message: "Data Deleted Successfully",
        });
      } else {
        return res.status(404).json({ status: "error", message: "Auth not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

module.exports = authRouter