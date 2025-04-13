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

app.use(express.json());

app.post('/add-expense', (req, res) => {
    const { amount, date, category, userEmail } = req.body;

    // Get user_id from email
    const getUserQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserQuery, [userEmail], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).send("Invalid user.");
        }

        const userId = results[0].id;

        const insertQuery = `INSERT INTO expenses (amount, date, category, user_id) VALUES (?, ?, ?, ?)`;
        user_db.query(insertQuery, [amount, date, category, userId], (err) => {
            if (err) {
                console.error("Error inserting expense:", err);
                return res.status(500).send("Error saving expense.");
            }

            res.send("Expense added successfully.");
        });
    });
});





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


// Utility to get current month range
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${now.getMonth() + 1}-01`;
  const lastDay = `${now.getFullYear()}-${now.getMonth() + 1}-31`;
  return [firstDay, lastDay];
}

app.get('/api/stats', (req, res) => {
    const email = req.query.userEmail;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    const getUserIdQuery = 'SELECT id FROM users WHERE email = ?';
    user_db.query(getUserIdQuery, [email], (err, results) => {
        if (err || results.length === 0) {
            console.error("User lookup failed:", err);
            return res.status(400).json({ error: 'Invalid user' });
        }

        const userId = results[0].id;
        const [startDate, endDate] = getCurrentMonthRange();

        const statsQuery = `
            SELECT IFNULL(SUM(amount), 0) as totalSpent
            FROM expenses 
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `;

        user_db.query(statsQuery, [userId, startDate, endDate], (err, results) => {
            if (err) {
                console.error("Stats fetch error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            const totalSpent = results[0].totalSpent;
            const budget = 2000;
            const percentUsed = Math.round((totalSpent / budget) * 100);
            const remaining = budget - totalSpent;

            res.json({
                totalSpent: totalSpent.toFixed(2),
                remaining: remaining.toFixed(2),
                percentUsed
            });
        });
    });
});


app.get('/status', (req, res) => {
    res.send('ok'); // confirm server is alive
  });
  

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
