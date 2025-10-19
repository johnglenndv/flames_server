import dotenv from "dotenv";
dotenv.config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected!");
});

// Register route
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, role], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error registering user");
    } else {
      res.send("Registration successful!");
    }
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).send("Server error");
    if (results.length === 0) return res.status(404).send("User not found");

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (isPasswordValid) {
      res.json({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(401).send("Invalid password");
    }
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
