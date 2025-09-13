import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User, Tenant } from '../database/init.js';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'member').default('member')
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
            process.env.JWT_SECRET,
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

// Admin signup endpoint - Create new company/tenant with admin user
router.post('/signup', async (req, res) => {
    try {
        // Validate request body for admin signup
        const adminSignupSchema = Joi.object({
            email: Joi.string().email({ tlds: { allow: false } }).required(),
            password: Joi.string().min(6).required(),
            companyName: Joi.string().min(2).max(100).required()
        });

        const { error, value } = adminSignupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { email, password, companyName } = value;

        // Generate company slug from company name
        const companySlug = companyName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Check if tenant with this slug already exists
        const existingTenant = await Tenant.findOne({ slug: companySlug });
        if (existingTenant) {
            return res.status(400).json({ error: 'Company name already exists. Please choose a different name.' });
        }

        // Check if user already exists globally
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new tenant
        const tenant = new Tenant({
            slug: companySlug,
            name: companyName,
            plan: 'free',
            noteLimit: 3
        });
        await tenant.save();

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user
        const user = new User({
            tenant: tenant._id,
            email,
            passwordHash,
            role: 'admin'
        });
        await user.save();

        // Populate tenant data
        await user.populate('tenant', 'slug name plan noteLimit');

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                tenantId: user.tenant._id,
                tenantSlug: user.tenant.slug,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info and token
        res.status(201).json({
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
            },
            message: 'Company created successfully! You are now the admin.'
        });

    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Invite user endpoint (Admin only)
router.post('/invite', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Validate request body
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        const { email, password, role } = value;
        const tenantId = req.user.tenantId; // Use admin's tenant

        // Check if user already exists in this tenant
        const existingUser = await User.findOne({ email, tenant: tenantId });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists in this tenant' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            tenant: tenantId,
            email,
            passwordHash,
            role
        });

        await user.save();

        // Populate tenant data
        await user.populate('tenant', 'slug name plan noteLimit');

        // Return user info (no token - they need to login separately)
        res.status(201).json({
            message: 'User invited successfully',
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
        console.error('Invite user error:', error);
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

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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