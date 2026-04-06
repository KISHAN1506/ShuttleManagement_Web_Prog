const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

const VIT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/;

router.post('/register', (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (!VIT_EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Please use a valid VIT email address (@vitstudent.ac.in)' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, password_hash);

        const token = jwt.sign(
            { id: result.lastInsertRowid, name, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: result.lastInsertRowid, name, email }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!VIT_EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Please use a valid VIT email address (@vitstudent.ac.in)' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
