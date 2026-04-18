import Equipment from '../models/Equipment.js';

// ── Helper ────────────────────────────────────────────────────
const handleError = (res, err, msg = 'Server error', code = 500) =>
  res.status(code).json({ success: false, message: msg, error: err.message });

// ── GET /api/equipment ────────────────────────────────────────
export const getAllEquipment = async (req, res) => {
  try {
    const { status, maintenanceStatus, category, search, model, name } = req.query;
    let query = { isActive: true };

    if (status)            query.status            = status;
    if (maintenanceStatus) query.maintenanceStatus = maintenanceStatus;
    if (category)          query.category          = category;

    const searchTerm = search || name || model;
    if (searchTerm) {
      query.$or = [
        { name:         { $regex: searchTerm, $options: 'i' } },
        { model:        { $regex: searchTerm, $options: 'i' } },
        { equipment_id: { $regex: searchTerm, $options: 'i' } },
        { manufacturer: { $regex: searchTerm, $options: 'i' } },
        { serialNumber: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const equipment = await Equipment.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (err) { handleError(res, err, 'Error fetching equipment'); }
};

// ── GET /api/equipment/stats ──────────────────────────────────
export const getEquipmentStats = async (req, res) => {
  try {
    const base = { isActive: true };
    const [total, available, inUse, underMaintenance, needsAttention, retired, replacementAlerts] =
      await Promise.all([
        Equipment.countDocuments(base),
        Equipment.countDocuments({ ...base, status: 'Available' }),
        Equipment.countDocuments({ ...base, status: 'In Use' }),
        Equipment.countDocuments({ ...base, maintenanceStatus: 'Under Maintenance' }),
        Equipment.countDocuments({ ...base, status: 'Needs Attention' }),
        Equipment.countDocuments({ ...base, maintenanceStatus: 'Retired' }),
        Equipment.countDocuments({
          ...base,
          replacementAlertEnabled: true,
          replacementAlertDismissed: false,
          $expr: { $gte: [{ $size: '$maintenanceHistory' }, '$replacementAlertThreshold'] }
        }),
      ]);

    res.json({
      success: true,
      data: {
        total, available, inUse, underMaintenance, needsAttention, retired, replacementAlerts,
        utilizationRate: total > 0 ? +((inUse / total) * 100).toFixed(1) : 0
      }
    });
  } catch (err) { handleError(res, err, 'Error fetching stats'); }
};

// ── GET /api/equipment/:id ────────────────────────────────────
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('maintenanceHistory.performedBy', 'name');

    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: equipment });
  } catch (err) { handleError(res, err, 'Error fetching equipment'); }
};

// ── POST /api/equipment ───────────────────────────────────────
export const createEquipment = async (req, res) => {
  try {
    if (req.body.purchase_cost !== undefined && req.body.purchase_cost !== '' &&
        (isNaN(Number(req.body.purchase_cost)) || Number(req.body.purchase_cost) < 0)) {
      return res.status(400).json({ success: false, message: 'Purchase cost must be a valid positive number' });
    }

    // Strip notes from body — notes field removed per REQ-1
    const { notes: _notes, ...bodyWithoutNotes } = req.body;

    const equipment = await Equipment.create({
      ...bodyWithoutNotes,
      status: 'Available',
      maintenanceStatus: 'Good',
      issueReportedByLab: false,
      labAvailableNotification: false,
      labRetiredNotification: false,
      pendingMaintenanceRecord: false,
      createdBy: req.user?.id
    });

    res.status(201).json({ success: true, message: 'Equipment created', data: equipment });
  } catch (err) { handleError(res, err, 'Error creating equipment', 400); }
};

// ── PUT /api/equipment/:id ────────────────────────────────────
export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const immutable = ['equipment_id', '_id', 'maintenanceHistory', 'createdBy',
                       'status', 'maintenanceStatus', 'issueReportedByLab',
                       'labAvailableNotification', 'labRetiredNotification', 'pendingMaintenanceRecord'];
    Object.keys(req.body).forEach(key => {
      if (!immutable.includes(key)) equipment[key] = req.body[key];
    });

    equipment.updatedBy = req.user?.id;
    await equipment.save();
    res.json({ success: true, message: 'Equipment updated', data: equipment });
  } catch (err) { handleError(res, err, 'Error updating equipment', 400); }
};

