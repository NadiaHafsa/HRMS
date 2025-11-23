#  HRMS - Human Resource Management System

A modern full-stack web application for managing employees and teams with secure authentication and audit logging.

## Features

- **Secure Authentication** - JWT-based login with password hashing
- **Employee Management** - Full CRUD operations with validation
- **Team Management** - Create teams and assign employees
- **Dashboard** - Real-time statistics and activity feed
- **Audit Logging** - Track all user actions
- **Modern UI** - Responsive design with custom modals
- **Data Isolation** - Organization-level security

---

## Tech Stack

**Frontend:** React 18, Vite, React Router, Axios, Context API  
**Backend:** Node.js, Express, PostgreSQL, Sequelize, JWT, bcrypt

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/hrms-system.git
cd hrms-system

# Setup Backend
cd backend
npm install
# Create .env file (see Configuration below)
npm run dev

# Setup Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:5173

---

##  Configuration

### Backend `.env`
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=hrms_db
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup
```bash
psql -U postgres
CREATE DATABASE hrms_db;
\q
```

---

## Project Structure
```
hrms/
├── backend/
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth & error handling
│   │   └── index.js        # Express app
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── context/        # State management
│   │   └── App.jsx
│   └── .env
└── README.md
```

---

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register organization
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/assign` - Assign employees
- `DELETE /api/teams/:id` - Delete team

### Logs
- `GET /api/logs` - Get activity logs

---

##  Usage

1. **Register** - Create organization and admin account
2. **Login** - Access dashboard
3. **Add Employees** - Create employee records
4. **Create Teams** - Organize employees into teams
5. **Assign Members** - Link employees to teams
6. **View Logs** - Track all activities

---

##  Database Schema
```
organisations (1) ──→ (N) users
organisations (1) ──→ (N) employees
organisations (1) ──→ (N) teams
employees (N) ←──→ (N) teams (via employee_teams)
```

**Tables:** organisations, users, employees, teams, employee_teams, logs

---

##  Deployment

### Backend (Render)
1. Push to GitHub
2. Create web service on Render
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Frontend (Vercel)
1. Push to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` to backend URL
4. Deploy

---

##  Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## Contact

**Your Name**  
GitHub: https://github.com/NadiaHafsa  
Email: nadia26hafsa@gmail.com

**Project Link:** https://github.com/NadiaHafsa/HRMS

---

##  Acknowledgments

Built with React, Node.js, Express, and PostgreSQL.

---


**⭐ Star this repo if you find it useful!**

Made by Nadia Hafsa

