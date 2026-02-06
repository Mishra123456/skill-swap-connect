const mongoose = require('mongoose');

const voiceSessionSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        leftAt: Date,
        status: {
            type: String,
            enum: ['connecting', 'connected', 'disconnected', 'muted'],
            default: 'connecting'
        }
    }],
    status: {
        type: String,
        enum: ['idle', 'connecting', 'live', 'ended'],
        default: 'idle'
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number // in seconds
}, {
    timestamps: true
});

// Index for efficient querying
voiceSessionSchema.index({ matchId: 1, status: 1 });
voiceSessionSchema.index({ roomId: 1 });

// Static method to generate unique room ID
voiceSessionSchema.statics.generateRoomId = function (matchId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `voice_${matchId}_${timestamp}_${random}`;
};

// Instance method to add participant
voiceSessionSchema.methods.addParticipant = function (userId) {
    const existingParticipant = this.participants.find(
        p => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (!existingParticipant) {
        this.participants.push({
            userId,
            joinedAt: new Date(),
            status: 'connecting'
        });
    }
    return this;
};

// Instance method to update participant status
voiceSessionSchema.methods.updateParticipantStatus = function (userId, status) {
    const participant = this.participants.find(
        p => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (participant) {
        participant.status = status;
    }
    return this;
};

// Instance method to remove participant
voiceSessionSchema.methods.removeParticipant = function (userId) {
    const participant = this.participants.find(
        p => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (participant) {
        participant.leftAt = new Date();
        participant.status = 'disconnected';
    }
    return this;
};

// Instance method to end session
voiceSessionSchema.methods.endSession = function () {
    this.status = 'ended';
    this.endedAt = new Date();

    if (this.startedAt) {
        this.duration = Math.round((this.endedAt - this.startedAt) / 1000);
    }

    // Mark all active participants as disconnected
    this.participants.forEach(p => {
        if (!p.leftAt) {
            p.leftAt = this.endedAt;
            p.status = 'disconnected';
        }
    });

    return this;
};

const VoiceSession = mongoose.model('VoiceSession', voiceSessionSchema);

module.exports = VoiceSession;
