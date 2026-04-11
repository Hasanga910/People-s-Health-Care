import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import {
  getSessionInfo,
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  getAppointmentPDF,
  markHoliday,
  getHolidays,
  updateSessionConfig,
  // ── New doctor-facing actions ──
  getTodayAppointments,
  startAppointment,
  completeAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();


// ── Public-ish (require login but any role) ─────────────────────
router.get('/session-info', protect, getSessionInfo);
router.get('/holidays',     protect, getHolidays);


// ── Patient ────────────────────────────────────────────────────
router.post('/book',        protect, authorize('patient'), bookAppointment);
router.get('/my',           protect, authorize('patient'), getMyAppointments);
router.patch('/:id/cancel', protect, authorize('patient'), cancelAppointment);
router.get('/:id/pdf',      protect, getAppointmentPDF);


// ── Doctor ────────────────────────────────────────────────────
// GET  /api/appointments/today        → fetch today's schedule
// PATCH /api/appointments/:id/start   → Pending → In Progress + returns appointment for form prefill
// PATCH /api/appointments/:id/complete → In Progress → Completed
router.get('/today',           protect, authorize('doctor'), getTodayAppointments);
router.patch('/:id/start',     protect, authorize('doctor'), startAppointment);
router.patch('/:id/complete',  protect, authorize('doctor'), completeAppointment);


// ── Admin / Doctor config ───────────────────────────────────────
router.post('/holidays',    protect, authorize('doctor'), markHoliday);
router.patch('/config',     protect, authorize('doctor'), updateSessionConfig);


export default router;