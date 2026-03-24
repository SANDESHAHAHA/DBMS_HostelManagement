import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

async function runTests() {
    console.log('--- Starting Integration Tests ---');
    try {
        // 1. Login
        const loginRes = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
        const token = loginRes.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Logged in successfully');

        // 2. Create Room (capacity 1)
        const roomRes = await api.post('/rooms', { room_number: 'TEST-101', capacity: 1 });
        const roomId = roomRes.data.id;
        console.log('✅ Created test room with capacity 1');

        // 3. Create Students
        const stu1Res = await api.post('/students', { name: 'Student One', contact: 'Contact 1' });
        const stu1Id = stu1Res.data.id;
        const stu2Res = await api.post('/students', { name: 'Student Two', contact: 'Contact 2' });
        const stu2Id = stu2Res.data.id;
        console.log('✅ Created two test students');

        // 4. Allocate Room to Student 1
        await api.post('/allocations', { student_id: stu1Id, room_id: roomId });
        console.log('✅ Allocated Student 1 to Room TEST-101');

        // 5. Try Allocate Room to Student 2 (Should Fail - Capacity)
        try {
            await api.post('/allocations', { student_id: stu2Id, room_id: roomId });
            console.error('❌ FAIL: Expected capacity error but succeeded');
        } catch (err) {
            console.log(`✅ Passed Capacity Test: ${err.response.data.message}`);
        }

        // 6. Create Room 2
        const room2Res = await api.post('/rooms', { room_number: 'TEST-102', capacity: 2 });
        const room2Id = room2Res.data.id;

        // 7. Try Allocate Student 1 to Room 2 (Should Fail - Duplicate Allocation)
        try {
            await api.post('/allocations', { student_id: stu1Id, room_id: room2Id });
            console.error('❌ FAIL: Expected duplicate allocation error but succeeded');
        } catch (err) {
            console.log(`✅ Passed Duplicate Allocation Test: ${err.response.data.message}`);
        }

        console.log('--- All tests completed successfully! ---');
    } catch (err) {
        console.error('Test script failed:', err.response?.data || err.message);
    }
}

runTests();
