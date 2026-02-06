const express = require('express');
const { body, param } = require('express-validator');
const {
    getProfile,
    updateProfile,
    addSkillOffered,
    removeSkillOffered,
    addSkillWanted,
    removeSkillWanted,
    getAllUsers,
    getUserById,
    getStats
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/profile', getProfile);

router.put(
    '/profile',
    [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
        body('bio')
            .optional()
            .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
        body('location')
            .optional()
            .isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
    ],
    updateProfile
);

router.post(
    '/skills/offered',
    [
        body('skill')
            .trim()
            .notEmpty().withMessage('Skill is required')
            .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1-50 characters')
    ],
    addSkillOffered
);

router.delete(
    '/skills/offered/:skill',
    [
        param('skill')
            .trim()
            .notEmpty().withMessage('Skill is required')
    ],
    removeSkillOffered
);

router.post(
    '/skills/wanted',
    [
        body('skill')
            .trim()
            .notEmpty().withMessage('Skill is required')
            .isLength({ min: 1, max: 50 }).withMessage('Skill must be 1-50 characters')
    ],
    addSkillWanted
);

router.delete(
    '/skills/wanted/:skill',
    [
        param('skill')
            .trim()
            .notEmpty().withMessage('Skill is required')
    ],
    removeSkillWanted
);

router.get('/', getAllUsers);

router.get(
    '/:id',
    [
        param('id')
            .isMongoId().withMessage('Invalid user ID')
    ],
    getUserById
);

module.exports = router;
