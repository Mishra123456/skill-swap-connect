const Message = require('../models/Message');
const VoiceSession = require('../models/VoiceSession');
const Match = require('../models/Match');
const path = require('path');
const fs = require('fs');

// Helper to check if user is participant in match
const isMatchParticipant = (match, userId) => {
    // Handle both populated (object with _id) and non-populated (ObjectId) cases
    const requesterId = match.requester._id ? match.requester._id.toString() : match.requester.toString();
    const providerId = match.provider._id ? match.provider._id.toString() : match.provider.toString();
    const userIdStr = userId.toString();

    return requesterId === userIdStr || providerId === userIdStr;
};

// Helper to check if communication is allowed for this match
const canCommunicate = (match) => {
    // Only allow communication if match is accepted
    // Read-only after completion, disabled after both rated
    if (match.status === 'accepted') return { allowed: true, readOnly: false };
    if (match.status === 'completed') {
        const bothRated = match.requesterRating?.score && match.providerRating?.score;
        return { allowed: !bothRated, readOnly: true };
    }
    return { allowed: false, readOnly: true };
};

// ========== TEXT CHAT ==========

// Get messages for a match
exports.getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user.id;

        // Validate match exists and user is participant
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        // Check if communication is allowed
        const commStatus = canCommunicate(match);
        if (!commStatus.allowed) {
            return res.status(403).json({
                success: false,
                message: 'Communication is not available for this match status'
            });
        }

        // Get messages with pagination (newest first)
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const messages = await Message.find({
            matchId,
            deleted: false
        })
            .populate('senderId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Message.countDocuments({ matchId, deleted: false });

        // Mark unread messages as read
        await Message.updateMany(
            {
                matchId,
                senderId: { $ne: userId },
                status: { $ne: 'read' }
            },
            { status: 'read' }
        );

        res.json({
            success: true,
            data: {
                messages: messages.reverse(), // Return in chronological order
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                communicationStatus: commStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

// Send a text message
exports.sendMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Validate match exists and user is participant
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        // Check if communication is allowed
        const commStatus = canCommunicate(match);
        if (!commStatus.allowed || commStatus.readOnly) {
            return res.status(403).json({
                success: false,
                message: 'Cannot send messages in this match status'
            });
        }

        // Check for contact info (emails/phone numbers)
        if (Message.containsContactInfo(content)) {
            return res.status(400).json({
                success: false,
                message: 'Sharing contact information (email/phone) is not allowed. Please communicate only within the app.'
            });
        }

        // Basic profanity filter
        const badWords = ['badword1', 'badword2', 'spam', 'scam']; // Expand this list or use a library
        const containsProfanity = badWords.some(word => content.toLowerCase().includes(word));
        if (containsProfanity) {
            return res.status(400).json({
                success: false,
                message: 'Message contains inappropriate content.'
            });
        }

        // Create message
        const message = await Message.create({
            matchId,
            senderId: userId,
            type: 'text',
            content: content.trim(),
            status: 'sent'
        });

        await message.populate('senderId', 'name');

        res.status(201).json({
            success: true,
            data: { message }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

// ========== MEDIA UPLOAD ==========

// Upload image
exports.uploadImage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Validate match and permissions
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        const commStatus = canCommunicate(match);
        if (!commStatus.allowed || commStatus.readOnly) {
            // Clean up uploaded file
            if (req.file.path) fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Cannot send media in this match status'
            });
        }

        // Create message with image
        const message = await Message.create({
            matchId,
            senderId: userId,
            type: 'image',
            media: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/chat/${req.file.filename}`
            },
            status: 'sent'
        });

        await message.populate('senderId', 'name');

        res.status(201).json({
            success: true,
            data: { message }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// Upload video
exports.uploadVideo = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file provided'
            });
        }

        // Validate match and permissions
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        const commStatus = canCommunicate(match);
        if (!commStatus.allowed || commStatus.readOnly) {
            if (req.file.path) fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Cannot send media in this match status'
            });
        }

        // Create message with video
        const message = await Message.create({
            matchId,
            senderId: userId,
            type: 'video',
            media: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/chat/${req.file.filename}`
            },
            status: 'sent'
        });

        await message.populate('senderId', 'name');

        res.status(201).json({
            success: true,
            data: { message }
        });
    } catch (error) {
        if (req.file && req.file.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to upload video',
            error: error.message
        });
    }
};

// ========== REPORTING ==========

