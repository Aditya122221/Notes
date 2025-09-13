import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        trim: true,
        maxlength: 10000
    }
}, {
    timestamps: true
});

// Indexes for better performance and tenant isolation
noteSchema.index({ tenant: 1 });
noteSchema.index({ user: 1 });
noteSchema.index({ tenant: 1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
