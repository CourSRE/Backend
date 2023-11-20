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

// Router Path
app.get("/", (req, res) => {
	response(200, "API Profiler ready to use", "SUCCESS", res);
  });
  
app.use("/api/auth", authController);  

app.listen(PORT, () => {
	console.log(`App Run on port: ${PORT}`);
});
