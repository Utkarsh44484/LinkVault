const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
require('./cron');
const linkRoutes = require('./routes/linkRoutes');
const authRoutes = require('./routes/authRoutes');

// dotenv.config();

const app = express();

// global middlewares
app.use(cors());
app.use(express.json());

// api routes
app.use('/api/links', linkRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// connect to database
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(' MongoDB Connected Successfully'))
    .catch((err) => console.error(' MongoDB Connection Error:', err));

// health check
app.get('/', (req, res) => {
    res.send('LinkVault API is running...');
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});