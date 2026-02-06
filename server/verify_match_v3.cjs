const mongoose = require('mongoose');
const Match = require('./src/models/Match');
const Session = require('./src/models/Session');

const MONGO_URI = 'mongodb+srv://skilluser:skillpass123@cluster0.purjuso.mongodb.net/skill_exchange';

const check = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        const matchId = '6985afed5163f0d54cbcb88b';
        console.log(`Checking Valid ID: ${matchId}`);

        const match = await Match.findById(matchId);
        console.log(`Match Found: ${!!match}`);
        if (match) {
            console.log(`Match Status: ${match.status}`);
            console.log(`Requester: ${match.requester}`);
            console.log(`Provider: ${match.provider}`);
        }

        const session = await Session.findOne({ matchId });
        console.log(`Session Found: ${!!session}`);
        if (session) {
            console.log(`Session Status: ${session.status}`);
        }

        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
};

check();
