import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

async function runTests() {
    console.log('--- Starting API E2E Tests ---');
    try {
        // 1. Auth Login
        console.log('1. Testing Login...');
        const loginRes = await api.post('/auth/login', { username: 'admin', password: 'password123' });
        const token = loginRes.data.token;
        console.log('Login successful. Token received.');
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 2. Add Room
        console.log('2. Testing Add Room...');
        const roomRes = await api.post('/rooms', { room_number: `T-${Date.now().toString().slice(-4)}`, capacity: 2 });
        const roomId = roomRes.data.id;
        console.log('Room added successfully:', roomRes.data);

        // 3. Add Student
        console.log('3. Testing Add Student...');
        const studentRes = await api.post('/students', { name: 'Test Student', contact: '1234567890' });
        const studentId = studentRes.data.id;
        console.log('Student added successfully:', studentRes.data);

        // 4. Allocate Room
        console.log('4. Testing Allocate Room...');
        const allocRes = await api.post('/allocations', { student_id: studentId, room_id: roomId });
        const allocId = allocRes.data.id;
        console.log('Allocation successful:', allocRes.data);

        // 5. Add Payment
        console.log('5. Testing Add Payment...');
        const payRes = await api.post('/payments', { student_id: studentId, amount: 500, status: 'Paid' });
        console.log('Payment successful:', payRes.data);

        // 6. Delete Allocation (Cleanup)
        console.log('6. Cleaning up Allocation...');
        await api.delete(`/allocations/${allocId}`);
        console.log('Cleanup successful.');

        console.log('--- All API Tests Passed! ---');
    } catch (error) {
        console.error('Test failed at some point!');
        console.error(error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTests();
