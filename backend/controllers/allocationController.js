import pool from '../db/index.js';

// Assign a student to a room
export const allocateRoom = async (req, res) => {
    const { student_id, room_id } = req.body;

    if (!student_id || !room_id) {
        return res.status(400).json({ message: 'student_id and room_id are required' });
    }

    // Begin Transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert allocation - capacity trigger and unique constraint will run here
        const result = await client.query(
            'INSERT INTO allocations (student_id, room_id) VALUES ($1, $2) RETURNING *',
            [student_id, room_id]
        );

        // Auto-create initial pending payment for 1 month
        const rentAmount = 500.00; // Default rent tracking
        await client.query(
            "INSERT INTO payments (student_id, amount, status) VALUES ($1, $2, 'Pending')",
            [student_id, rentAmount]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        if (error.code === '23505') {
            // UNIQUE violation
            return res.status(400).json({ message: 'Student is already allocated a room' });
        }
        if (error.code === 'P0001') {
            // Raised by our room capacity trigger
            return res.status(400).json({ message: error.message || 'Room is full' });
        }
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// Reallocate a student to a different room
export const updateAllocation = async (req, res) => {
    const { id } = req.params; // allocation id
    const { student_id, room_id, assigned_date } = req.body;

    if (!student_id || !room_id || !assigned_date) {
        return res.status(400).json({ message: 'student_id, room_id, and assigned_date are required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            'UPDATE allocations SET student_id = $1, room_id = $2, assigned_date = $3 WHERE id = $4 RETURNING *',
            [student_id, room_id, assigned_date, id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Allocation not found' });
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Student is already allocated a room' });
        }
        if (error.code === 'P0001') {
            return res.status(400).json({ message: error.message || 'Room is full' });
        }
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

export const getAllocations = async (req, res) => {
    try {
        const query = `
            SELECT a.*, s.name as student_name, r.room_number
            FROM allocations a
            JOIN students s ON a.student_id = s.id
            JOIN rooms r ON a.room_id = r.id
            ORDER BY a.assigned_date DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM allocations WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Allocation not found' });
        }
        
        res.json({ message: 'Allocation removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
