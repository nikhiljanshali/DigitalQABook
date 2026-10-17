import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_qa_book_2026_dev_key!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.',
      });
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();

    // Find user by either email or username
    const query = `
      SELECT id, username, email, password_hash, role, created_at
      FROM users
      WHERE LOWER(email) = $1 OR LOWER(username) = $1;
    `;
    const result = await pool.query(query, [trimmedIdentifier]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.',
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if username or email already exists
    const checkQuery = `
      SELECT id, username, email FROM users
      WHERE LOWER(email) = $1 OR LOWER(username) = $2;
    `;
    const checkRes = await pool.query(checkQuery, [trimmedEmail, trimmedUsername.toLowerCase()]);

    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      const field = existing.email.toLowerCase() === trimmedEmail ? 'Email' : 'Username';
      return res.status(409).json({
        success: false,
        message: `${field} is already registered. Please choose another or log in.`,
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, 'reader')
      RETURNING id, username, email, role, created_at;
    `;
    const insertRes = await pool.query(insertQuery, [trimmedUsername, trimmedEmail, password_hash]);
    const newUser = insertRes.rows[0];

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Digital Q&A Book.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    const query = `
      SELECT id, username, email, role, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.',
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
