const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // Student verification request
  router.post('/student/verify-request', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request verification' });
    }
    const { id_photo_url, selfie_url } = req.body;
    if (!id_photo_url || !selfie_url) {
      return res.status(400).json({ error: 'ID photo and selfie URLs are required' });
    }
    try {
      await db.query(
        'INSERT INTO verification_queue (student_id, id_photo_url, selfie_url) VALUES ($1, $2, $3)',
        [req.user.userId, id_photo_url, selfie_url]
      );
      res.json({ message: 'Verification request submitted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit verification request' });
    }
  });
  return router;
};
