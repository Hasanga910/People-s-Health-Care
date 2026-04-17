import express from 'express';
import { getAllBills, getBill, markBillPaid } from '../controllers/Billcontroller.js';
import { protect }   from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const billRouter = express.Router();

billRouter.use(protect);
billRouter.use(authorize('cashier', 'admin', 'pharmacy'));

billRouter.get  ('/',          getAllBills);   // GET   /api/bills
billRouter.get  ('/:id',       getBill);       // GET   /api/bills/:id
billRouter.patch('/:id/pay',   markBillPaid);  // PATCH /api/bills/:id/pay

export default billRouter;