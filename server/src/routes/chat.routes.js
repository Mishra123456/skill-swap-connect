const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/chat');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid image format. Allowed: jpg, png, webp, gif'), false);
    }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid video format. Allowed: mp4, webm, mov'), false);
    }
};

// Multer configurations
const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max for images
    }
});

const uploadVideo = multer({
    storage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max for videos
    }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// ========== CHAT ROUTES ==========

// Get communication status for a match
router.get('/match/:matchId/status', protect, chatController.getCommunicationStatus);

// Get messages for a match
router.get('/match/:matchId/messages', protect, chatController.getMessages);

// Send a text message
router.post('/match/:matchId/messages', protect, chatController.sendMessage);

// Upload image
router.post(
    '/match/:matchId/upload/image',
    protect,
    uploadImage.single('image'),
    handleMulterError,
    chatController.uploadImage
);

// Upload video
router.post(
    '/match/:matchId/upload/video',
    protect,
    uploadVideo.single('video'),
    handleMulterError,
    chatController.uploadVideo
);

// Report a message
router.post('/messages/:messageId/report', protect, chatController.reportMessage);

// Delete a message
router.delete('/messages/:messageId', protect, chatController.deleteMessage);

// ========== VOICE CHAT ROUTES ==========

// Get active voice session for a match
router.get('/match/:matchId/voice', protect, chatController.getActiveVoiceSession);

// Create voice session
router.post('/match/:matchId/voice', protect, chatController.createVoiceSession);

// Join voice session
router.post('/voice/:sessionId/join', protect, chatController.joinVoiceSession);

// Update voice session
router.patch('/voice/:sessionId', protect, chatController.updateVoiceSession);

// Leave voice session
router.post('/voice/:sessionId/leave', protect, chatController.leaveVoiceSession);

// End voice session
router.post('/voice/:sessionId/end', protect, chatController.endVoiceSession);

module.exports = router;
