-- Drop tables if they exist
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS allocations;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0)
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50)
);

CREATE TABLE allocations (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function for Capacity Constraint
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_occupancy INT;
    room_max_capacity INT;
BEGIN
    -- Get current occupancy for the room being assigned
    SELECT COUNT(*) INTO current_occupancy 
    FROM allocations 
    WHERE room_id = NEW.room_id AND id != COALESCE(NEW.id, 0);

    -- Get the capacity of that room
    SELECT capacity INTO room_max_capacity 
    FROM rooms 
    WHERE id = NEW.room_id;

    IF current_occupancy >= room_max_capacity THEN
        RAISE EXCEPTION 'Room % is at full capacity', NEW.room_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_check_room_capacity ON allocations;
CREATE TRIGGER trg_check_room_capacity
BEFORE INSERT OR UPDATE OF room_id ON allocations
FOR EACH ROW EXECUTE FUNCTION check_room_capacity();

-- Insert a default admin (password is 'admin123' hashed with bcrypt - wait, I will hash it in JS or just store simple password for test, but let's insert a raw default hash)
-- bcrypt hash for 'admin123' is '$2a$10$1MhxR8Y7.A2c81r8T0.iPe.yXl.eA/0bU7L9rC9p4m1Q2X8E4A.' (this is an example, it's better to create admin from script)
-- Leaving empty, we'll run a script to create admin.
