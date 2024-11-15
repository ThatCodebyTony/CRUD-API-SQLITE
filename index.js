const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample data
// let todos = [
//     { id: 1, task: "Learn Node.js", completed: false, priority: "medium" },
//     { id: 2, task: "Build a REST API", completed: false, priority: "low" }
// ];



//---------------------------------------------------------------------------------------------------------------------------------

// HARD CODED APP.GET

// // GET /todos - Retrieve all to-do items
// // GET /todos - Retrieve all to-do items, or filter by completion status if provided
// app.get('/todos', (req, res) => {
//   const { completed } = req.query;  // Get the 'completed' query parameter

//   // If the 'completed' parameter is provided, filter the todos array
//   if (completed !== undefined) {
//       const isCompleted = completed === 'true';  // Convert 'true'/'false' string to boolean
//       const filteredTodos = todos.filter(todo => todo.completed === isCompleted);
//       return res.json(filteredTodos);  // Return only the filtered list
//   }
//   // If no 'completed' query parameter is provided, return all todos
//   res.json(todos); 
// });


// SQLITE3 CODED APP.GET

// This code gets a list of "todos" from a database and can filter the list by whether they’re completed or not if you specify that in the URL. 
// It then sends back the list or an error message if something goes wrong.
//Extract "completed" from the query: 
// This checks if there's a "completed" parameter in the URL (like /todos?completed=true). If it’s there, it will be used to filter the list of todos.
app.get('/todos', (req, res) => { 
  const { completed } = req.query; 

  // Set up the SQL command: query starts as SELECT * FROM todos 
  // Which means "get everything from the todos table." queryParams will store any values we need to pass to the query.
  let query = 'SELECT * FROM todos';
  const queryParams = [];

  if (completed !== undefined) {
    query += ' WHERE completed = ?';
    if (completed.toLowerCase() === 'true') {
      queryParams.push(1); // Push 1 for true: Completed todos
    } else {
      queryParams.push(0); // Push 0 for false or any other value: Incomplete todos
    }
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to retrieve todos" });
    } else {
      res.json(rows); // 4. Sends back the list of todos as a response
    }
  });
});

//---------------------------------------------------------------------------------------------------------------------------------

// HARD CODED APP.PUT

// PUT /todos/complete-all - Mark all to-do items as completed
// app.put('/todos/complete-all', (req, res) => {
//   todos.forEach(todo => {
//       todo.completed = true;  // Mark each to-do item as completed
//   });
//   res.status(200).json({ message: "All to-do items have been marked as completed." });
// });

//SQLITE3 CODED APP.PUT

app.put('/todos/complete-all', (req, res) => {
  const query = `UPDATE todos SET completed = true`;
  
  db.run(query, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to mark all todos as completed" });
    } else {
      res.json({ message: "All to-do items have been marked as completed." });
    }
  });
});

//---------------------------------------------------------------------------------------------------------------------------------

//HARD CODED APP.POST

// // POST /todos - Add a new to-do item
// app.post('/todos', (req, res) => {
//     const newTodo = {
//         id: todos.length + 1,
//         task: req.body.task,
//         completed: false,
//         priority: req.body.priority || 'medium'  // Default to 'medium' if not provided
//     };
//     todos.push(newTodo);
//     res.status(201).json(newTodo);
// });


// SQLITE3 CODED APP.POST

app.post('/todos', (req, res) => {
  const { task, priority } = req.body; // Extract task and priority from the request

  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }

  // Insert the new todo into the database with default completed status as false
  const query = `INSERT INTO todos (task, completed, priority) VALUES (?, ?, ?)`;
  db.run(query, [task, false, priority || 'medium'], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to add todo" });
    } else {
      res.status(201).json({ message: "Todo added", todoId: this.lastID });
    }
  });
});

//---------------------------------------------------------------------------------------------------------------------------------

// PUT /todos/:id - Update an existing to-do item
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id); // Get the ID from the URL
  const { task, completed } = req.body; // Get the task and completed status from the request body

  // Check if there's anything to update
  if (task === undefined && completed === undefined) {
    return res.status(400).json({ error: "No fields to update" });
  }

  // Set up the SQL query to update the todo item
  const query = `UPDATE todos SET task = COALESCE(?, task), completed = COALESCE(?, completed) WHERE id = ?`;
  const queryParams = [task, completed, id];

  db.run(query, queryParams, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to update todo" });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Todo not found" });
    } else {
      res.json({ message: "Todo updated successfully" });
    }
  });
});


// DELETE /todos/:id - Delete a to-do item
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id); // Get the ID from the URL

  // SQL query to delete the todo with the specified ID
  const query = `DELETE FROM todos WHERE id = ?`;

  db.run(query, id, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to delete todo" });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Todo not found" });
    } else {
      res.json({ message: "Todo deleted successfully" });
    }
  });
});

// Add database functionality to delete a todo by ID

// - Updated DELETE /todos/:id route to remove a todo from the SQLite database
// - Added error handling for non-existent todos and database issues
// - Sends confirmation message if deletion is successful



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


