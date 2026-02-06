const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const sessionController = require('../controllers/session.controller');

// All routes are protected
router.use(protect);

// Get session details
router.get('/:matchId', sessionController.getSession);

// Toggle Timer
router.put('/:matchId/timer', sessionController.toggleTimer);

// Update Notes
router.put('/:matchId/notes', sessionController.updateNotes);

// Add Resource
router.post(
    '/:matchId/resources',
    [
        body('title', 'Title is required').not().isEmpty(),
        body('url', 'Valid URL is required').isURL()
    ],
    sessionController.addResource
);

// Add Task
router.post(
    '/:matchId/tasks',
    [
        body('title', 'Title is required').not().isEmpty()
    ],
    sessionController.addTask
);

// Update Task
router.put('/:matchId/tasks/:taskId', sessionController.updateTask);

// --- Advanced Features ---
// Milestones
router.post('/:matchId/milestones', sessionController.updateMilestone); // Add/Update

// Weekly Plan
router.post('/:matchId/plan', sessionController.updatePlan);

// Whiteboard
router.post('/:matchId/whiteboard', sessionController.updateWhiteboard);

// Agreement
router.post('/:matchId/agreement', sessionController.acceptAgreement);

// History
router.get('/:matchId/history', sessionController.getHistory);

// Complete Session
router.post('/:matchId/complete', sessionController.completeSession);

// Update Progress
router.put('/:matchId/progress', sessionController.updateProgress);

// Update Mentor Notes
router.put('/:matchId/mentor-notes', sessionController.updateMentorNotes);

module.exports = router;
