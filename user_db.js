const mysql = require('mysql2');

const user_db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'money_minder',
    // Add these configuration options:
    insecureAuth: true,
    flags: '-FOUND_ROWS',
    // Set SQL mode to disable ONLY_FULL_GROUP_BY
    initSql: "SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'"
});

user_db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1); // Exit the process if connection fails
    }
    console.log('MySQL connected');
    
    // Verify SQL mode is set correctly
    user_db.query("SELECT @@sql_mode", (err, results) => {
        if (err) {
            console.error('Error checking SQL mode:', err);
            return;
        }
        console.log('Current SQL mode:', results[0]['@@sql_mode']);
    });
});

module.exports = user_db;