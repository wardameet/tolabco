const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // Student applies to a job (student only)
  router.post('/apply/:jobId', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply to jobs' });
    }
    const { jobId } = req.params;
    const studentId = req.user.userId;
    try {
      const existing = await db.query('SELECT id FROM applications WHERE job_id = $1 AND student_id = $2', [jobId, studentId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'You have already applied to this job' });
      }
      const jobCheck = await db.query('SELECT id FROM jobs WHERE id = $1 AND is_active = true', [jobId]);
      if (jobCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found or inactive' });
      }
      await db.query('INSERT INTO applications (job_id, student_id) VALUES ($1, $2)', [jobId, studentId]);
      res.status(201).json({ message: 'Application submitted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to apply' });
    }
  });

  // Student views own applications (with pagination)
  router.get('/my-applications', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.student_id = $1',
        [req.user.userId]
      );
      const total = parseInt(countResult.rows[0].total);
      const result = await db.query(
        `SELECT a.*, j.title, j.location_city, j.job_type, e.company_name
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN employers e ON j.employer_id = e.user_id
         WHERE a.student_id = $1
         ORDER BY a.applied_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      );
      res.json({
        applications: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // Employer views applicants for their jobs (with pagination)
  router.get('/employer/applications', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const countResult = await db.query(
        `SELECT COUNT(*) as total
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.employer_id = $1`,
        [req.user.userId]
      );
      const total = parseInt(countResult.rows[0].total);
      const result = await db.query(
        `SELECT a.*, j.title, j.id as job_id, s.full_name, s.user_id as student_user_id
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN students s ON a.student_id = s.user_id
         WHERE j.employer_id = $1
         ORDER BY a.applied_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      );
      res.json({
        applications: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  });

  return router;
};
