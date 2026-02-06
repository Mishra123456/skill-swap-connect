try {
    console.log("Starting test...");
    require('dotenv').config();
    console.log("Dotenv loaded");

    console.log("Loading db config...");
    const connectDB = require('./src/config/db');
    console.log("DB config loaded");

    console.log("Loading routes...");
    try { require('./src/routes/health.routes'); console.log("Health OK"); } catch (e) { console.log("Health FAIL"); throw e; }
    try { require('./src/routes/auth.routes'); console.log("Auth OK"); } catch (e) { console.log("Auth FAIL"); throw e; }
    try { require('./src/routes/user.routes'); console.log("User OK"); } catch (e) { console.log("User FAIL"); throw e; }
    try { require('./src/routes/match.routes'); console.log("Match OK"); } catch (e) { console.log("Match FAIL"); throw e; }
    try { require('./src/routes/chat.routes'); console.log("Chat OK"); } catch (e) { console.log("Chat FAIL"); throw e; }
    try { require('./src/routes/session.routes'); console.log("Session OK"); } catch (e) { console.log("Session FAIL"); throw e; }

    console.log("Loading app...");
    const app = require('./src/app');
    console.log("App loaded");

    console.log("Test complete.");
} catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
}
