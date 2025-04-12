const express = require('express');
const bodyParser = require('body-parser');
const user_db = require('./user_db');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('new Project'));

// Route to handle form submission
app.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;

    const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
    user_db.query(query, [fullname, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Error registering user.');
        }
        res.send('User registered successfully!');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
