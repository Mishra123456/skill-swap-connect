const mongoose = require('mongoose');
const Match = require('./server/src/models/Match');
const Session = require('./server/src/models/Session');
const User = require('./server/src/models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/skill-swap'; // Default local URI

const checkState = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const matchId = '6985afed5163f0d54cbcb88b';
        console.log(`Checking Match ID: ${matchId}`);

        const match = await Match.findById(matchId);
        if (!match) {
            console.log('❌ Match NOT FOUND');
        } else {
            console.log('✅ Match FOUND');
            console.log(`   Status: ${match.status}`);
            console.log(`   Requester: ${match.requester}`);
            console.log(`   Provider: ${match.provider}`);
        }

        const session = await Session.findOne({ matchId });
        if (!session) {
            console.log('❌ Session NOT FOUND');
        } else {
            console.log('✅ Session FOUND');
            console.log(`   ID: ${session._id}`);
            console.log(`   Status: ${session.status}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkState();
