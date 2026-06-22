import { query } from '../config/database.js';
import { sendEmail } from '../utils/email.js';

class Waitlist {
  static async add(email, source, referrer) {
    const result = await query(
      `INSERT INTO waitlist (email, source, referrer, status, created_at)
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET 
         source = EXCLUDED.source,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [email, source, referrer]
    );
    
    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'Welcome to Avarith Waitlist! 🚀',
      template: 'waitlist-confirmation',
      data: { email }
    });
    
    return result.rows[0];
  }

  static async getAll({ page = 1, limit = 50, status = 'pending' }) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT id, email, source, status, created_at
       FROM waitlist
       WHERE status = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );
    
    const count = await query(
      'SELECT COUNT(*) FROM waitlist WHERE status = $1',
      [status]
    );
    
    return {
      data: result.rows,
      total: parseInt(count.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    };
  }

  static async updateStatus(email, status) {
    const result = await query(
      'UPDATE waitlist SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING *',
      [status, email]
    );
    return result.rows[0];
  }

  static async getAnalytics() {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined,
        DATE_TRUNC('day', created_at) as day,
        source
      FROM waitlist
      GROUP BY day, source
      ORDER BY day DESC
      LIMIT 30`
    );
    return result.rows;
  }
}

export default Waitlist;