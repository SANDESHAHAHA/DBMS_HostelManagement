import pool from '../db/index.js';

// Add a new student
export const addStudent = async (req, res) => {
    try {
        const { name, contact } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Student name is required' });
        }

        const result = await pool.query(
            'INSERT INTO students (name, contact) VALUES ($1, $2) RETURNING *',
            [name, contact]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all students, optionally including allocation info
export const getStudents = async (req, res) => {
    try {
        const query = `
            SELECT s.*, 
                   a.id AS allocation_id, 
                   r.room_number 
            FROM students s
            LEFT JOIN allocations a ON s.id = a.student_id
            LEFT JOIN rooms r ON a.room_id = r.id
            ORDER BY s.id DESC;
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact } = req.body;
        if (!name) return res.status(400).json({ message: 'Student name is required' });

        const result = await pool.query(
            'UPDATE students SET name = $1, contact = $2 WHERE id = $3 RETURNING *',
            [name, contact, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
