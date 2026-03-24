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
// If running behind a proxy (Render, Vercel, etc.), enable trust proxy
// so express-rate-limit can use the X-Forwarded-For header correctly.
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS Configuration - restrict to known frontends, allow Vercel subdomains
const allowedOrigins = [
  'http://localhost:5173',
  "https://dbms-hostel-management-j2w3.vercel.app/"  
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin)
    if (!origin) return callback(null, true);

    // normalize origin (remove trailing slash)
    const normalized = origin.replace(/\/+$/, '');

    // allow exact matches in the whitelist
    if (allowedOrigins.indexOf(normalized) !== -1) return callback(null, true);

    // allow any Vercel preview or production domain ending with .vercel.app
    try {
      const parsed = new URL(normalized);
      if (parsed.hostname && parsed.hostname.endsWith('.vercel.app')) return callback(null, true);
    } catch (err) {
      // fall through to block
    }

    console.log('Blocked by CORS. Origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


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
