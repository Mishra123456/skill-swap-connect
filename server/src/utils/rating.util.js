const User = require('../models/User');

const updateUserRating = async (userId, newRating) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    user.ratingSum += newRating;
    user.totalRatings += 1;
    user.averageRating = Number((user.ratingSum / user.totalRatings).toFixed(2));

    await user.save();

    return {
        averageRating: user.averageRating,
        totalRatings: user.totalRatings
    };
};

const calculateAverageRating = (ratingSum, totalRatings) => {
    if (totalRatings === 0) return 0;
    return Number((ratingSum / totalRatings).toFixed(2));
};

module.exports = {
    updateUserRating,
    calculateAverageRating
};
