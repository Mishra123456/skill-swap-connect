const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    accumulatedTime: { // in seconds
        type: Number,
        default: 0
    },
    progress: { // Overall progress 0-100%
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    pauseHistory: [{
        pausedAt: Date,
        resumedAt: Date,
        duration: Number // seconds
    }],
    notes: {
        type: String,
        default: '## Shared Notes\n\nCollaborate on notes here...'
    },
    mentorNotes: { // Private notes for the mentor
        type: String,
        default: ''
    },
    resources: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['link', 'file', 'video', 'other'], default: 'link' },
        url: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    tasks: [{
        title: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    // --- Advanced Features ---
    milestones: [{
        title: { type: String, required: true },
        description: String,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        deadline: Date,
        completedAt: Date
    }],
    weeklyPlan: [{
        weekNumber: Number,
        goals: [String],
        outcomes: String,
        status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' }
    }],
    whiteboard: {
        snapshot: String, // Base64 or URL
        updatedAt: Date
    },
    agreement: {
        goals: String,
        commitment: String, // e.g., "2 hours/week"
        guidelines: String,
        acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who signed
        status: { type: String, enum: ['pending', 'active'], default: 'pending' }
    },
    health: {
        status: { type: String, enum: ['good', 'attention', 'risk'], default: 'good' },
        score: { type: Number, default: 100 },
        lastUpdated: { type: Date, default: Date.now }
    },
    history: [{ // Version control for major changes
        action: String, // "notes_update", "milestone_complete"
        details: String,
        timestamp: { type: Date, default: Date.now },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    // -------------------------
    feedback: {
        learner: {
            helpful: Boolean,
            whatWentWell: String,
            issues: String,
            submittedAt: Date
        },
        mentor: {
            helpful: Boolean,
            whatWentWell: String,
            issues: String,
            submittedAt: Date
        }
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
