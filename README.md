# tolabco – Student Job Platform

**tolabco** is a full‑stack platform connecting Egyptian students with part‑time jobs, internships, discount vouchers, and AI‑powered career tools.

## Live Demo

[https://tolabco.com](https://tolabco.com)

## Features

### For Students
- Video CV upload (pre‑signed S3 URLs)
- AI‑generated CV text (DeepSeek API)
- Job search with filters & pagination
- Apply to jobs, track applications
- Discount voucher marketplace
- Request identity verification
- Public CV page (shareable link)

### For Employers
- Post, edit, delete jobs
- View applicants per job
- AI natural language search (e.g., "female electrical engineer under 30 in Cairo")
- Watch student video CVs

### For Outlets
- Create discount vouchers with start/end dates and redemption limits
- View own vouchers

### Admin Panel
- List all users, disable accounts
- View verification queue, approve/reject student verifications
- System statistics

### Common
- JWT authentication with role‑based access (student, employer, outlet, admin)
- Dark/Light mode toggle
- Fully responsive

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt
- **AI:** DeepSeek API
- **Storage:** IONOS S3 Object Storage
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Deployment:** IONOS VPS, Nginx, PM2
- **SSL:** Let’s Encrypt

## API Documentation

Interactive Swagger UI available at `/api-docs`.

## Repository Structure
/var/www/studenthub/
├── api.js
├── routes/
├── services/
├── middleware/
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ └── App.jsx
│ └── public/
└── swagger.yaml

text

## Setup (Development)

1. Clone the repo
2. Install backend dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in credentials
4. Set up PostgreSQL database
5. Run migrations (Prisma or raw SQL)
6. Start backend: `node api.js` (or `pm2 start api.js`)
7. Frontend: `cd frontend && npm install && npm run dev`

## Deployment (Production)

- Build frontend: `cd frontend && npm run build`
- Reload Nginx: `sudo systemctl reload nginx`
- Restart backend: `pm2 restart studenthub-api --update-env`

## Contributors

- Ward Ameet – project owner
- DeepSeek (AI) – technical guidance

## License

Proprietary – all rights reserved.

---
*Built for Egyptian students.*
