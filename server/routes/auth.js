import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User, Tenant } from '../database/init.js';

const router = express.Router();

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Validation schemas
const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required()
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { email, password } = value;

        // Find user with tenant information
        const user = await User.findOne({ email })
            .populate('tenant', 'slug name plan noteLimit')
            .lean();

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                tenantId: user.tenant._id,
                tenantSlug: user.tenant.slug,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info and token
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenant._id,
                    slug: user.tenant.slug,
                    name: user.tenant.name,
                    plan: user.tenant.plan,
                    noteLimit: user.tenant.noteLimit
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user info (protected route)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('tenant', 'slug name plan noteLimit')
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenant._id,
                    slug: user.tenant.slug,
                    name: user.tenant.name,
                    plan: user.tenant.plan,
                    noteLimit: user.tenant.noteLimit
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Middleware to check if user is admin
export function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

export default router;
