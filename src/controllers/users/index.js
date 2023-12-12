const express = require("express")
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const multer = require("multer");
const profileStorage = require("../../config/storage/profileStorage");
const uuid = require('uuid');

const usersRouter = express.Router()
usersRouter.use(express.json());

usersRouter.use(express.json())

// // Fungsi untuk mendapatkan data dari tabel users dan quiz_score
// async function fetchUserData() {
//   try {
//     // Adjust the query to use the correct column names
//     const usersQuery = "SELECT user_id AS id, fullname AS fullName FROM users";
//     const usersData = await db.query(usersQuery);

//     console.log("usersData:", usersData); // Log the retrieved user data

//     // Check if rows are undefined
//     if (!usersData.rows) {
//       console.error("No rows found in usersData");
//       return []; // Return an empty array or handle it as needed
//     }

//     // Fetch quiz scores for each user
//     const usersWithScores = await Promise.all(
//       usersData.rows.map(async (user) => {
//         const scoresQuery = "SELECT score FROM quiz_score WHERE user_id = $1";
//         const scoresData = await db.query(scoresQuery, [user.id]);

//         // Adding scores to the user object
//         return { ...user, scores: scoresData.rows.map((row) => row.score) };
//       })
//     );

//     return usersWithScores;
//   } catch (error) {
//     throw new Error(`Error fetching user data: ${error.message}`);
//   }
// }

// // Fungsi untuk menghitung rank
// function calculateRank(data) {
//   // Sorting data berdasarkan averageScore dari yang tertinggi
//   const sortedData = data.sort((a, b) => b.averageScore - a.averageScore);

//   // Assigning rank based on sorted order
//   sortedData.forEach((item, index) => {
//     item.rank = index + 1;
//   });

//   return sortedData;
// }

// // Fungsi untuk menyusun data
// async function prepareData() {
//   try {
//     // Mendapatkan data dari tabel users dan quiz_score
//     const usersData = await fetchUserData();

//     // Verifikasi bahwa data yang diperoleh tidak undefined atau null
//     if (!usersData) {
//       throw new Error("Failed to fetch data");
//     }

//     // Menggabungkan data
//     const combinedData = usersData.map((user) => {
//       // Verifikasi bahwa user.scores adalah array dan tidak undefined atau null
//       const averageScore = Array.isArray(user.scores) ? calculateAverageScore(user.scores) : 0;

//       return {
//         rank: 0, // Rank akan dihitung setelahnya
//         id: user.id,
//         studentChapter: user.studentChapter, // Assuming studentChapter is already available
//         percent: user.percent, // Assuming percent is already available
//         averageScore: averageScore,
//       };
//     });

//     // Menghitung rank
//     const rankedData = calculateRank(combinedData);

//     // Mengisi nilai rank ke dalam respon
//     const responseData = rankedData.map((item, index) => ({
//       rank: item.rank,
//       id: item.id,
//       studentChapter: item.studentChapter,
//       percent: item.percent,
//       averageScore: item.averageScore,
//     }));

//     return responseData;
//   } catch (error) {
//     throw new Error(`Error preparing data: ${error.message}`);
//   }
// }

// // Endpoint GET untuk mendapatkan data pengguna sesuai format yang diinginkan
// usersRouter.get("/", async (req, res) => {
//   try {
//     const data = await prepareData();
//     res.json({ success: true, data: data, message: "Data users berhasil didapatkan" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });

usersRouter.get('/profile/:user_id', (req, res) => {
  const userId = req.params.user_id;

  const query = `
    SELECT
      u.user_id,
      u.fullname,
      a.username,
      u.student_chapter_id,
      sc.student_chapter_name,
      a.email,
      u.profile_picture,
      u.title
    FROM
      users u
    JOIN
      auth a ON u.auth_id = a.auth_id
    JOIN
      student_chapters sc ON u.student_chapter_id = sc.student_chapter_id
    WHERE
      u.user_id = ?;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length === 0) {
        res.status(404).send('User not found');
      } else {
        // Extract user_info from the result
        const user_info = result[0];

        // Create the desired response structure
        const response = {
          user_id: user_info.user_id,
          fullname: user_info.fullname,
          username: user_info.username,
          student_chapter_id: user_info.student_chapter_id,
          student_chapter_name: user_info.student_chapter_name,
          email: user_info.email,
          profile_picture: user_info.profile_picture,
          title: user_info.title
        };

        res.json(response);
      }
    }
  });
});

const upload = multer({ storage: profileStorage });
usersRouter.post("/profile", upload.single("profile_picture"), (req, res) => {
  const { fullname, role, title, birthday, gender, auth_id, student_chapter_id } = req.body;

  if (!fullname || !role || !auth_id || !student_chapter_id) {
    return res
      .status(400)
      .json({ status: "error", message: "Incomplete request data" });
  }

  const user_id = uuid.v4();
  const filename = req.file?.filename || "";
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = `
    INSERT INTO users (user_id, fullname, profile_picture, role, title, birthday, gender, auth_id, student_chapter_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    fullname,
    filename,
    role,
    title,
    birthday,
    gender,
    auth_id,
    student_chapter_id,
    created_at,
    updated_at,
  ];

  try {
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
          user_id: user_id,
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

usersRouter.put("/profile/:idUser", upload.single("profile_picture"), (req, res) => {
  const user_id = req.params?.idUser;
  const { fullname, role, title, birthday, gender } = req.body;
  const filename = req.file?.filename || "";
  const updated_at = new Date().toISOString();

  let sql;
  let values;

  if (filename) {
    // Update both fullname, role, and profile_picture
    sql = `UPDATE users SET fullname = ?, profile_picture = ?, role = ?, title = ?, birthday = ?, gender = ?, updated_at = ? WHERE user_id = ?`;
    values = [fullname, filename, role, title, birthday, gender, updated_at, user_id];
  } else {
    // Update only fullname and role, leave profile_picture unchanged
    sql = `UPDATE users SET fullname = ?, role = ?, title = ?, birthday = ?, gender = ?, updated_at = ? WHERE user_id = ?`;
    values = [fullname, role, title, birthday, gender, updated_at, user_id];
  }

  try {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }
      if (result.affectedRows > 0) {
        const data = {
          isSuccess: true,
          message: "Update Data Successfully",
        };
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});


usersRouter.delete("/profile", (req, res) => {
  const { user_id } = req.body;
  const sql = 'DELETE FROM users WHERE user_id = ?';

  try {
    db.query(sql, [user_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "An error occurred" });
      }

      if (result?.affectedRows > 0) {
        const data = {
          isDeleted: result.affectedRows,
        };
        return res.status(200).json({ status: "success", data, message: "Data Deleted Successfully" });
      } else {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = usersRouter