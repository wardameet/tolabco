require("dotenv").config();
const express = require('express');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { Client } = require('pg');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
});
app.use(limiter);

// Database connection
const db = new Client({ connectionString: process.env.DATABASE_URL });
db.connect();

// Import route modules
const verificationRoutes = require(./routes/verification)(db);
const authRoutes = require('./routes/auth')(db);
const profileRoutes = require('./routes/profile')(db);
const jobRoutes = require('./routes/jobs')(db);
const applicationRoutes = require('./routes/applications')(db);
const videoRoutes = require('./routes/video')(db);
const aiRoutes = require('./routes/ai')(db);
const voucherRoutes = require('./routes/vouchers')(db);
const adminRoutes = require('./routes/admin')(db);

// Mount routes
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', jobRoutes);
app.use('/', applicationRoutes);
app.use('/', videoRoutes);
app.use('/', aiRoutes);
app.use('/', voucherRoutes);
app.use('/', adminRoutes);

// Public test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'StudentHub API ready' });
});

const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");
const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudentHub API listening on port ${PORT}`);
});
