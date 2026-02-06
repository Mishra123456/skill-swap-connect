const { validationResult } = require('express-validator');
const Match = require('../models/Match');
const User = require('../models/User');
const Session = require('../models/Session');
const { updateUserRating } = require('../utils/rating.util');

const findMatches = async (req, res) => {
    try {
        const { mode } = req.query;
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let potentialMatches;
        let noSkillsMessage;

        if (mode === 'mentor') {
            if (currentUser.skillsOffered.length === 0) {
                noSkillsMessage = 'Add skills you offer to find students';
            } else {
                potentialMatches = await User.find({
                    _id: { $ne: req.user.id },
                    skillsWanted: { $in: currentUser.skillsOffered }
                }).select('name email bio location skillsOffered skillsWanted averageRating totalRatings');
            }
        } else {
            if (currentUser.skillsWanted.length === 0) {
                noSkillsMessage = 'Add skills you want to find matches';
            } else {
                potentialMatches = await User.find({
                    _id: { $ne: req.user.id },
                    skillsOffered: { $in: currentUser.skillsWanted }
                }).select('name email bio location skillsOffered skillsWanted averageRating totalRatings');
            }
        }

        if (noSkillsMessage) {
            return res.status(200).json({
                success: true,
                message: noSkillsMessage,
                data: { matches: [] }
            });
        }

        const matchResults = potentialMatches.map(user => {
            let matchingSkills, mutualInterest;

            if (mode === 'mentor') {
                // I am mentor. They want what I offer.
                matchingSkills = user.skillsWanted.filter(skill =>
                    currentUser.skillsOffered.includes(skill)
                );
                // Mutual: They offer what I want
                mutualInterest = user.skillsOffered.filter(skill =>
                    currentUser.skillsWanted.includes(skill)
                );
            } else {
                // I am learner. They offer what I want.
                matchingSkills = user.skillsOffered.filter(skill =>
                    currentUser.skillsWanted.includes(skill)
                );
                // Mutual: They want what I offer
                mutualInterest = user.skillsWanted.filter(skill =>
                    currentUser.skillsOffered.includes(skill)
                );
            }

            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio,
                    location: user.location,
                    averageRating: user.averageRating,
                    totalRatings: user.totalRatings
                },
                matchingSkills,
                mutualInterest,
                isMutual: mutualInterest.length > 0
            };
        });

        matchResults.sort((a, b) => {
            if (b.isMutual !== a.isMutual) return b.isMutual - a.isMutual;
            if (b.matchingSkills.length !== a.matchingSkills.length) {
                return b.matchingSkills.length - a.matchingSkills.length;
            }
            return b.user.averageRating - a.user.averageRating;
        });

        res.status(200).json({
            success: true,
            data: { matches: matchResults }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to find matches',
            error: error.message
        });
    }
};

const sendRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { providerId, skillRequested, skillOffered, message } = req.body;

        if (providerId === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send request to yourself'
            });
        }

        const provider = await User.findById(providerId);

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // Privacy Check
        if (provider.privacySettings) {
            const { allowRequestsFrom } = provider.privacySettings;
            if (allowRequestsFrom === 'none') {
                return res.status(403).json({
                    success: false,
                    message: 'This user is not accepting requests at the moment'
                });
            }
            if (allowRequestsFrom === 'verified') {
                // simple verification check: user has completed at least 1 exchange or has a rating
                const requester = await User.findById(req.user.id);
                if (requester.totalRatings < 1) { // Strict check
                    return res.status(403).json({
                        success: false,
                        message: 'This user only accepts requests from verified members (completed at least 1 exchange)'
                    });
                }
            }
        }

        const requester = await User.findById(req.user.id);
        if (!requester) {
            return res.status(404).json({
                success: false,
                message: 'Requester not found'
            });
        }

        const normalizedSkillRequested = skillRequested.toLowerCase().trim();
        const normalizedSkillOffered = skillOffered.toLowerCase().trim();

        if (!provider.skillsOffered.includes(normalizedSkillRequested)) {
            return res.status(400).json({
                success: false,
                message: 'Provider does not offer the requested skill'
            });
        }

        if (!requester.skillsOffered.includes(normalizedSkillOffered)) {
            return res.status(400).json({
                success: false,
                message: 'You do not offer the skill you are trying to exchange'
            });
        }

        const existingMatch = await Match.findOne({
            $or: [
                {
                    requester: req.user.id,
                    provider: providerId,
                    skillRequested: normalizedSkillRequested,
                    skillOffered: normalizedSkillOffered,
                    status: { $in: ['pending', 'accepted'] }
                },
                {
                    requester: providerId,
                    provider: req.user.id,
                    skillRequested: normalizedSkillOffered,
                    skillOffered: normalizedSkillRequested,
                    status: { $in: ['pending', 'accepted'] }
                }
            ]
        });

        if (existingMatch) {
            return res.status(409).json({
                success: false,
                message: 'A similar exchange request already exists'
            });
        }

        const match = await Match.create({
            requester: req.user.id,
            provider: providerId,
            skillRequested: normalizedSkillRequested,
            skillOffered: normalizedSkillOffered,
            message: message || ''
        });

        const populatedMatch = await Match.findById(match._id)
            .populate('requester', 'name email')
            .populate('provider', 'name email');

        res.status(201).json({
            success: true,
            message: 'Exchange request sent successfully',
            data: { match: populatedMatch }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send request',
            error: error.message
        });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const { status, type } = req.query;

        let query = {};

        if (type === 'sent') {
            query.requester = req.user.id;
        } else if (type === 'received') {
            query.provider = req.user.id;
        } else {
            query.$or = [
                { requester: req.user.id },
                { provider: req.user.id }
            ];
        }

        if (status && ['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
            query.status = status;
        }

        const matches = await Match.find(query)
            .populate('requester', 'name email averageRating')
            .populate('provider', 'name email averageRating')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { matches }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get requests',
            error: error.message
        });
    }
};

