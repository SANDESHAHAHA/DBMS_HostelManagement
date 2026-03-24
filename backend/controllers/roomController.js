import pool from '../db/index.js';

// Add a new room
export const addRoom = async (req, res) => {
    try {
        const { room_number, capacity } = req.body;
        
        // Basic validation
        if (!room_number || !capacity || capacity <= 0) {
            return res.status(400).json({ message: 'Invalid room data' });
        }

        const result = await pool.query(
            'INSERT INTO rooms (room_number, capacity) VALUES ($1, $2) RETURNING *',
            [room_number, capacity]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Room number already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all rooms with optional filtering by capacity or availability
export const getRooms = async (req, res) => {
    try {
        // Raw query to get rooms and their current occupancy
        const query = `
            SELECT r.*, 
                   COUNT(a.id)::int AS current_occupancy 
            FROM rooms r
            LEFT JOIN allocations a ON r.id = a.room_id
            GROUP BY r.id
            ORDER BY r.room_number ASC;
        `;
        
        const result = await pool.query(query);
        let rooms = result.rows;

        // Filtering
        const { capacity, available } = req.query;
        if (capacity) {
            rooms = rooms.filter(r => r.capacity === parseInt(capacity));
        }
        if (available === 'true') {
            rooms = rooms.filter(r => r.current_occupancy < r.capacity);
        }

        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, capacity } = req.body;
        
        if (!room_number || !capacity || capacity <= 0) {
            return res.status(400).json({ message: 'Invalid room data' });
        }

        const result = await pool.query(
            'UPDATE rooms SET room_number = $1, capacity = $2 WHERE id = $3 RETURNING *',
            [room_number, capacity, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') return res.status(400).json({ message: 'Room number already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
