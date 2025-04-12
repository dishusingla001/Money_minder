const mysql = require('mysql2');

const user_db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'money_minder'
});

user_db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected');
});

module.exports = user_db;
