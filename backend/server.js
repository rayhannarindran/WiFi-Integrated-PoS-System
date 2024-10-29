require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Services
const dbService = require('./services/dbService/dbService.js');

//API Routes
const tokenRoutes = require('./routes/tokenRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes

app.use('/api/token', tokenRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});