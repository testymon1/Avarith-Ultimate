// src/controllers/waitlistController.js
import Waitlist from '../models/Waitlist.js';
import logger from '../utils/logger.js';

class WaitlistController {
  // Join waitlist
  static async join(req, res) {
    try {
      const { email, source, referrer } = req.body;
      const ip = req.ipInfo?.ip || req.ip;
      const userAgent = req.headers['user-agent'];

      const entry = await Waitlist.add(email, source, referrer);
      
      logger.info(`New waitlist entry: ${email} from ${source}`);

      res.status(201).json({
        message: 'Successfully joined waitlist!',
        data: {
          id: entry.id,
          email: entry.email,
          status: entry.status,
          created_at: entry.created_at
        }
      });
    } catch (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') { // unique violation
        return res.status(200).json({
          message: 'You are already on the waitlist!',
          already_exists: true
        });
      }
      logger.error('Waitlist join error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all waitlist entries (admin only)
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 50, status = 'pending' } = req.query;
      const result = await Waitlist.getAll({ page, limit, status });
      res.json(result);
    } catch (error) {
      logger.error('Get waitlist error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get analytics (admin only)
  static async getAnalytics(req, res) {
    try {
      const analytics = await Waitlist.getAnalytics();
      res.json({ analytics });
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update status (admin only)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Implementation needed
      res.json({ message: 'Status updated' });
    } catch (error) {
      logger.error('Update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete entry (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      // Implementation needed
      res.json({ message: 'Entry deleted' });
    } catch (error) {
      logger.error('Delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default WaitlistController;