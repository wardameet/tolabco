const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Admin middleware (only users with role 'admin' can access)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = (db) => {
  // Get all users (admin only)
  router.get('/admin/users', authenticate, isAdmin, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const countResult = await db.query('SELECT COUNT(*) as total FROM users');
      const total = parseInt(countResult.rows[0].total);
      const result = await db.query(
        'SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      res.json({
        users: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Disable a user (admin only)
  router.put('/admin/users/:userId/disable', authenticate, isAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
      await db.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
      res.json({ message: 'User disabled' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to disable user' });
    }
  });

  // Enable a user (admin only)
  router.put('/admin/users/:userId/enable', authenticate, isAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
      await db.query('UPDATE users SET is_active = true WHERE id = $1', [userId]);
      res.json({ message: 'User enabled' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to enable user' });
    }
  });

  // Get verification queue (students who submitted ID + selfie)
  router.get('/admin/verification-queue', authenticate, isAdmin, async (req, res) => {
    try {
      const result = await db.query(
        `SELECT v.*, s.full_name, u.email
         FROM verification_queue v
         JOIN students s ON v.student_id = s.user_id
         JOIN users u ON s.user_id = u.id
         WHERE v.status = 'pending'
         ORDER BY v.created_at ASC`
      );
      res.json({ queue: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch verification queue' });
    }
  });

  // Approve a student verification (admin only)
  router.post('/admin/verify/:studentId', authenticate, isAdmin, async (req, res) => {
    const { studentId } = req.params;
    try {
      await db.query('UPDATE students SET verified = true WHERE user_id = $1', [studentId]);
      await db.query('UPDATE verification_queue SET status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE student_id = $3 AND status = $4',
        ['approved', req.user.userId, studentId, 'pending']);
      res.json({ message: 'Student verified' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to verify student' });
    }
  });

  // Reject a student verification (admin only)
  router.post('/admin/reject/:studentId', authenticate, isAdmin, async (req, res) => {
    const { studentId } = req.params;
    const { notes } = req.body;
    try {
      await db.query('UPDATE verification_queue SET status = $1, reviewed_by = $2, reviewed_at = NOW(), notes = $3 WHERE student_id = $4 AND status = $5',
        ['rejected', req.user.userId, notes || null, studentId, 'pending']);
      res.json({ message: 'Verification rejected' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reject verification' });
    }
  });

  // System statistics (admin only)
  router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
    try {
      const totalStudents = await db.query('SELECT COUNT(*) as count FROM students');
      const totalEmployers = await db.query('SELECT COUNT(*) as count FROM employers');
      const totalJobs = await db.query('SELECT COUNT(*) as count FROM jobs');
      const totalApplications = await db.query('SELECT COUNT(*) as count FROM applications');
      const totalVouchers = await db.query('SELECT COUNT(*) as count FROM vouchers');
      const verifiedStudents = await db.query('SELECT COUNT(*) as count FROM students WHERE verified = true');
      res.json({
        students: parseInt(totalStudents.rows[0].count),
        employers: parseInt(totalEmployers.rows[0].count),
        jobs: parseInt(totalJobs.rows[0].count),
        applications: parseInt(totalApplications.rows[0].count),
        vouchers: parseInt(totalVouchers.rows[0].count),
        verified_students: parseInt(verifiedStudents.rows[0].count)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
};
