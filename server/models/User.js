import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    }
}, {
    timestamps: true
});

// Compound index for tenant isolation and unique email per tenant
userSchema.index({ tenant: 1, email: 1 }, { unique: true });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