const getRequestById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('requester', 'name email bio location skillsOffered skillsWanted averageRating')
            .populate('provider', 'name email bio location skillsOffered skillsWanted averageRating');

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const isRequester = match.requester._id.toString() === req.user.id.toString();
        const isProvider = match.provider._id.toString() === req.user.id.toString();

        if (!isRequester && !isProvider) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this request'
            });
        }

        res.status(200).json({
            success: true,
            data: { match }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get request',
            error: error.message
        });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (match.provider.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the provider can accept requests'
            });
        }

        if (match.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept a request with status: ${match.status}`
            });
        }

        match.status = 'accepted';
        await match.save();

        // Auto-create Session
        let session = await Session.findOne({ matchId: match._id });
        if (!session) {
            await Session.create({
                matchId: match._id,
                status: 'active'
            });
        }

        const populatedMatch = await Match.findById(match._id)
            .populate('requester', 'name email')
            .populate('provider', 'name email');

        res.status(200).json({
            success: true,
            message: 'Request accepted successfully',
            data: { match: populatedMatch }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to accept request',
            error: error.message
        });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (match.provider.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the provider can reject requests'
            });
        }

        if (match.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject a request with status: ${match.status}`
            });
        }

        match.status = 'rejected';
        await match.save();

        res.status(200).json({
            success: true,
            message: 'Request rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reject request',
            error: error.message
        });
    }
};

const completeExchange = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const isRequester = match.requester.toString() === req.user.id.toString();
        const isProvider = match.provider.toString() === req.user.id.toString();

        if (!isRequester && !isProvider) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to complete this exchange'
            });
        }

        if (match.status !== 'accepted') {
            return res.status(400).json({
                success: false,
                message: 'Only accepted exchanges can be marked as completed'
            });
        }

        match.status = 'completed';
        match.completedAt = new Date();
        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('requester', 'name email')
            .populate('provider', 'name email');

        res.status(200).json({
            success: true,
            message: 'Exchange marked as completed',
            data: { match: populatedMatch }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete exchange',
            error: error.message
        });
    }
};

const rateExchange = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { score, comment } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (match.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only rate completed exchanges'
            });
        }

        const isRequester = match.requester.toString() === req.user.id.toString();
        const isProvider = match.provider.toString() === req.user.id.toString();

        if (!isRequester && !isProvider) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to rate this exchange'
            });
        }

        if (isRequester) {
            if (match.requesterRating && match.requesterRating.score) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this exchange'
                });
            }

            match.requesterRating = {
                score,
                comment: comment || '',
                ratedAt: new Date()
            };

            await updateUserRating(match.provider, score);

            // Update stats and trust level
            const providerUser = await User.findById(match.provider);
            if (providerUser) {
                providerUser.stats.sessionsCompleted += 1;
                // Simple trust logic: Reliable = >5 sessions & >4.0 rating; Verified = >15 sessions & >4.5 rating
                if (providerUser.stats.sessionsCompleted >= 15 && providerUser.averageRating >= 4.5) {
                    providerUser.trustLevel = 'verified';
                } else if (providerUser.stats.sessionsCompleted >= 5 && providerUser.averageRating >= 4.0) {
                    providerUser.trustLevel = 'reliable';
                }
                await providerUser.save();
            }
        } else {
            if (match.providerRating && match.providerRating.score) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this exchange'
                });
            }

            match.providerRating = {
                score,
                comment: comment || '',
                ratedAt: new Date()
            };

            await updateUserRating(match.requester, score);

            // Update stats and trust level
            const requesterUser = await User.findById(match.requester);
            if (requesterUser) {
                requesterUser.stats.sessionsCompleted += 1;
                if (requesterUser.stats.sessionsCompleted >= 15 && requesterUser.averageRating >= 4.5) {
                    requesterUser.trustLevel = 'verified';
                } else if (requesterUser.stats.sessionsCompleted >= 5 && requesterUser.averageRating >= 4.0) {
                    requesterUser.trustLevel = 'reliable';
                }
                await requesterUser.save();
            }
        }

        await match.save();

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            data: { match }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message
        });
    }
};

const cancelRequest = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (match.requester.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the requester can cancel the request'
            });
        }

        if (match.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a request with status: ${match.status}`
            });
        }

        await Match.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Request cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel request',
            error: error.message
        });
    }
};

module.exports = {
    findMatches,
    sendRequest,
    getMyRequests,
    getRequestById,
    acceptRequest,
    rejectRequest,
    completeExchange,
    rateExchange,
    cancelRequest
};
