import express from 'express';
import { getAllBills, getBill, markBillPaid, sendBillToPatient, notifyLab } from '../controllers/Billcontroller.js';
import { protect }   from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const billRouter = express.Router();

billRouter.use(protect);
billRouter.use(authorize('cashier', 'admin'));

billRouter.get  ('/',                      getAllBills);         // GET   /api/bills
billRouter.get  ('/:id',                   getBill);            // GET   /api/bills/:id
billRouter.patch('/:id/pay',               markBillPaid);       // PATCH /api/bills/:id/pay
billRouter.patch('/:id/send-to-patient',   sendBillToPatient);  // PATCH /api/bills/:id/send-to-patient
billRouter.patch('/:id/notify-lab',        notifyLab);          // PATCH /api/bills/:id/notify-lab

export default billRouter;