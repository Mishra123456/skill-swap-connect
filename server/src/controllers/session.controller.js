const Session = require('../models/Session');
const Match = require('../models/Match');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
    try {
        const logPath = path.join(__dirname, '../../debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        // Fallback
        console.log('[LOG_FAIL]', msg);
    }
};

// Helper to get or create session
const getOrCreateSession = async (matchId) => {
    logToFile(`[getOrCreateSession] Lookup for matchId: ${matchId}`);
    let session = await Session.findOne({ matchId });
    if (session) {
        logToFile(`[getOrCreateSession] Found existing session: ${session._id}`);
    } else {
        logToFile(`[getOrCreateSession] Session not found. Checking match...`);
        // Double check match exists
        const match = await Match.findById(matchId);
        if (!match) {
            logToFile(`[getOrCreateSession] Match NOT found for ID: ${matchId}`);
        } else {
            logToFile(`[getOrCreateSession] Match found. Status: ${match.status}`);
            if (match.status === 'accepted' || match.status === 'active') {
                try {
                    session = await Session.create({ matchId, status: 'active' });
                    logToFile(`[getOrCreateSession] Created NEW session: ${session._id}`);
                } catch (err) {
                    logToFile(`[getOrCreateSession] Creation FAILED: ${err.message}`);
                }
            } else {
                logToFile(`[getOrCreateSession] Match not accepted/active. Skipping creation.`);
            }
        }
    }
    return session;
};

// Get session details
const getSession = async (req, res) => {
    try {
        const { matchId } = req.params;
        logToFile(`[getSession] Request received for matchId: ${matchId} from user: ${req.user.id}`);

        // 1. Verify Match exists and Auth user
        const match = await Match.findById(matchId);
        if (!match) {
            logToFile(`[getSession] Match not found`);
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const userId = req.user.id.toString();
        const requesterId = match.requester.toString();
        const providerId = match.provider.toString();

        if (requesterId !== userId && providerId !== userId) {
            logToFile(`[getSession] Auth failed. User: ${userId}, Req: ${requesterId}, Prov: ${providerId}`);
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // 2. Find or Create Session using helper
        let session = await getOrCreateSession(matchId);

        if (!session) {
            // Should not happen if match exists and is accepted/valid, unless create failed
            // Try explicit create one last time if match is accepted/active
            if (match.status === 'accepted' || match.status === 'active') {
                session = await Session.create({ matchId, status: 'active' });
            }
        }

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found (Create failed)' });
        }

        // 3. Populate fields (since getOrCreateSession returns unpopulated doc)
        // We need to re-fetch or populate the document
        session = await Session.findById(session._id)
            .populate('resources.addedBy', 'name')
            .populate('tasks.createdBy', 'name');

        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        console.error('GetSession Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get session', error: error.message });
    }
};

// Toggle Timer (Start/Pause)
const toggleTimer = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { action } = req.body; // 'start' or 'pause'

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        if (action === 'pause' && session.status === 'active') {
            // Calculate time since lastActive and add to accumulatedTime
            const now = new Date();
            const additionalSeconds = Math.floor((now - new Date(session.lastActive)) / 1000);
            session.accumulatedTime += additionalSeconds;
            session.status = 'paused';

            // Update Users' Stats
            const match = await Match.findById(matchId);
            if (match) {
                const additionalMinutes = Math.floor(additionalSeconds / 60);
                if (additionalMinutes > 0) {
                    await User.findByIdAndUpdate(match.requester, { $inc: { 'stats.totalMinutesLearned': additionalMinutes } });
                    await User.findByIdAndUpdate(match.provider, { $inc: { 'stats.totalMinutesTaught': additionalMinutes } });
                }
            }
        } else if (action === 'start' && session.status === 'paused') {
            session.status = 'active';
            session.lastActive = new Date();
        }

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to toggle timer', error: error.message });
    }
};

// Update Notes
const updateNotes = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { notes } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.notes = notes;
        await session.save();

        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notes', error: error.message });
    }
};

// Add Resource
const addResource = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { title, type, url } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.resources.push({
            title,
            type,
            url,
            addedBy: req.user.id
        });

        await session.save();

        // Re-fetch to populate
        const updatedSession = await Session.findById(session._id).populate('resources.addedBy', 'name');

        res.status(200).json({ success: true, data: { session: updatedSession } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add resource', error: error.message });
    }
};

// Add Task
const addTask = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { title } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.tasks.push({
            title,
            status: 'pending',
            createdBy: req.user.id
        });

        await session.save();
        // Re-fetch to populate
        const updatedSession = await Session.findById(session._id).populate('tasks.createdBy', 'name');

        res.status(200).json({ success: true, data: { session: updatedSession } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
    }
};

