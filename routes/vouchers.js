const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

module.exports = (db) => {
  // Create a voucher (outlet only)
  router.post('/vouchers', authenticate, async (req, res) => {
    if (req.user.role !== 'outlet') {
      return res.status(403).json({ error: 'Only outlets can create vouchers' });
    }
    const { title, description, discount_percent, start_date, end_date, max_redemptions } = req.body;
    if (!title || !discount_percent) {
      return res.status(400).json({ error: 'Title and discount percent are required' });
    }
    try {
      const voucherId = uuidv4();
      await db.query(
        `INSERT INTO vouchers (id, outlet_id, title, description, discount_percent, start_date, end_date, max_redemptions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [voucherId, req.user.userId, title, description || null, discount_percent, start_date || null, end_date || null, max_redemptions || null]
      );
      res.status(201).json({ message: 'Voucher created', voucherId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create voucher' });
    }
  });

  // List active vouchers (any authenticated user)
  router.get('/vouchers', authenticate, async (req, res) => {
    try {
      const result = await db.query(
        `SELECT v.*, u.email as outlet_email
         FROM vouchers v
         JOIN users u ON v.outlet_id = u.id
         WHERE v.is_active = true AND (v.end_date IS NULL OR v.end_date >= CURRENT_DATE)
         ORDER BY v.created_at DESC`
      );
      res.json({ vouchers: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch vouchers' });
    }
  });

  // Redeem a voucher (student only)
  router.post('/redeem/:voucherId', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can redeem vouchers' });
    }
    const { voucherId } = req.params;
    try {
      const voucherCheck = await db.query('SELECT id, max_redemptions, redemption_count FROM vouchers WHERE id = $1 AND is_active = true', [voucherId]);
      if (voucherCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Voucher not found or inactive' });
      }
      const voucher = voucherCheck.rows[0];
      if (voucher.max_redemptions && voucher.redemption_count >= voucher.max_redemptions) {
        return res.status(400).json({ error: 'Voucher redemption limit reached' });
      }
      const existing = await db.query('SELECT id FROM redemptions WHERE voucher_id = $1 AND student_id = $2', [voucherId, req.user.userId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'You have already redeemed this voucher' });
      }
      await db.query('INSERT INTO redemptions (voucher_id, student_id) VALUES ($1, $2)', [voucherId, req.user.userId]);
      await db.query('UPDATE vouchers SET redemption_count = redemption_count + 1 WHERE id = $1', [voucherId]);
      res.json({ message: 'Voucher redeemed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to redeem voucher' });
    }
  });

  return router;
};
