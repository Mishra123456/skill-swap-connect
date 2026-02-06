const mongoose = require('mongoose');

// Define schemas (minimal)
const userSchema = new mongoose.Schema({ name: String });
const User = mongoose.model('User', userSchema);
const matchSchema = new mongoose.Schema({ status: String, requester: String, provider: String });
const Match = mongoose.model('Match', matchSchema);
const sessionSchema = new mongoose.Schema({ matchId: String, status: String }, { timestamps: true });
const Session = mongoose.model('Session', sessionSchema);

const MONGO_URI = 'mongodb+srv://skilluser:skillpass123@cluster0.purjuso.mongodb.net/skill_exchange';

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Get latest match
        const latestMatch = await Match.findOne().sort({ createdAt: -1 });
        if (!latestMatch) {
            console.log('No matches found');
            return;
        }

        console.log('Latest Match:', latestMatch._id);

        // Check if session exists
        let session = await Session.findOne({ matchId: latestMatch._id.toString() });
        if (session) {
            console.log('Session already exists:', session._id);
        } else {
            console.log('Creating session for match:', latestMatch._id);
            session = await Session.create({
                matchId: latestMatch._id.toString(),
                status: 'scheduled'
                // Add minimal fields if necessary
            });
            console.log('Session created:', session._id);
        }

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
})();
