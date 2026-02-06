const { validationResult } = require('express-validator');
const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, bio, location, privacySettings } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        // Handle privacy settings update safely
        if (privacySettings !== undefined) {
            // Get current user settings or default structure if missing
            const currentSettings = req.user.privacySettings || {
                isIncognito: false,
                allowRequestsFrom: 'everyone',
                showOnlineStatus: true
            };

            updateData.privacySettings = {
                ...currentSettings,
                ...privacySettings
            };
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

const addSkillOffered = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { skill } = req.body;
        const normalizedSkill = skill.toLowerCase().trim();

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.skillsOffered.includes(normalizedSkill)) {
            return res.status(400).json({
                success: false,
                message: 'Skill already exists in offered skills'
            });
        }

        user.skillsOffered.push(normalizedSkill);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Skill added to offered skills',
            data: { skillsOffered: user.skillsOffered }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add skill',
            error: error.message
        });
    }
};

const removeSkillOffered = async (req, res) => {
    try {
        const { skill } = req.params;
        const normalizedSkill = skill.toLowerCase().trim();

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skillIndex = user.skillsOffered.indexOf(normalizedSkill);
        if (skillIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found in offered skills'
            });
        }

        user.skillsOffered.splice(skillIndex, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Skill removed from offered skills',
            data: { skillsOffered: user.skillsOffered }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove skill',
            error: error.message
        });
    }
};

const addSkillWanted = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { skill } = req.body;
        const normalizedSkill = skill.toLowerCase().trim();

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.skillsWanted.includes(normalizedSkill)) {
            return res.status(400).json({
                success: false,
                message: 'Skill already exists in wanted skills'
            });
        }

        user.skillsWanted.push(normalizedSkill);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Skill added to wanted skills',
            data: { skillsWanted: user.skillsWanted }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add skill',
            error: error.message
        });
    }
};

const removeSkillWanted = async (req, res) => {
    try {
        const { skill } = req.params;
        const normalizedSkill = skill.toLowerCase().trim();

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skillIndex = user.skillsWanted.indexOf(normalizedSkill);
        if (skillIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found in wanted skills'
            });
        }

        user.skillsWanted.splice(skillIndex, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Skill removed from wanted skills',
            data: { skillsWanted: user.skillsWanted }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove skill',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { _id: { $ne: req.user.id } };

        // Exclude incognito users unless they are the current user (which is already excluded above)
        // We use dot notation to check nested field
        query['privacySettings.isIncognito'] = { $ne: true };

        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};

const getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('stats trustLevel averageRating totalRatings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                stats: user.stats,
                trustLevel: user.trustLevel,
                rating: {
                    average: user.averageRating,
                    count: user.totalRatings
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get stats',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    addSkillOffered,
    removeSkillOffered,
    addSkillWanted,
    removeSkillWanted,
    getAllUsers,
    getUserById,
    getStats
};
