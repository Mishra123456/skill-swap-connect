const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    location: {
        type: String,
        maxlength: [100, 'Location cannot exceed 100 characters'],
        default: ''
    },
    skillsOffered: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    skillsWanted: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    ratingSum: {
        type: Number,
        default: 0
    },
    privacySettings: {
        isIncognito: {
            type: Boolean,
            default: false
        },
        allowRequestsFrom: {
            type: String,
            enum: ['everyone', 'verified', 'none'],
            default: 'everyone'
        },
        showOnlineStatus: {
            type: Boolean,
            default: true
        }
    },
    trustLevel: {
        type: String,
        enum: ['new', 'reliable', 'verified'],
        default: 'new'
    },
    stats: {
        totalMinutesLearned: { type: Number, default: 0 },
        totalMinutesTaught: { type: Number, default: 0 },
        sessionsCompleted: { type: Number, default: 0 }
    },
    defaultRole: {
        type: String,
        enum: ['learner', 'mentor'],
        default: 'learner'
    },
    mentorProfile: {
        experienceYears: { type: Number, default: 0 },
        teachingStyle: { type: String, default: '' },
        availability: { type: String, default: '' },
        linkedinProfile: { type: String, default: '' },
        certifications: [{ type: String }],
        bio: { type: String, default: '' } // Specific bio for mentor profile
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
