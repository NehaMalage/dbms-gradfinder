import dotenv from 'dotenv'; 
import mysql from 'mysql2/promise'; 
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', //enter your password
    database: process.env.DB_NAME || 'BACKEND_FINAL',
});

export async function login(req, res) {
  const { email, password, user_type, identificationCode } = req.body;

  try {
    // Check if the user exists in the database
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND user_type = ?',
      [email, user_type]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or user type' });
    }

    const user = rows[0];

    // For admins, check the identification code
    if (user_type === 'admin' && identificationCode !== 'TrueAdmin123') {
      return res.status(400).json({ message: 'Invalid Identification Code' });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Login successful
    return res.status(200).json({
      message: `Welcome back, ${user.username}!`,
      user: { id: user.id, username: user.username, userType: user.user_type },
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function signup(req, res) {
  const { user_type, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const [result] = await pool.query(
      'INSERT INTO users (user_type, username, email, password) VALUES (?, ?, ?, ?)',
      [user_type || 'user', username, email, hashedPassword] // Default to 'user' if user_type is missing
    );

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function applyForCollege(req, res) {
  const { college_id, name, email_id, date_applied } = req.body;
  
  if (!college_id || !name || !email_id || !date_applied) {
    return res.status(400).json({ message: 'All fields are required to apply.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Application_Tracking (college_id, name, email_id, date_applied) VALUES (?, ?, ?, ?)',
      [college_id, name, email_id, date_applied]
    );

    return res.status(201).json({
      message: 'Application submitted successfully',
      application_id: result.insertId,
    });
  } catch (error) {
    console.error('Error during application submission:', error.message);
    return res.status(500).json({ message: 'Failed to submit application.' });
  }
}

// New function to fetch applications
export async function getApplications(req, res) {
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
    
    const [results] = await pool.query(sql);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Failed to fetch applications' });
  }
}