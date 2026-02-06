const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('Testing Bad ID...');
        // We need a token. Let's assume we can't get one easily.
        // But invalid ID check happens inside getSession, which is protected.
        // So request will fail 401 Unauthorized if no token.

        // I'll try the health endpoint with bad params? No.
        // I need to hit getSession.
        // I'll try to register a user just to get a token.
        const user = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test', email: `test${Date.now()}@test.com`, password: 'password123', defaultRole: 'learner'
        });
        const token = user.data.token;

        console.log('Got token. Requesting session with "bad_id"...');
        const res = await axios.get(`${API_URL}/sessions/bad_id`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success?', res.status);
    } catch (e) {
        console.log('Error Status:', e.response ? e.response.status : e.message);
        console.log('Error Body:', e.response ? JSON.stringify(e.response.data) : 'No body');
    }
}
run();
