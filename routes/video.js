const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getUploadUrl, getDownloadUrl } = require('../services/s3');
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
  // Get pre-signed URL for video upload (student only)
  router.get('/get-upload-url', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can upload videos' });
    }
    const extension = req.query.extension || 'mp4';
    const key = `students/${req.user.userId}/cv.${extension}`;
    try {
      const uploadUrl = await getUploadUrl(key, 3600);
      res.json({ uploadUrl, key });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // Save video reference after upload (student only)
  router.post('/set-video-cv', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can set video CV' });
    }
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing video key' });
    try {
      const downloadUrl = await getDownloadUrl(key, 604800);
      await db.query('UPDATE students SET video_cv_url = $1 WHERE user_id = $2', [downloadUrl, req.user.userId]);
      res.json({ message: 'Video CV saved', videoUrl: downloadUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save video CV' });
    }
  });

  // Public CV page (no auth)
  router.get('/cv/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
      const studentResult = await db.query(
        `SELECT s.full_name, s.city, s.profession_category, s.skills, s.video_cv_url, s.cv_text, u.email
         FROM students s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id::text = $1 OR s.unique_link = $1`,
        [shortCode]
      );
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ error: 'CV not found' });
      }
      res.json({ student: studentResult.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch CV' });
    }
  });

  return router;
};
