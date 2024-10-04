const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const bodyParser = require('body-parser');
const path = require('path');

// Initialize the Express app
const app = express();
const port = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public_html'))); // Serve static files from 'public_html' directory

// Create a new SQLite database or open the existing one
const db = new sqlite3.Database('./recipes_feedback1.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables for recipes and feedback if they don't already exist
db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL
    )
`);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});

// Route to handle recipe form submissions
app.post('/submit-recipe', (req, res) => {
    const { dishName, category, ingredients, steps, image } = req.body;
    
    db.run(`
        INSERT INTO recipe_requests (dish_name, category, ingredients, steps, image)
        VALUES (?, ?, ?, ?, ?)
    `, [dishName, category, ingredients.join(', '), steps.join(', '), image], (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Recipe submitted successfully!' });
    });
});

// Route to handle feedback submission
app.post('/submitFeedback', (req, res) => {
    const { feedbackName, feedbackMessage } = req.body;

    // Insert feedback into the database
    db.run(`INSERT INTO feedback (name, message) VALUES (?, ?)`, [feedbackName, feedbackMessage], function(err) {
        if (err) {
            console.error('Error saving feedback:', err.message);
            return res.status(500).json({ success: false, message: 'Error saving feedback.' });
        }
        else {
        // Send a response back to the client with success status and name
        res.json({ success: true, name: feedbackName });
    }
    });
});

// Route to retrieve all feedback data
app.get('/retrieveFeedback', (req, res) => {
    const query = 'SELECT * FROM feedback';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ error: 'Failed to retrieve feedback.' });
        }
        res.json(rows);
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
