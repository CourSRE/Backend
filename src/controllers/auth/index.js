const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const { verifyToken } = require("../../middleware/index");
const secretKey = process.env.JWT_SECRET_KEY;
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const profileStorage = require("../../config/storage/profileStorage");
const multer = require('multer');

const studentChaptersTable = [];

const fetchStudentChaptersFromDatabase = async () => {
  try {
    // Replace 'SELECT * FROM student_chapters' with your actual query
    const query = 'SELECT * FROM student_chapters';

    // Using the mysql package
    db.query(query, (err, rows) => {
      if (err) {
        console.error('Error fetching student chapters from the database:', err);
      } else {
        // Populate studentChaptersTable with the fetched data
        studentChaptersTable.push(...rows);
      }
    });
  } catch (error) {
    console.error('Error fetching student chapters from the database:', error);
  }
};

// Call the function to fetch and populate the studentChaptersTable
fetchStudentChaptersFromDatabase();

const authRouter = express.Router()
authRouter.use(express.json());

const upload = multer({ storage: profileStorage });
authRouter.post('/register', upload.single('profile_picture'), async (req, res) => {
  try {
    // Destructure request body
    const {
      fullname,
      username,
      email,
      birthday,
      gender,
      password,
      referral_code,
    } = req.body;

    // Check if referral code exists in student_chaptersTable
    const studentChapter = studentChaptersTable.find(
      (chapter) => chapter.referral_code === referral_code
    );

    if (!studentChapter) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Generate UUIDs for auth_id, and user_id,
    const auth_id = uuid.v4();
    const user_id = uuid.v4();

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a database transaction
    db.beginTransaction(async (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        // Create auth entry
        const authEntry = {
          auth_id,
          username,
          email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Insert auth entry into the database
        db.query('INSERT INTO auth SET ?', authEntry, (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error saving auth entry to the database:', err);
              res.status(500).json({ error: 'Internal server error' });
            });
          }

          console.log('Auth entry saved to the database:', result);

          // Create user entry
          const userEntry = {
            user_id,
            auth_id,
            student_chapter_id: studentChapter.student_chapter_id,
            fullname,
            profile_picture: req.file.filename,
            role: 'MEMBER',
            birthday,
            gender,
            created_at: new Date(),
            updated_at: new Date(),
          };

          // Insert user entry into the database
          db.query('INSERT INTO users SET ?', userEntry, (err, result) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error saving user entry to the database:', err);
                res.status(500).json({ error: 'Internal server error' });
              });
            }

            console.log('User entry saved to the database:', result);

            // Commit the transaction if both queries were successful
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({ error: 'Internal server error' });
                });
              }

              res.status(201).json({ message: 'Registration successful' });
            });
          });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ status: "error", message: "Password is required" });
    }

    // Check if the provided email is in the username or email column
    const sql = 'SELECT * FROM auth WHERE BINARY username = ? OR email = ?';
    const values = [email, email];

    db.query(sql, values, async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (results.length > 0) {
        // There is a match for the provided email or username
        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (isValidPassword) {
          // Password is valid, generate JWT token
          const token = jwt.sign({ userId: user.auth_id }, secretKey, { expiresIn: '1h' });

          const data = {
            isSuccess: true,
            auth_id: user.auth_id,
          };

          return res.status(200).json({
            status: "success",
            data,
            token,
            message: "Login successful",
          });
        } else {
          // Password is invalid
          return res.status(401).json({ status: "error", message: "Invalid password" });
        }
      } else {
        // No match found for the provided email or username
        return res.status(404).json({ status: "error", message: "User not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = authRouter