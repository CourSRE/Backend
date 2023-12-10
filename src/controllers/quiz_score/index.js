const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const quiz_scoreRouter = express.Router();
quiz_scoreRouter.use(express.json());

// GET all quiz scores
quiz_scoreRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM quiz_score`;

  try {
    db.query(sql, (err, fields) => {
      if (err) {
        console.error(err);
        return response.error(res, "Failed to retrieve quiz scores", err);
      }

      return response.success(res, "Quiz scores retrieved successfully", fields);
    });
  } catch (error) {
    console.error(error);
    return response.error(res, "An error occurred", error);
  }
});

// GET a specific quiz score by ID
quiz_scoreRouter.get('/:quiz_score_id', (req, res) => {
  const { quiz_score_id } = req.params;
  const sql = `SELECT * FROM quiz_score WHERE quiz_score_id = ?`;

  try {
    db.query(sql, [quiz_score_id], (err, fields) => {
      if (err) {
        console.error(err);
        return response.error(res, "Failed to retrieve quiz score", err);
      }

      if (fields.length === 0) {
        return response.notFound(res, "Quiz score not found");
      }

      return response.success(res, "Quiz score retrieved successfully", fields[0]);
    });
  } catch (error) {
    console.error(error);
    return response.error(res, "An error occurred", error);
  }
});

// POST a new quiz score
quiz_scoreRouter.post('/', (req, res) => {
  const { user_id, quiz_id, score } = req.body;
  const quiz_score_id = uuid.v4();

  const sql = `
    INSERT INTO quiz_score 
    (quiz_score_id, user_id, quiz_id, score) 
    VALUES (?, ?, ?, ?)
  `;

  try {
    db.query(sql, [quiz_score_id, user_id, quiz_id, score], (err, result) => {
      if (err) {
        console.error(err);
        return response.error(res, "Failed to add quiz score", err);
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_score_id: quiz_score_id,
        };
        return response.success(res, "Quiz score added successfully", data);
      }

      return response.error(res, "Failed to add quiz score");
    });
  } catch (error) {
    console.error(error);
    return response.error(res, "An error occurred", error);
  }
});

// PUT/update a quiz score by ID
quiz_scoreRouter.put('/:quiz_score_id', (req, res) => {
  const { user_id, quiz_id, score } = req.body;
  const quiz_score_id = req.params.quiz_score_id;

  const sql = `
    UPDATE quiz_score 
    SET user_id=?, quiz_id=?, score=?
    WHERE quiz_score_id=?
  `;

  try {
    db.query(sql, [user_id, quiz_id, score, quiz_score_id], (err, result) => {
      if (err) {
        console.error(err);
        return response.error(res, "Failed to update quiz score", err);
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_score_id: quiz_score_id,
        };
        return response.success(res, "Quiz score updated successfully", data);
      }

      return response.notFound(res, "Quiz score not found");
    });
  } catch (error) {
    console.error(error);
    return response.error(res, "An error occurred", error);
  }
});

// DELETE a quiz score by ID
quiz_scoreRouter.delete('/:quiz_score_id', (req, res) => {
  const quiz_score_id = req.params.quiz_score_id;

  const sql = `
    DELETE FROM quiz_score 
    WHERE quiz_score_id = ?
  `;

  try {
    db.query(sql, [quiz_score_id], (err, result) => {
      if (err) {
        console.error(err);
        return response.error(res, "Failed to delete quiz score", err);
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_score_id: quiz_score_id,
        };
        return response.success(res, "Quiz score deleted successfully", data);
      }

      return response.notFound(res, "Quiz score not found");
    });
  } catch (error) {
    console.error(error);
    return response.error(res, "An error occurred", error);
  }
});

module.exports = quiz_scoreRouter;