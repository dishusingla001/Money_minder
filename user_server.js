const express = require('express');
const bodyParser = require('body-parser');
const user_db = require('./user_db');
const path = require('path');
const bcrypt = require('bcrypt'); // ✅ Add bcrypt

const app = express();
const PORT = 3000;
const saltRounds = 10;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'new Project')));

// Route to handle signup (with hashing)
app.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds); // ✅ Hash password

        const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        user_db.query(query, [fullname, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.send('Error registering user.');
            }
            res.send('User registered successfully!');
        });
    } catch (err) {
        console.error('Hashing error:', err);
        res.send('Error while processing password.');
    }
});

// Route to handle login (with hashed password check)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    user_db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.send('error');
        }

        if (results.length > 0) {
            const user = results[0];

            const match = await bcrypt.compare(password, user.password); // ✅ Compare hash

            if (match) {
                res.send('success');
            } else {
                res.send('fail');
            }
        } else {
            res.send('fail');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
