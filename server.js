import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
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
  const { username, password, node_id } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users ( username, password, node_id) VALUES ( ?, ?, ?)";
  db.query(sql, [ username, hashedPassword, node_id], (err, result) => {
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
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send("Server error");
    if (results.length === 0) return res.status(404).send("User not found");

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (isPasswordValid) {
      res.json({
        username: user.username,
        node_id: user.node_id
      });
    } else {
      res.status(401).send("Invalid password");
    }
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
