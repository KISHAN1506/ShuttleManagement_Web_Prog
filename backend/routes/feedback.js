const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const MAX_MESSAGE_LENGTH = 500;

router.post('/', authenticateToken, (req, res) => {
    try {
        const { rating, message } = req.body;

        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
        }

        const sanitizedMessage = message
            ? String(message).trim().slice(0, MAX_MESSAGE_LENGTH)
            : '';

        const result = db.prepare('INSERT INTO feedback (user_id, rating, message) VALUES (?, ?, ?)')
            .run(req.user.id, rating, sanitizedMessage);

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: {
                id: result.lastInsertRowid,
                rating,
                message: sanitizedMessage
            }
        });
    } catch (err) {
        console.error('Feedback error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const total = db.prepare('SELECT COUNT(*) as count FROM feedback').get().count;

        const feedbacks = db.prepare(`
      SELECT f.*, u.name as user_name, u.email as user_email 
      FROM feedback f 
      JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

        res.json({
            feedbacks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (err) {
        console.error('Get feedback error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const feedbackId = req.params.id;
        
        const feedback = db.prepare('SELECT id FROM feedback WHERE id = ?').get(feedbackId);
        if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
        
        db.prepare('DELETE FROM feedback WHERE id = ?').run(feedbackId);
        
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        console.error('Delete feedback error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