// Update Task Status
const updateTask = async (req, res) => {
    try {
        const { matchId, taskId } = req.params;
        const { status } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const task = session.tasks.id(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        task.status = status;
        await session.save();

        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
    }
};

// --- Advanced Features Controllers ---

// Add/Update Milestone
const updateMilestone = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { milestoneId, title, description, status, deadline } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        if (milestoneId) {
            // Update existing
            const milestone = session.milestones.id(milestoneId);
            if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

            if (title) milestone.title = title;
            if (description) milestone.description = description;
            if (status) {
                milestone.status = status;
                if (status === 'completed' && !milestone.completedAt) {
                    milestone.completedAt = new Date();
                    // Add history
                    session.history.push({
                        action: 'milestone_complete',
                        details: `Completed: ${milestone.title}`,
                        performedBy: req.user.id
                    });
                }
            }
            if (deadline) milestone.deadline = deadline;
        } else {
            // Add new
            session.milestones.push({
                title,
                description,
                status: 'pending',
                deadline
            });
            session.history.push({
                action: 'milestone_add',
                details: `Added: ${title}`,
                performedBy: req.user.id
            });
        }

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update milestone', error: error.message });
    }
};

// Update Weekly Plan
const updatePlan = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { weekNumber, goals, outcomes, status } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const planIndex = session.weeklyPlan.findIndex(p => p.weekNumber === weekNumber);

        if (planIndex >= 0) {
            session.weeklyPlan[planIndex].goals = goals || session.weeklyPlan[planIndex].goals;
            session.weeklyPlan[planIndex].outcomes = outcomes || session.weeklyPlan[planIndex].outcomes;
            session.weeklyPlan[planIndex].status = status || session.weeklyPlan[planIndex].status;
        } else {
            session.weeklyPlan.push({ weekNumber, goals, outcomes, status });
        }

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update plan', error: error.message });
    }
};

// Update Whiteboard
const updateWhiteboard = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { snapshot } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.whiteboard = {
            snapshot,
            updatedAt: new Date()
        };

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save whiteboard', error: error.message });
    }
};

// Accept Agreement
const acceptAgreement = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { goals, commitment, guidelines } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // If details provided, update them (usually by first person)
        if (goals) session.agreement.goals = goals;
        if (commitment) session.agreement.commitment = commitment;
        if (guidelines) session.agreement.guidelines = guidelines;

        // Add user to acceptedBy if not present
        if (!session.agreement.acceptedBy.includes(req.user.id)) {
            session.agreement.acceptedBy.push(req.user.id);
        }

        // If both accepted (assuming 2 participants), set status active
        // Logic assumes 2 people. We could check match participants count if needed.
        if (session.agreement.acceptedBy.length >= 2) {
            session.agreement.status = 'active';
            session.history.push({
                action: 'agreement_signed',
                details: 'Session Agreement activated',
                performedBy: req.user.id
            });
        }

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to accept agreement', error: error.message });
    }
};

// Get History
const getHistory = async (req, res) => {
    try {
        const { matchId } = req.params;
        let session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session = await Session.findById(session._id).select('history').populate('history.performedBy', 'name');

        res.status(200).json({ success: true, data: { history: session.history } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
    }
};

// Complete Session
const completeSession = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { feedback } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        // Update feedback
        const isRequester = match.requester.toString() === req.user.id;
        const feedbackData = {
            ...feedback,
            submittedAt: new Date()
        };

        if (isRequester) {
            session.feedback.learner = feedbackData;
        } else {
            session.feedback.mentor = feedbackData;
        }

        // Mark as completed
        if (session.status !== 'completed') {
            session.status = 'completed';
            session.history.push({
                action: 'session_complete',
                details: 'Session completed',
                performedBy: req.user.id
            });
        }

        await session.save();
        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to complete session', error: error.message });
    }
};

// Update Progress
const updateProgress = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { progress } = req.body;

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.progress = progress;
        await session.save();

        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update progress', error: error.message });
    }
};

// Update Mentor Notes
const updateMentorNotes = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { notes } = req.body;

        // Ensure user is the mentor (provider)
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        // In the Match model, 'provider' is the one offering the skill (Mentor)
        if (match.provider.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the mentor can update these notes' });
        }

        const session = await getOrCreateSession(matchId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        session.mentorNotes = notes;
        await session.save();

        res.status(200).json({ success: true, data: { session } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update mentor notes', error: error.message });
    }
};

module.exports = {
    getSession,
    toggleTimer,
    updateNotes,
    addResource,
    addTask,
    updateTask,
    completeSession,
    updateMilestone,
    updatePlan,
    updateWhiteboard,
    acceptAgreement,
    getHistory,
    updateProgress,
    updateMentorNotes
};
