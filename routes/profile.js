const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // Get profile (student, employer, admin)
  router.get('/profile', authenticate, async (req, res) => {
    try {
      const user = req.user;
      if (user.role === 'student') {
        const result = await db.query('SELECT full_name, date_of_birth, city, profession_category, skills, video_cv_url, cv_text, unique_link, verified FROM students WHERE user_id = $1', [user.userId]);
        res.json({ user: { id: user.userId, email: user.email, role: user.role }, profile: result.rows[0] || {} });
      } else if (user.role === 'employer') {
        const result = await db.query('SELECT company_name, company_city FROM employers WHERE user_id = $1', [user.userId]);
        res.json({ user: { id: user.userId, email: user.email, role: user.role }, profile: result.rows[0] || {} });
      } else {
        res.json({ user: { id: user.userId, email: user.email, role: user.role } });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update student profile (student only)
  router.put('/profile', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update profile' });
    }
    const { full_name, date_of_birth, city, profession_category, skills } = req.body;
    try {
      const updates = [];
      const values = [];
      let idx = 1;
      if (full_name !== undefined) { updates.push(`full_name = $${idx}`); values.push(full_name); idx++; }
      if (date_of_birth !== undefined) { updates.push(`date_of_birth = $${idx}`); values.push(date_of_birth); idx++; }
      if (city !== undefined) { updates.push(`city = $${idx}`); values.push(city); idx++; }
      if (profession_category !== undefined) { updates.push(`profession_category = $${idx}`); values.push(profession_category); idx++; }
      if (skills !== undefined) { updates.push(`skills = $${idx}`); values.push(skills); idx++; }
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      values.push(req.user.userId);
      await db.query(`UPDATE students SET ${updates.join(', ')} WHERE user_id = $${idx}`, values);
      res.json({ message: 'Profile updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  return router;
};
