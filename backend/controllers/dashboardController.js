import pool from '../db/index.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const studentResult = await pool.query('SELECT COUNT(*) FROM students');
        const roomResult = await pool.query('SELECT COUNT(*) FROM rooms');
        const sumCapacityResult = await pool.query('SELECT SUM(capacity) FROM rooms');
        const allocationsResult = await pool.query('SELECT COUNT(*) FROM allocations');

        const totalStudents = parseInt(studentResult.rows[0].count);
        const totalRooms = parseInt(roomResult.rows[0].count);
        const totalCapacity = parseInt(sumCapacityResult.rows[0].sum || 0);
        const totalAllocations = parseInt(allocationsResult.rows[0].count);
        
        const occupancyRate = totalCapacity > 0 ? ((totalAllocations / totalCapacity) * 100).toFixed(2) : 0;
        const availableBeds = totalCapacity - totalAllocations;

        res.json({
            totalStudents,
            totalRooms,
            totalAllocations,
            totalCapacity,
            availableBeds,
            occupancyRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
