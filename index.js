const express = require('express');
const bodyParser = require('body-parser');
const db = require('./dbSetup');  // Import the SQLite database connection from dbSetup.js
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// GET /todos - Retrieve all to-do items from the database
app.get('/todos', (req, res) => {
    const { completed } = req.query;  // Extract the 'completed' query parameter to filter todos
    let query = 'SELECT * FROM todos';  // Default query to select all todos
    const queryParams = [];

    // If 'completed' query parameter is provided, filter the todos by completed status
    if (completed !== undefined) {
        query += ' WHERE completed = ?';  // Add WHERE clause to the query
        queryParams.push(completed.toLowerCase() === 'true' ? 1 : 0);  // Set 1 for true, 0 for false
    }

    // Execute the query to retrieve the todos
    db.all(query, queryParams, (err, rows) => {
        if (err) {
            console.error(err.message);  // Log the error if the query fails
            res.status(500).json({ error: "Failed to retrieve todos" });
        } else {
            // Map through each row and convert 'completed' field to boolean
            const todos = rows.map(todo => ({
                ...todo,
                completed: !!todo.completed  // Convert 1 to true and 0 to false
            }));
            res.json(todos);  // Return the list of todos as JSON response
        }
    });
});


// POST /todos - Add a new to-do item to the database
app.post('/todos', (req, res) => {
    const { task, priority } = req.body;  // Extract 'task' and 'priority' from the request body

    // Validate that 'task' is provided
    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }

    // Insert the new todo into the database with default completed status as false
    const query = `INSERT INTO todos (task, completed, priority) VALUES (?, ?, ?)`;
    db.run(query, [task, false, priority || 'medium'], function (err) {
        if (err) {
            console.error(err.message);  // Log the error if the insert fails
            res.status(500).json({ error: "Failed to add todo" });
        } else {
            res.status(201).json({ message: "Todo added", todoId: this.lastID });  // Return success with new todo ID
        }
    });
});

// PUT /todos/:id - Update an existing to-do item by ID
app.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);  // Extract the todo ID from the URL
    const { task, completed } = req.body;  // Extract 'task' and 'completed' from the request body

    // Validate that at least one field ('task' or 'completed') is provided for the update
    if (task === undefined && completed === undefined) {
        return res.status(400).json({ error: "No fields to update" });
    }

    // Update the todo item in the database with the new values
    const query = `UPDATE todos SET task = COALESCE(?, task), completed = COALESCE(?, completed) WHERE id = ?`;
    const queryParams = [task, completed, id];  // Prepare the query parameters

    db.run(query, queryParams, function (err) {
        if (err) {
            console.error(err.message);  // Log the error if the update fails
            res.status(500).json({ error: "Failed to update todo" });
        } else if (this.changes === 0) {
            res.status(404).json({ error: "Todo not found" });  // Return 404 if no rows were updated (todo not found)
        } else {
            res.json({ message: "Todo updated successfully" });  // Return success message
        }
    });
});

// PUT /todos/complete-all - Mark all to-do items as completed
app.put('/todos/complete-all', (req, res) => {
    const query = `UPDATE todos SET completed = 1`;  // Update all todos to mark them as completed

    db.run(query, function (err) {
        if (err) {
            console.error(err.message);  // Log the error if the update fails
            res.status(500).json({ error: "Failed to mark all todos as completed" });
        } else {
            res.json({ message: "All to-do items have been marked as completed." });  // Return success message
        }
    });
});

// DELETE /todos/:id - Delete a to-do item by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);  // Extract the todo ID from the URL

    const query = `DELETE FROM todos WHERE id = ?`;  // Delete the todo by ID

    db.run(query, id, function (err) {
        if (err) {
            console.error(err.message);  // Log the error if the delete fails
            res.status(500).json({ error: "Failed to delete todo" });
        } else if (this.changes === 0) {
            res.status(404).json({ error: "Todo not found" });  // Return 404 if the todo doesn't exist
        } else {
            res.json({ message: "Todo deleted successfully" });  // Return success message
        }
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
