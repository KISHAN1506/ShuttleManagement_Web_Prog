const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('❌ FATAL: JWT_SECRET is not set in .env');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

require('./db');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bus', require('./routes/bus'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'VIT Shuttle API is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚌 VIT Shuttle Backend running on http://localhost:${PORT}`);
});
