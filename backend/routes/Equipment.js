import express from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateStatus,
  addMaintenanceRecord,
  updateReplacementAlert,
  generateMaintenanceReport,
  deleteEquipment,
  getEquipmentStats,
  getReplacementAlerts,
  dismissLabNotification,
} from '../controllers/Equipmentcontroller.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();
router.use(protect);

// Stats & aggregated
router.get('/stats',              getEquipmentStats);
router.get('/replacement-alerts', getReplacementAlerts);

// CRUD
router.get('/',    getAllEquipment);
router.get('/:id', getEquipmentById);
router.post('/',   createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

// Status — lab can update equipment status, admin updates maintenance status
router.patch('/:id/status', authorize('admin', 'lab'), updateStatus);

// Lab dismisses the "equipment available" notification
router.patch('/:id/dismiss-notification', authorize('lab'), dismissLabNotification);

// Maintenance
router.post('/:id/maintenance',        addMaintenanceRecord);
router.patch('/:id/replacement-alert', updateReplacementAlert);

// Report
router.get('/:id/maintenance-report', generateMaintenanceReport);

export default router;
