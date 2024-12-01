import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { login, signup } from './database.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(cookieParser());

// MySQL Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ' ', //enter your password
  database: process.env.DB_NAME || 'BACKEND_FINAL',
});

// Routes
app.post('/api/signup', async (req, res, next) => {
  try {
    await signup(req, res);
  } catch (error) {
    console.error('Signup error:', error.message);
    next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const user = await login(req, res);
    const token = jwt.sign(
      { user_id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
});

// New endpoint to get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const sql = `
      SELECT 
        at.application_id,
        at.college_id,
        cs.college_name,
        at.name,
        at.email_id,
        DATE_FORMAT(at.date_applied, '%Y-%m-%d') as date_applied
      FROM Application_Tracking at
      LEFT JOIN College_Staging cs ON at.college_id = cs.college_id
      ORDER BY at.date_applied DESC
    `;
    const [results] = await db.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Existing routes...
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  const sql = `
    SELECT college_id, college_name 
    FROM College_Staging 
    WHERE college_name LIKE ? 
    LIMIT 5
  `;

  try {
    const [results] = await db.query(sql, [`%${query}%`]);
    res.json(results);
  } catch (error) {
    console.error('Search query error:', error.message);
    res.status(500).json({ message: 'Failed to perform search.' });
  }
});

app.get('/api/college-details', async (req, res) => {
  const { college_name } = req.query;

  if (!college_name) {
    return res.status(400).json({ message: 'College name is required.' });
  }

  const sql = `
    SELECT 
      college_id,
      college_name,
      country,
      program_offered,
      last_date_of_application,
      on_campus_accommodation,
      max_roommates,
      previous_qualifications_required
    FROM College_Staging
    WHERE college_name LIKE ?
    LIMIT 1
  `;

  try {
    const [results] = await db.query(sql, [`%${college_name}%`]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'College not found' });
    }
  } catch (error) {
    console.error('College details query error:', error.message);
    res.status(500).json({ message: 'Failed to fetch college details.' });
  }
});

app.post('/api/apply', async (req, res) => {
  const { college_id, name, email_id, date_applied } = req.body;

  if (!college_id || !name || !email_id || !date_applied) {
    return res.status(400).json({ message: 'All fields are required to apply.' });
  }

  try {
    const sql = `
      INSERT INTO Application_Tracking (college_id, name, email_id, date_applied)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [college_id, name, email_id, date_applied]);
    res.status(201).json({ 
      message: 'Application submitted successfully.',
      application_id: result.insertId
    });
  } catch (error) {
    console.error('Error saving application:', error.message);
    res.status(500).json({ message: 'Failed to submit application.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong! Please try again later.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;