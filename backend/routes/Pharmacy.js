import express from 'express';
import {
  receivePrescription, reviewPrescription, dispensePrescription,
  getAllPharmacyPrescriptions, getPharmacyPrescription,
  getPharmacyPrescriptionByRef, cancelPharmacyPrescription,
  getPharmacyDashboard,
} from '../controllers/pharmacyController.js';
import { protect }   from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const pharmacyRouter = express.Router();

pharmacyRouter.use(protect);
pharmacyRouter.use(authorize('pharmacy', 'admin'));

// ── Static / named routes MUST come before wildcard /:id ────────
pharmacyRouter.get  ('/',           getAllPharmacyPrescriptions);   // GET  /api/pharmacy
pharmacyRouter.get  ('/dashboard',  getPharmacyDashboard);         // GET  /api/pharmacy/dashboard
pharmacyRouter.get  ('/ref/:ref',   getPharmacyPrescriptionByRef); // GET  /api/pharmacy/ref/:ref

// ── Parameterised routes ────────────────────────────────────────
pharmacyRouter.get  ('/:id',                     getPharmacyPrescription);    // GET   /api/pharmacy/:id
pharmacyRouter.post ('/:prescriptionId/receive', receivePrescription);        // POST  /api/pharmacy/:prescriptionId/receive
pharmacyRouter.put  ('/:id/review',              reviewPrescription);         // PUT   /api/pharmacy/:id/review
pharmacyRouter.post ('/:id/dispense',            dispensePrescription);       // POST  /api/pharmacy/:id/dispense
pharmacyRouter.patch('/:id/cancel',              cancelPharmacyPrescription); // PATCH /api/pharmacy/:id/cancel

export default pharmacyRouter;