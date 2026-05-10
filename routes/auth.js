const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

module.exports = (db) => {
  // Register
  router.post('/register', async (req, res) => {
    const { email, password, role, full_name, phone } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }
    try {
      const hashed = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      await db.query(
        'INSERT INTO users (id, email, password_hash, role, phone) VALUES ($1, $2, $3, $4, $5)',
        [userId, email, hashed, role, phone || null]
      );
      if (role === 'student') {
        await db.query('INSERT INTO students (user_id, full_name) VALUES ($1, $2)', [userId, full_name || email.split('@')[0]]);
      } else if (role === 'employer') {
        await db.query('INSERT INTO employers (user_id, company_name) VALUES ($1, $2)', [userId, full_name || 'Unnamed Company']);
      }
      res.status(201).json({ message: 'User registered', userId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    try {
      const result = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  return router;
};
