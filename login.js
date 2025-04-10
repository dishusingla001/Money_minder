const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5500;
const SECRET_KEY = 'your_secret_key'; // Replace with a strong secret key in production

// Middleware
app.use(express.static('public')); // Serve static files
app.use(bodyParser.json()); // Parse JSON request body
app.use(cors()); // Enable CORS for cross-origin requests

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required.');
    }

    // Check if the email already exists
    const checkQuery = `SELECT * FROM users WHERE email = ?`;
    db.get(checkQuery, [email], (err, row) => {
        if (row) {
            return res.status(400).send('Email already exists.');
        }

        // Insert the new user into the database with a plain text password
        const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(insertQuery, [username, email, password], (err) => {
            if (err) {
                console.error('Error inserting into database:', err.message);
                return res.status(500).send('Failed to create account.');
            }
            res.send('Account created successfully!');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            console.error('Error querying the database:', err.message);
            return res.status(500).send('Error logging in.');
        }

        if (user && user.password === password) {
            // Generate a JWT token
            const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

            return res.json({ success: true, token });
        } else {
            return res.status(401).send('Invalid email or password.');
        }
    });
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('No token provided.');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
}

// Get logged-in user details
app.get('/loggedin-user', authenticateToken, (req, res) => {
    res.json(req.user); // Return the user data extracted from the JWT token
});

// Logout endpoint (optional for JWT, handled client-side)
app.post('/logout', (req, res) => {
    res.send('Logout successful.'); // No server-side action needed for JWT
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
