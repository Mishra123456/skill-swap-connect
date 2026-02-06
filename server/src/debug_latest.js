const mongoose = require('mongoose');

// Define schemas (minimal)
const userSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model('User', userSchema);
const matchSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    skillRequested: String,
    skillOffered: String
}, { timestamps: true });
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

        if (latestMatch) {
            console.log('--- LATEST MATCH ---');
            console.log('ID:', latestMatch._id.toString());
            console.log('Status:', latestMatch.status);
            console.log('Created At:', latestMatch.createdAt);

            const req = await User.findById(latestMatch.requester);
            const prov = await User.findById(latestMatch.provider);

            console.log(`Requester: ${req ? req.name : 'Unknown'} (${latestMatch.requester})`);
            console.log(`Provider:  ${prov ? prov.name : 'Unknown'} (${latestMatch.provider})`);

            // Check session
            const session = await Session.findOne({ matchId: latestMatch._id.toString() });
            if (session) {
                console.log('Session FOUND:', session);
            } else {
                console.log('Session NOT FOUND for this match');
            }
        } else {
            console.log('No matches found');
        }

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
})();