// Report a message
exports.reportMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        const message = await Message.findById(messageId).populate('matchId');
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Verify user is participant
        if (!isMatchParticipant(message.matchId, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You cannot report this message'
            });
        }

        // Cannot report own messages
        if (message.senderId.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot report your own message'
            });
        }

        message.reported = true;
        message.reportReason = reason || 'Inappropriate content';
        message.reportedAt = new Date();
        message.reportedBy = userId;
        await message.save();

        res.json({
            success: true,
            message: 'Message reported successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to report message',
            error: error.message
        });
    }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete their message
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        message.deleted = true;
        message.deletedAt = new Date();
        await message.save();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
};

// ========== VOICE CHAT ==========

// Create voice session
exports.createVoiceSession = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        // Validate match
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        const commStatus = canCommunicate(match);
        if (!commStatus.allowed || commStatus.readOnly) {
            return res.status(403).json({
                success: false,
                message: 'Voice chat is not available for this match status'
            });
        }

        // Check for existing active session
        const existingSession = await VoiceSession.findOne({
            matchId,
            status: { $in: ['idle', 'connecting', 'live'] }
        });

        if (existingSession) {
            return res.json({
                success: true,
                data: {
                    session: existingSession,
                    isNew: false
                }
            });
        }

        // Create new session
        const roomId = VoiceSession.generateRoomId(matchId);
        const session = await VoiceSession.create({
            matchId,
            roomId,
            initiatedBy: userId,
            status: 'idle'
        });

        session.addParticipant(userId);
        await session.save();

        res.status(201).json({
            success: true,
            data: {
                session,
                isNew: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create voice session',
            error: error.message
        });
    }
};

// Join voice session
exports.joinVoiceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await VoiceSession.findById(sessionId).populate('matchId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voice session not found'
            });
        }

        if (!isMatchParticipant(session.matchId, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        if (session.status === 'ended') {
            return res.status(400).json({
                success: false,
                message: 'This voice session has ended'
            });
        }

        session.addParticipant(userId);

        // If both participants joined, set to connecting
        const activeParticipants = session.participants.filter(p => !p.leftAt);
        if (activeParticipants.length >= 2 && session.status === 'idle') {
            session.status = 'connecting';
        }

        await session.save();

        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to join voice session',
            error: error.message
        });
    }
};

// Update voice session (for WebRTC signaling status updates)
exports.updateVoiceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status, participantStatus } = req.body;
        const userId = req.user.id;

        const session = await VoiceSession.findById(sessionId).populate('matchId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voice session not found'
            });
        }

        if (!isMatchParticipant(session.matchId, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        if (status) {
            if (status === 'live' && session.status !== 'live') {
                session.startedAt = new Date();
            }
            session.status = status;
        }

        if (participantStatus) {
            session.updateParticipantStatus(userId, participantStatus);
        }

        await session.save();

        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update voice session',
            error: error.message
        });
    }
};

// Leave voice session
exports.leaveVoiceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await VoiceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voice session not found'
            });
        }

        session.removeParticipant(userId);

        // If no active participants, end the session
        const activeParticipants = session.participants.filter(p => !p.leftAt);
        if (activeParticipants.length === 0) {
            session.endSession();
        }

        await session.save();

        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to leave voice session',
            error: error.message
        });
    }
};

// End voice session
exports.endVoiceSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await VoiceSession.findById(sessionId).populate('matchId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Voice session not found'
            });
        }

        if (!isMatchParticipant(session.matchId, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        session.endSession();
        await session.save();

        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to end voice session',
            error: error.message
        });
    }
};

// Get active voice session for a match
exports.getActiveVoiceSession = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        const session = await VoiceSession.findOne({
            matchId,
            status: { $in: ['idle', 'connecting', 'live'] }
        });

        res.json({
            success: true,
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get voice session',
            error: error.message
        });
    }
};

// Get communication status for a match
exports.getCommunicationStatus = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        const match = await Match.findById(matchId)
            .populate('requester', 'name')
            .populate('provider', 'name');

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }

        if (!isMatchParticipant(match, userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this match'
            });
        }

        const commStatus = canCommunicate(match);
        const unreadCount = await Message.countDocuments({
            matchId,
            senderId: { $ne: userId },
            status: { $ne: 'read' },
            deleted: false
        });

        const activeVoiceSession = await VoiceSession.findOne({
            matchId,
            status: { $in: ['idle', 'connecting', 'live'] }
        });

        res.json({
            success: true,
            data: {
                match,
                communicationStatus: commStatus,
                unreadCount,
                activeVoiceSession: activeVoiceSession ? {
                    sessionId: activeVoiceSession._id,
                    roomId: activeVoiceSession.roomId,
                    status: activeVoiceSession.status
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get communication status',
            error: error.message
        });
    }
};