// ── PATCH /api/equipment/:id/status ──────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status, maintenanceStatus } = req.body;
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    // ── Lab updating equipment status ──────────────────────
    if (status !== undefined) {
      // REQ-2/REQ-4: Block if retired or under maintenance
      if (equipment.maintenanceStatus === 'Retired' || equipment.maintenanceStatus === 'Under Maintenance') {
        return res.status(403).json({
          success: false,
          message: `Cannot change status. Equipment is currently "${equipment.maintenanceStatus}".`
        });
      }
      equipment.status = status;
      equipment.statusReportedAt = new Date(); // record timestamp of status change
      if (status === 'Needs Attention') {
        equipment.issueReportedByLab = true;
      } else {
        equipment.issueReportedByLab = false;
      }
    }

    // ── Admin updating maintenance status ──────────────────
    if (maintenanceStatus !== undefined) {
      equipment.maintenanceStatus = maintenanceStatus;

      if (maintenanceStatus === 'Under Maintenance') {
        equipment.pendingMaintenanceRecord = true;
        equipment.status = 'Under Maintenance';

      } else if (maintenanceStatus === 'Good') {
        equipment.pendingMaintenanceRecord = false;
        equipment.issueReportedByLab = false;
        equipment.labAvailableNotification = true;
        equipment.status = 'Available';

      } else if (maintenanceStatus === 'Retired') {
        equipment.pendingMaintenanceRecord = false;
        equipment.issueReportedByLab = false;
        equipment.labAvailableNotification = false;
        equipment.status = 'Retired';
        // REQ-2/REQ-4: notify lab that equipment is now retired
        equipment.labRetiredNotification = true;
      }
    }

    equipment.updatedBy = req.user?.id;
    await equipment.save();
    res.json({ success: true, message: 'Status updated', data: equipment });
  } catch (err) { handleError(res, err, 'Error updating status', 400); }
};

// ── PATCH /api/equipment/:id/dismiss-notification ───────────
export const dismissLabNotification = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const { type } = req.body; // 'available' | 'retired' | undefined (legacy = available)
    if (type === 'retired') {
      equipment.labRetiredNotification = false;
    } else {
      equipment.labAvailableNotification = false;
    }

    equipment.updatedBy = req.user?.id;
    await equipment.save();
    res.json({ success: true, message: 'Notification dismissed', data: equipment });
  } catch (err) { handleError(res, err, 'Error dismissing notification', 400); }
};

// ── POST /api/equipment/:id/maintenance ──────────────────────
export const addMaintenanceRecord = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const record = {
      ...req.body,
      maintenance_date: req.body.maintenance_date || new Date(),
      performedBy: req.user?.id
    };

    equipment.maintenanceHistory.push(record);
    equipment.lastMaintenanceDate = record.maintenance_date;
    if (record.next_due_date) equipment.nextMaintenanceDate = new Date(record.next_due_date);

    equipment.maintenanceStatus = 'Good';
    equipment.pendingMaintenanceRecord = false;
    equipment.issueReportedByLab = false;
    equipment.labAvailableNotification = true;
    equipment.status = 'Available';
    equipment.updatedBy = req.user?.id;
    await equipment.save();

    const alertTriggered = equipment.replacementAlertEnabled &&
      !equipment.replacementAlertDismissed &&
      equipment.maintenanceHistory.length >= equipment.replacementAlertThreshold;

    res.json({
      success: true,
      message: 'Maintenance record added',
      data: equipment,
      replacementAlertTriggered: alertTriggered,
      maintenanceCount: equipment.maintenanceHistory.length,
      threshold: equipment.replacementAlertThreshold
    });
  } catch (err) { handleError(res, err, 'Error adding maintenance record', 400); }
};

