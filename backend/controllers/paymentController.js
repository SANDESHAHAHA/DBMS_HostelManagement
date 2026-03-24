import pool from '../db/index.js';

export const addPayment = async (req, res) => {
    try {
        const { student_id, amount, status } = req.body;
        
        if (!student_id || !amount) {
            return res.status(400).json({ message: 'student_id and amount are required' });
        }

        const result = await pool.query(
            'INSERT INTO payments (student_id, amount, status) VALUES ($1, $2, $3) RETURNING *',
            [student_id, amount, status || 'Pending']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPayments = async (req, res) => {
    try {
        const query = `
            SELECT p.*, s.name as student_name
            FROM payments p
            JOIN students s ON p.student_id = s.id
            ORDER BY p.date DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) return res.status(400).json({ message: 'Status is required' });

        const result = await pool.query(
            'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Payment not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, status, student_id, date } = req.body;
        
        if (!amount || !status || !student_id || !date) return res.status(400).json({ message: 'Amount, status, student_id, and date are required' });

        const result = await pool.query(
            'UPDATE payments SET amount = $1, status = $2, student_id = $3, date = $4 WHERE id = $5 RETURNING *',
            [amount, status, student_id, date, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Payment not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Payment not found' });
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
