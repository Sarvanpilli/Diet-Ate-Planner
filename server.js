require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Serve static frontend files (Diet directory)
app.use(express.static(path.join(__dirname, 'Diet')));

// --- Database Connection ---
// IMPORTANT: Make sure you have a .env file in the root of your project
// with your MongoDB connection string.
// Example .env file:
// PORT=3000
// MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- Routes ---
app.get('/', (req, res) => {
  res.redirect('/diet.html');
});

// A simple example route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// Define API routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/diets', require('./routes/diets.js'));
app.use('/api/workouts', require('./routes/workouts.js'));


// --- Server Startup ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 