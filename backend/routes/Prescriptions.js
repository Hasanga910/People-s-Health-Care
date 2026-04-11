import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescription,
  updatePrescription,
  markInProgress,
  markDispensed,
  cancelPrescription,
} from '../controllers/Prescriptioncontroller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();
router.use(protect);

router.get('/',    getPrescriptions);
router.get('/:id', getPrescription);

router.post('/',                authorize('doctor'),              createPrescription);
router.put('/:id',              authorize('doctor'),              updatePrescription);
router.delete('/:id/cancel',    authorize('doctor'),              cancelPrescription);  // hard delete
router.put('/:id/in-progress',  authorize('pharmacy', 'cashier'), markInProgress);
router.put('/:id/dispense',     authorize('pharmacy', 'cashier'), markDispensed);

export default router;