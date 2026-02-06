const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'system'],
        default: 'text'
    },
    content: {
        type: String,
        required: function () { return this.type === 'text'; },
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    // For media messages
    media: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number, // in bytes
        url: String   // relative path to media file
    },
    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    // For reporting/moderation
    reported: {
        type: Boolean,
        default: false
    },
    reportReason: String,
    reportedAt: Date,
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Soft delete
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ matchId: 1, status: 1 });

// Static method to check if content contains contact info (emails/phone numbers)
messageSchema.statics.containsContactInfo = function (text) {
    if (!text) return false;

    // Email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

    // Phone patterns (various formats)
    const phonePatterns = [
        /\b\d{10}\b/g,                           // 1234567890
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,    // 123-456-7890, 123.456.7890, 123 456 7890
        /\b\(\d{3}\)\s*\d{3}[-.\s]?\d{4}\b/g,    // (123) 456-7890
        /\b\+\d{1,3}[-.\s]?\d{1,14}\b/g,         // +1 234 567 8900
        /\b\d{3}[-.\s]\d{4}\b/g,                  // 456-7890
    ];

    if (emailPattern.test(text)) return true;

    for (const pattern of phonePatterns) {
        if (pattern.test(text)) return true;
    }

    return false;
};

// Instance method to sanitize message for response
messageSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    if (obj.deleted) {
        obj.content = '[Message deleted]';
        obj.media = null;
    }
    return obj;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
