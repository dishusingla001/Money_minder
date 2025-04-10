const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "new Project"))); // serve HTML & CSS

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "money_minder"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

// POST endpoint to add expense
app.post("/add-expense", (req, res) => {
    const { amount, date, category } = req.body;
    const sql = "INSERT INTO expenses (amount, date, category) VALUES (?, ?, ?)";
    db.query(sql, [amount, date, category], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error saving expense");
        } else {
            res.status(200).send("Expense added successfully");
        }
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
