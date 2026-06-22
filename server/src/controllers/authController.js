import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/crypto.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
  // ✅ Register user
  static async register(req, res) {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create({ email, password, name, phone });
      
      logger.info(`✅ New user registered: ${email}`);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        }
      });
    } catch (error) {
      logger.error('❌ Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ✅ Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Create session
      const { token, refreshToken } = await User.createSession(user.id);

      logger.info(`✅ User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_verified: user.is_verified
        }
      });
    } catch (error) {
      logger.error('❌ Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ✅ Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const session = await User.validateRefreshToken(decoded.userId, refreshToken);
      
      if (!session) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const token = generateToken(decoded.userId);
      const newRefreshToken = generateRefreshToken(decoded.userId);

      res.json({
        token,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      logger.error('❌ Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  // ✅ Logout
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await User.revokeSession(req.userId, token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('❌ Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ✅ Get current user
  static async me(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      logger.error('❌ Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ✅ Verify email (placeholder)
  static async verifyEmail(req, res) {
    res.json({ message: 'Email verification endpoint (coming soon)' });
  }

  // ✅ Forgot password (placeholder)
  static async forgotPassword(req, res) {
    res.json({ message: 'Forgot password endpoint (coming soon)' });
  }

  // ✅ Reset password (placeholder)
  static async resetPassword(req, res) {
    res.json({ message: 'Reset password endpoint (coming soon)' });
  }

  // ✅ Update profile (placeholder)
  static async updateProfile(req, res) {
    res.json({ message: 'Update profile endpoint (coming soon)' });
  }

  // ✅ Change password (placeholder)
  static async changePassword(req, res) {
    res.json({ message: 'Change password endpoint (coming soon)' });
  }
}

export default AuthController;