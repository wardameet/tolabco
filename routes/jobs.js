const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // List jobs with search, filter, pagination
  router.get('/jobs', authenticate, async (req, res) => {
    try {
      const { search, job_type, location_city, is_remote, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      let query = `
        SELECT j.*, e.company_name
        FROM jobs j
        JOIN employers e ON j.employer_id = e.user_id
        WHERE j.is_active = true`;
      const params = [];
      let idx = 1;

      if (search) {
        query += ` AND (j.title ILIKE $${idx} OR j.description ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }
      if (job_type) {
        query += ` AND j.job_type = $${idx}`;
        params.push(job_type);
        idx++;
      }
      if (location_city) {
        query += ` AND j.location_city ILIKE $${idx}`;
        params.push(`%${location_city}%`);
        idx++;
      }
      if (is_remote !== undefined) {
        query += ` AND j.is_remote = $${idx}`;
        params.push(is_remote === 'true');
        idx++;
      }

      const countQuery = query.replace('SELECT j.*, e.company_name', 'SELECT COUNT(*) as total');
      const countResult = await db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      query += ` ORDER BY j.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
      params.push(limit, offset);
      const result = await db.query(query, params);

      res.json({
        jobs: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // Create a job (employer only)
  router.post('/jobs', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }
    const { title, description, job_type, location_city, is_remote, salary_range } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    try {
      const jobId = uuidv4();
      await db.query(
        `INSERT INTO jobs (id, employer_id, title, description, job_type, location_city, is_remote, salary_range)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [jobId, req.user.userId, title, description || null, job_type || null, location_city || null, is_remote || false, salary_range || null]
      );
      res.status(201).json({ message: 'Job created', jobId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  // Edit a job (employer only)
  router.put('/jobs/:jobId', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can edit jobs' });
    }
    const { jobId } = req.params;
    const { title, description, job_type, location_city, is_remote, salary_range } = req.body;
    try {
      const ownerCheck = await db.query('SELECT id FROM jobs WHERE id = $1 AND employer_id = $2', [jobId, req.user.userId]);
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found or not owned by you' });
      }
      const updates = [];
      const values = [];
      let idx = 1;
      if (title !== undefined) { updates.push(`title = $${idx}`); values.push(title); idx++; }
      if (description !== undefined) { updates.push(`description = $${idx}`); values.push(description); idx++; }
      if (job_type !== undefined) { updates.push(`job_type = $${idx}`); values.push(job_type); idx++; }
      if (location_city !== undefined) { updates.push(`location_city = $${idx}`); values.push(location_city); idx++; }
      if (is_remote !== undefined) { updates.push(`is_remote = $${idx}`); values.push(is_remote); idx++; }
      if (salary_range !== undefined) { updates.push(`salary_range = $${idx}`); values.push(salary_range); idx++; }
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      values.push(jobId);
      await db.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = $${idx}`, values);
      res.json({ message: 'Job updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update job' });
    }
  });

  // Delete a job (employer only)
  router.delete('/jobs/:jobId', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can delete jobs' });
    }
    const { jobId } = req.params;
    try {
      const ownerCheck = await db.query('SELECT id FROM jobs WHERE id = $1 AND employer_id = $2', [jobId, req.user.userId]);
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found or not owned by you' });
      }
      await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
      res.json({ message: 'Job deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  return router;
};
