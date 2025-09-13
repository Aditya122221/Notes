import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    noteLimit: {
        type: Number,
        default: 3
    }
}, {
    timestamps: true
});

// Index is already defined in the schema with unique: true

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
