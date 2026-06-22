import rateLimit from 'express-rate-limit';
import { cache } from '../config/redis.js';

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed attempts per hour
  message: 'Too many auth attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Waitlist limiter
export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 waitlist entries per hour per IP
  message: 'You have reached the waitlist limit for this hour.',
});