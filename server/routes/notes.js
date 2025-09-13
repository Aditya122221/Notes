import express from 'express';
import Joi from 'joi';
import { Note, User, Tenant } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createNoteSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    content: Joi.string().max(10000).allow('')
});

const updateNoteSchema = Joi.object({
    title: Joi.string().min(1).max(200),
    content: Joi.string().max(10000).allow('')
});

// Helper function to check note limit
async function checkNoteLimit(tenantId) {
    const tenant = await Tenant.findById(tenantId);

    if (tenant.plan === 'pro') {
        return true; // Pro plan has unlimited notes
    }

    const noteCount = await Note.countDocuments({ tenant: tenantId });
    return noteCount < tenant.noteLimit;
}

// Helper function to get note count for current tenant
async function getNoteCount(tenantId) {
    return await Note.countDocuments({ tenant: tenantId });
}

// GET /notes - List all notes for the current tenant
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ tenant: req.user.tenantId })
            .populate('user', 'email')
            .sort({ updatedAt: -1 })
            .lean();

        const noteCount = await getNoteCount(req.user.tenantId);
        const tenant = await Tenant.findById(req.user.tenantId);

        res.json({
            notes: notes.map(note => ({
                ...note,
                author_email: note.user.email,
                user: undefined // Remove the user object since we have author_email
            })),
            meta: {
                count: noteCount,
                limit: tenant.noteLimit,
                plan: tenant.plan,
                canCreateMore: tenant.plan === 'pro' || noteCount < tenant.noteLimit
            }
        });

    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /notes/:id - Retrieve a specific note
router.get('/:id', async (req, res) => {
    try {
        const noteId = req.params.id;

        const note = await Note.findOne({
            _id: noteId,
            tenant: req.user.tenantId
        })
            .populate('user', 'email')
            .lean();

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            ...note,
            author_email: note.user.email,
            user: undefined // Remove the user object since we have author_email
        });

    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /notes - Create a new note
router.post('/', async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createNoteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        // Check note limit
        const canCreate = await checkNoteLimit(req.user.tenantId);
        if (!canCreate) {
            return res.status(403).json({
                error: 'Note limit reached',
                message: 'Upgrade to Pro plan to create unlimited notes'
            });
        }

        const { title, content } = value;

        // Create note
        const newNote = new Note({
            tenant: req.user.tenantId,
            user: req.user.userId,
            title,
            content
        });

        await newNote.save();

        // Populate the user field for response
        await newNote.populate('user', 'email');

        res.status(201).json({
            ...newNote.toObject(),
            author_email: newNote.user.email,
            user: undefined // Remove the user object since we have author_email
        });

    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /notes/:id - Update a note
router.put('/:id', async (req, res) => {
    try {
        const noteId = req.params.id;

        // Validate request body
        const { error, value } = updateNoteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details[0].message
            });
        }

        // Check if note exists and belongs to current tenant
        const existingNote = await Note.findOne({
            _id: noteId,
            tenant: req.user.tenantId
        });

        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Update note
        const updateData = {};
        if (value.title !== undefined) updateData.title = value.title;
        if (value.content !== undefined) updateData.content = value.content;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'email');

        res.json({
            ...updatedNote.toObject(),
            author_email: updatedNote.user.email,
            user: undefined // Remove the user object since we have author_email
        });

    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
    try {
        const noteId = req.params.id;

        // Check if note exists and belongs to current tenant
        const existingNote = await Note.findOne({
            _id: noteId,
            tenant: req.user.tenantId
        });

        if (!existingNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Delete note
        await Note.findByIdAndDelete(noteId);

        res.status(204).send();

    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
