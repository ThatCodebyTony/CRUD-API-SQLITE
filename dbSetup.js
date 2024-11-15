// Import the SQLite3 library and enable verbose mode for debugging
const sqlite3 = require("sqlite3").verbose();

// Connect to the database or create the todos.db file if it doesn't exist
const db = new sqlite3.Database('./todos.db', (err) => {
    if (err) {
        console.error("ERROR! Can't connect to SQLite DB:", err.message);
    } else {
        console.log("Connected to SQLite DB.");
    }
});

// Run SQL commands sequentially to avoid conflicts
db.serialize(() => {
    // SQL query to create the 'todos' table if it doesn't already exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Unique identifier for each todo
            task TEXT NOT NULL,                     -- Description of the task (required)
            completed BOOLEAN DEFAULT 0,            -- Completion status, default is false (0)
            priority TEXT DEFAULT 'medium'          -- Task priority, default is 'medium'
        )
    `;

    // Execute the SQL command to create the table
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Database and 'todos' table created successfully.");
        }
    });
});

// Export the database connection so it can be used in other files
module.exports = db;
