import express from 'express';
import { Tenant, User, Note } from '../database/init.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /tenants/:slug - Get tenant information
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Verify user belongs to this tenant
        if (req.user.tenantSlug !== slug) {
            return res.status(403).json({ error: 'Access denied to this tenant' });
        }

        const tenant = await Tenant.findOne({ slug });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Get current note count
        const noteCount = await Note.countDocuments({ tenant: tenant._id });

        res.json({
            ...tenant.toObject(),
            currentNoteCount: noteCount,
            canCreateMore: tenant.plan === 'pro' || noteCount < tenant.noteLimit
        });

    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /tenants/:slug/upgrade - Upgrade tenant to Pro plan
router.post('/:slug/upgrade', requireAdmin, async (req, res) => {
    try {
        const { slug } = req.params;

        // Verify user belongs to this tenant
        if (req.user.tenantSlug !== slug) {
            return res.status(403).json({ error: 'Access denied to this tenant' });
        }

        // Check if tenant exists
        const tenant = await Tenant.findOne({ slug });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if already on Pro plan
        if (tenant.plan === 'pro') {
            return res.status(400).json({ error: 'Tenant is already on Pro plan' });
        }

        // Upgrade to Pro plan
        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenant._id,
            {
                plan: 'pro',
                noteLimit: -1 // -1 means unlimited
            },
            { new: true }
        );

        // Get current note count
        const noteCount = await Note.countDocuments({ tenant: tenant._id });

        res.json({
            ...updatedTenant.toObject(),
            currentNoteCount: noteCount,
            canCreateMore: true,
            message: 'Successfully upgraded to Pro plan!'
        });

    } catch (error) {
        console.error('Upgrade tenant error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /tenants/:slug/users - Get users for tenant (Admin only)
router.get('/:slug/users', requireAdmin, async (req, res) => {
    try {
        const { slug } = req.params;

        // Verify user belongs to this tenant
        if (req.user.tenantSlug !== slug) {
            return res.status(403).json({ error: 'Access denied to this tenant' });
        }

        const tenant = await Tenant.findOne({ slug });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        const users = await User.find({ tenant: tenant._id })
            .select('email role createdAt')
            .sort({ createdAt: 1 })
            .lean();

        res.json({ users });

    } catch (error) {
        console.error('Get tenant users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
