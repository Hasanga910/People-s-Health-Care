import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import appointmentRoutes from './routes/appointments.js';

// Import routes
import authRoutes         from './routes/auth.js';
import userRoutes         from './routes/users.js';
import patientRoutes      from './routes/patients.js';
import prescriptionRoutes from './routes/Prescriptions.js';
import labRequestRoutes   from './routes/labRequests.js';
import feedbackRoutes        from './routes/Feedback.js';
import publicRoutes       from './routes/public.js';

// ── NLP Chatbot route ─────────────────────────────────────────────
import chatbotRoutes     from './routes/chatbot.js';

// ── Pharmacy & billing routes ────────────────────────────────────
import pharmacyRoutes from './routes/Pharmacy.js';
import billRoutes        from './routes/Bills.js';
import patientBillRoutes from './routes/Patientbills.js';
import labBillRoutes     from './routes/Labbills.js';
import turnoverRoutes    from './routes/Turnoverreports.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// CORS - allow frontend to make requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser - parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ══════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'People\'s Health Care API',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-requests',  labRequestRoutes);
app.use('/api/feedback',      feedbackRoutes);
app.use('/api/public',        publicRoutes);
app.use('/api/appointments', appointmentRoutes);

// Pharmacy & billing routes
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/bills',            billRoutes);
app.use('/api/patient-bills',    patientBillRoutes);
app.use('/api/lab-bills',        labBillRoutes);
app.use('/api/turnover-reports', turnoverRoutes);

// NLP Chatbot route (public — no auth required)
app.use('/api/chatbot',          chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ══════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
