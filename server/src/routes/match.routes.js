const express = require('express');
const { body, param } = require('express-validator');
const {
    findMatches,
    sendRequest,
    getMyRequests,
    getRequestById,
    acceptRequest,
    rejectRequest,
    completeExchange,
    rateExchange,
    cancelRequest
} = require('../controllers/match.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/find', findMatches);

router.post(
    '/request',
    [
        body('providerId')
            .notEmpty().withMessage('Provider ID is required')
            .isMongoId().withMessage('Invalid provider ID'),
        body('skillRequested')
            .trim()
            .notEmpty().withMessage('Skill requested is required')
            .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1-50 characters'),
        body('skillOffered')
            .trim()
            .notEmpty().withMessage('Skill offered is required')
            .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1-50 characters'),
        body('message')
            .optional()
            .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
    ],
    sendRequest
);

router.get('/requests', getMyRequests);

router.get(
    '/requests/:id',
    [
        param('id').isMongoId().withMessage('Invalid request ID')
    ],
    getRequestById
);

router.patch(
    '/requests/:id/accept',
    [
        param('id').isMongoId().withMessage('Invalid request ID')
    ],
    acceptRequest
);

router.patch(
    '/requests/:id/reject',
    [
        param('id').isMongoId().withMessage('Invalid request ID')
    ],
    rejectRequest
);

router.patch(
    '/requests/:id/complete',
    [
        param('id').isMongoId().withMessage('Invalid request ID')
    ],
    completeExchange
);

router.post(
    '/requests/:id/rate',
    [
        param('id').isMongoId().withMessage('Invalid request ID'),
        body('score')
            .notEmpty().withMessage('Rating score is required')
            .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment')
            .optional()
            .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
    ],
    rateExchange
);

router.delete(
    '/requests/:id',
    [
        param('id').isMongoId().withMessage('Invalid request ID')
    ],
    cancelRequest
);

module.exports = router;
