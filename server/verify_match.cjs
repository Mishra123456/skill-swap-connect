const mongoose = require('mongoose');
const Match = require('./src/models/Match');
const Session = require('./src/models/Session');
const fs = require('fs');
const path = require('path');

// Use the URI from .env (hardcoded here for script reliability)
const MONGO_URI = 'mongodb+srv://skilluser:skillpass123@cluster0.purjuso.mongodb.net/skill_exchange';

const outputFile = path.join(__dirname, 'match_status.txt');

const check = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const matchId = '6985afed5163f0d54cbcb88b';

        const match = await Match.findById(matchId);
        const session = await Session.findOne({ matchId });

        let output = `Check Time: ${new Date().toISOString()}\n`;
        output += `Match ID: ${matchId}\n`;
        output += `Match Found: ${!!match}\n`;
        if (match) {
            output += `Match Status: ${match.status}\n`;
            output += `Requester: ${match.requester}\n`;
            output += `Provider: ${match.provider}\n`;
        }
        output += `Session Found: ${!!session}\n`;
        if (session) {
            output += `Session ID: ${session._id}\n`;
        }

        fs.writeFileSync(outputFile, output);
        console.log("Check complete. Written to match_status.txt");
        process.exit(0);
    } catch (err) {
        fs.writeFileSync(outputFile, `Error: ${err.message}`);
        console.error(err);
        process.exit(1);
    }
};

check();
