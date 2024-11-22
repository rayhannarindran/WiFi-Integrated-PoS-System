require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//API Routes
const deviceRoutes = require('./routes/deviceRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');

const app = express();
const PORT = parseInt(process.env.BACKEND_SERVER_PORT);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes

app.use('/api/device', deviceRoutes);
app.use('/api/transaction', transactionRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});