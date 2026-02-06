const mongoose = require('mongoose');
const Match = require('./src/models/Match');
const User = require('./src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
};

const debugAuth = async () => {
    await connectDB();

    const matchId = '697dcb2a5a399e1c7ff8dd27';

    console.log(`\n--- Debugging Match: ${matchId} ---`);

    try {
        // Using lean() to get plain JSON 
        const match = await Match.findOne({ _id: matchId }).lean();

        if (!match) {
            console.log('❌ Match NOT FOUND in DB');
        } else {
            console.log('✅ Match Found in DB:');
            console.log(JSON.stringify(match, null, 2));

            console.log('\n--- Participants ---');
            const requesterId = match.requester;
            const providerId = match.provider;

            const requester = await User.findById(requesterId).lean();
            const provider = await User.findById(providerId).lean();

            console.log('Requester:', requester ? `${requester.name} (${requester._id})` : `MISSING (${requesterId})`);
            console.log('Provider:', provider ? `${provider.name} (${provider._id})` : `MISSING (${providerId})`);
        }

    } catch (error) {
        console.error('Script Error:', error);
    } finally {
        console.log('Done.');
        mongoose.disconnect();
    }
};

debugAuth();
