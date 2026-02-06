const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillRequested: {
        type: String,
        required: [true, 'Skill requested is required'],
        trim: true,
        lowercase: true
    },
    skillOffered: {
        type: String,
        required: [true, 'Skill offered is required'],
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot exceed 500 characters'],
        default: ''
    },
    requesterRating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        ratedAt: Date
    },
    providerRating: {
        score: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        ratedAt: Date
    },
    completedAt: Date
}, {
    timestamps: true
});

matchSchema.index({ requester: 1, provider: 1, skillRequested: 1, skillOffered: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ requester: 1, status: 1 });
matchSchema.index({ provider: 1, status: 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
