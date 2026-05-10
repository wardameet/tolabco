const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateCVText, parseEmployerQuery } = require('../services/deepseek');

module.exports = (db) => {
  // Generate CV text from student profile (student only)
  router.post('/generate-cv', authenticate, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can generate CV' });
    }
    const { full_name, skills, profession_category, city, education, experience } = req.body;
    if (!full_name || !skills) {
      return res.status(400).json({ error: 'Full name and skills are required' });
    }
    try {
      const cvText = await generateCVText(full_name, skills, profession_category, city, education, experience);
      await db.query('UPDATE students SET cv_text = $1 WHERE user_id = $2', [cvText, req.user.userId]);
      res.json({ message: 'CV generated', cv_text: cvText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'AI generation failed' });
    }
  });

  // AI natural language search for students (employer only)
  router.post('/employer/search-students', authenticate, async (req, res) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can search' });
    }
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
      const filters = await parseEmployerQuery(query);
      let sql = `SELECT s.user_id, s.full_name, s.city, s.profession_category, s.skills, s.video_cv_url, s.cv_text, s.verified,
                        u.email, EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.date_of_birth)) as age
                 FROM students s
                 JOIN users u ON s.user_id = u.id
                 WHERE s.date_of_birth IS NOT NULL`;
      const params = [];
      let idx = 1;

      if (filters.min_age) {
        sql += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.date_of_birth)) >= $${idx++}`;
        params.push(filters.min_age);
      }
      if (filters.max_age) {
        sql += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.date_of_birth)) <= $${idx++}`;
        params.push(filters.max_age);
      }
      if (filters.degree) {
        sql += ` AND s.profession_category ILIKE $${idx++}`;
        params.push(`%${filters.degree}%`);
      }
      if (filters.city) {
        sql += ` AND s.city ILIKE $${idx++}`;
        params.push(`%${filters.city}%`);
      }
      if (filters.skills && filters.skills.length) {
        sql += ` AND s.skills && $${idx++}`;
        params.push(filters.skills);
      }
      sql += ` LIMIT 20`;
      const result = await db.query(sql, params);
      res.json({ query, filters, results: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'AI search failed', details: err.message });
    }
  });

  return router;
};
