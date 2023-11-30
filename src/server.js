// Import
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const response = require("./config/response/index");
const bodyParser = require("body-parser");
// const https = require('https');
// const fs = require('fs');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import Controller
const authController = require("./controllers/auth/index");
const complete_course_statusController = require("./controllers/completed_course_status/index");
const coursesController = require("./controllers/courses/index");
const feedbackController = require("./controllers/feedback/index");
const modulesController = require("./controllers/modules/index");
const quiz_answersController = require("./controllers/quiz_answer/index");
const quiz_questionsController = require("./controllers/quiz_questions/index");
const quizessController = require("./controllers/quizess/index");
const sectionController = require("./controllers/section/index");
const student_chaptersController = require("./controllers/student_chapters/index");
const usersController = require("./controllers/users/index");

// Router Path
app.get("/", (req, res) => {
	response(200, "API Profiler ready to use", "SUCCESS", res);
  });
  
app.use("/api/auth", authController);
app.use("/api/completed_status_course", complete_course_statusController);
app.use("/api/courses", coursesController);
app.use("/api/feedback", feedbackController);
app.use("/api/modules", modulesController);
app.use("/api/quiz_answers", quiz_answersController);
app.use("/api/quiz_questions", quiz_questionsController);
app.use("/api/quizess", quizessController);
app.use("/api/section", sectionController);
app.use("/api/student_chapters", student_chaptersController);
app.use("/api/users", usersController);

app.listen(PORT, () => {
	console.log(`App Run on port: ${PORT}`);
});