// ── PATCH /api/equipment/:id/replacement-alert ───────────────
export const updateReplacementAlert = async (req, res) => {
  try {
    const { threshold, enabled, dismiss } = req.body;
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    if (threshold !== undefined) equipment.replacementAlertThreshold = threshold;
    if (enabled   !== undefined) equipment.replacementAlertEnabled   = enabled;
    if (dismiss   !== undefined) equipment.replacementAlertDismissed = dismiss;
    equipment.updatedBy = req.user?.id;
    await equipment.save();

    res.json({ success: true, message: 'Replacement alert settings updated', data: equipment });
  } catch (err) { handleError(res, err, 'Error updating alert settings', 400); }
};

// ── GET /api/equipment/:id/maintenance-report ─────────────────
export const generateMaintenanceReport = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('maintenanceHistory.performedBy', 'name email');

    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const today = new Date();
    const isOverdue = equipment.nextMaintenanceDate && today > equipment.nextMaintenanceDate;
    const daysSinceLast = equipment.lastMaintenanceDate
      ? Math.floor((today - equipment.lastMaintenanceDate) / 86400000)
      : null;

    const history = equipment.maintenanceHistory.map(r => ({
      maintenance_id:   r.maintenance_id,
      equipment_id:     equipment.equipment_id,
      maintenance_date: r.maintenance_date,
      description:      r.description,
      next_due_date:    r.next_due_date,
      technician:       r.technician,
      type:             r.type,
      cost:             r.cost,
      notes:            r.notes,
    }));

    const replacementAlert = equipment.replacementAlertEnabled &&
      !equipment.replacementAlertDismissed &&
      equipment.maintenanceHistory.length >= equipment.replacementAlertThreshold;

    const report = {
      generatedDate: today,
      equipment: {
        equipment_id:     equipment.equipment_id,
        name:             equipment.name,
        model:            equipment.model,
        manufacturer:     equipment.manufacturer,
        specifications:   equipment.specifications,
        acquisition_date: equipment.acquisition_date,
        purchase_cost:    equipment.purchase_cost,
        serialNumber:     equipment.serialNumber,
        location:         equipment.location,
        category:         equipment.category,
        warrantyExpiry:   equipment.warrantyExpiry,
      },
      currentStatus: {
        status:            equipment.status,
        maintenanceStatus: equipment.maintenanceStatus,
        isMaintenanceOverdue: isOverdue,
        daysSinceLastMaintenance: daysSinceLast,
        lastMaintenanceDate: equipment.lastMaintenanceDate,
        nextMaintenanceDate: equipment.nextMaintenanceDate,
      },
      replacementAlert: {
        triggered:   replacementAlert,
        enabled:     equipment.replacementAlertEnabled,
        threshold:   equipment.replacementAlertThreshold,
        totalRounds: equipment.maintenanceHistory.length,
      },
      maintenanceHistory: history,
      recentHistory: history.slice(-5),
      totalMaintenanceCost: history.reduce((s, r) => s + (r.cost || 0), 0),
    };

    res.json({ success: true, data: report });
  } catch (err) { handleError(res, err, 'Error generating report'); }
};

// ── DELETE /api/equipment/:id (soft delete) ───────────────────
export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    equipment.isActive  = false;
    equipment.updatedBy = req.user?.id;
    await equipment.save();
    res.json({ success: true, message: 'Equipment removed successfully' });
  } catch (err) { handleError(res, err, 'Error removing equipment'); }
};

// ── GET /api/equipment/replacement-alerts ────────────────────
export const getReplacementAlerts = async (req, res) => {
  try {
    const equipment = await Equipment.find({
      isActive: true,
      replacementAlertEnabled: true,
      replacementAlertDismissed: false,
      $expr: { $gte: [{ $size: '$maintenanceHistory' }, '$replacementAlertThreshold'] }
    });
    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (err) { handleError(res, err, 'Error fetching replacement alerts'); }
};
