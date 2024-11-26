require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//API Routes
const deviceRoutes = require('./routes/deviceRoutes.js');
const tokenRoutes = require('./routes/tokenRoutes.js');
const envRoutes = require('./routes/envRoutes.js');

const app = express();
const PORT = parseInt(process.env.BACKEND_SERVER_PORT);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes

app.use('/api/device', deviceRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/env', envRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});