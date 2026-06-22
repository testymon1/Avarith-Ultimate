import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../utils/crypto.js';

class User {
  static async create({ email, password, name, phone }) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
    
    const result = await query(
      `INSERT INTO users (email, password, name, phone, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, email, name, created_at`,
      [email, hashedPassword, name, phone]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, email, name, phone, created_at, 
              last_login, is_verified, is_active
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async createSession(userId) {
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    await query(
      `INSERT INTO sessions (user_id, token, refresh_token, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [userId, token, refreshToken]
    );
    
    return { token, refreshToken };
  }

  static async validateRefreshToken(userId, refreshToken) {
    const result = await query(
      'SELECT * FROM sessions WHERE user_id = $1 AND refresh_token = $2 AND revoked = FALSE',
      [userId, refreshToken]
    );
    return result.rows[0];
  }

  static async revokeSession(userId, token) {
    await query(
      'UPDATE sessions SET revoked = TRUE WHERE user_id = $1 AND token = $2',
      [userId, token]
    );
  }

  static async revokeAllSessions(userId) {
    await query(
      'UPDATE sessions SET revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  }
}

export default User;