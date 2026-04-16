import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize }    from '../middleware/roleCheck.js';
import {
  getPreConditions,
  getResultFields,
  createLabTestResult,
  savePreTestConditions,
  startTest,
  uploadResults,
  getLabTestResults,
  getLabTestResult,
  getResultsByAppointment,
  getPatientPendingNotifications,
} from '../controllers/labTestResultController.js';

const router = express.Router();
router.use(protect);

// ── Templates (lab + admin + doctor can read) ──────────────────────────────
router.get('/pre-conditions/:testName',  authorize('lab', 'admin'),           getPreConditions);
router.get('/result-fields/:testName',   authorize('lab', 'admin', 'doctor'), getResultFields);

// ── Patient notification endpoint (FEATURE 2) ──────────────────────────────
// Patient portal polls this to know when their fasting period is done.
router.get('/patient-notifications',     authorize('patient'),                 getPatientPendingNotifications);

// ── Core workflow ──────────────────────────────────────────────────────────
router.post('/',                         authorize('lab'),                     createLabTestResult);
router.put('/:id/pre-conditions',        authorize('lab'),                     savePreTestConditions);
router.put('/:id/start',                 authorize('lab'),                     startTest);
router.put('/:id/upload-results',        authorize('lab'),                     uploadResults);

// ── Read endpoints ─────────────────────────────────────────────────────────
router.get('/',                                                                 getLabTestResults);
router.get('/appointment/:appointmentId',                                       getResultsByAppointment);
router.get('/:id',                                                              getLabTestResult);

export default router;