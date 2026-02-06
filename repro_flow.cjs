const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('1. Registering User A...');
        const userA = await axios.post(`${API_URL}/auth/register`, {
            name: 'UserA', email: `usera${Date.now()}@test.com`, password: 'password123', defaultRole: 'learner'
        });
        const tokenA = userA.data.token;
        const idA = userA.data.user._id;
        console.log('User A registered:', idA);

        console.log('2. Registering User B...');
        const userB = await axios.post(`${API_URL}/auth/register`, {
            name: 'UserB', email: `userb${Date.now()}@test.com`, password: 'password123', defaultRole: 'mentor'
        });
        const tokenB = userB.data.token;
        const idB = userB.data.user._id;
        console.log('User B registered:', idB);

        console.log('3. User B adds skill...');
        await axios.post(`${API_URL}/users/skills/offered`, { skill: 'Coding' }, { headers: { Authorization: `Bearer ${tokenB}` } });

        console.log('4. User A requests match...');
        const reqMatch = await axios.post(`${API_URL}/matches/request`, {
            providerId: idB, skillRequested: 'Coding', skillOffered: 'Learning', message: 'Teach me'
        }, { headers: { Authorization: `Bearer ${tokenA}` } });
        const matchId = reqMatch.data.match._id;
        console.log('Match requested:', matchId);

        console.log('5. User B accepts match...');
        await axios.patch(`${API_URL}/matches/requests/${matchId}/accept`, {}, { headers: { Authorization: `Bearer ${tokenB}` } });
        console.log('Match accepted');

        console.log('6. User A gets session...');
        try {
            const session = await axios.get(`${API_URL}/sessions/${matchId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
            console.log('Session retrieved successfully:', session.data.success);
        } catch (e) {
            console.error('FAILED to get session:', e.response ? e.response.status : e.message);
            if (e.response && e.response.data) console.error(e.response.data);
        }

    } catch (e) {
        console.error('Error in flow:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

run();
