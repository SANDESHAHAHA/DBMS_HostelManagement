import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import studentRoutes from './routes/students.js';
import allocationRoutes from './routes/allocations.js';
import paymentRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';
import run from './create_admin.js';
import setupDb from './setup_db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS Configuration - Restrict to frontend origin
const allowedOrigins = [
    "https://dbms-hostel-management-sspl-76zeh50oc-sandeshahahas-projects.vercel.app/",
    "http://localhost:5173",
];

const corsOptions = {
    origin: (origin, callback) => {
        // Check if origin is allowed or if it's a server-to-server request (no origin)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            console.log("Blocked by CORS. Origin:", origin); // Log blocked origins for debugging
            callback(null, false) // Return false instead of error to avoid 500s
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))


app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Ensure admin user is created/updated and DB schema is set up before starting the server
try {
  await run();
  await setupDb();
} catch (err) {
  console.error('Initialization error:', err);
}
// Stricter Rate Limiting for Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
});
app.use('/api/auth/login', loginLimiter);


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get("/health",(req,res)=>{
  res.status(200).json({status:"OK"});
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
