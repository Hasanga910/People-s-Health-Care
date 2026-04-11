import Appointment from '../models/Appointment.js';
import Holiday     from '../models/Holiday.js';
import Config      from '../models/Config.js';
import PDFDocument from 'pdfkit';
import User        from '../models/User.js';


async function getConfig() {
  let config = await Config.findOne();
  if (!config) {
    config = await Config.create({});
  }
  return config;
}


function calculateEstimatedTime(startTime, position) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + position * 3;
  const finalHours   = Math.floor(totalMinutes / 60) % 24;
  const finalMinutes = totalMinutes % 60;
  return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
}


function isSunday(date) {
  const day = new Date(date + 'T00:00:00').getDay();
  return day === 0;
}


export const getSessionInfo = async (req, res) => {
  try {
    const { date, session } = req.query;
    
    if (!date || !session) {
      return res.status(400).json({
        success: false,
        message: 'Date and session are required',
      });
    }

    if (isSunday(date)) {
      return res.status(400).json({
        success: false,
        message: 'Medical center is closed on Sundays',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates',
      });
    }

    const holiday = await Holiday.findOne({ date });
    if (holiday) {
      return res.status(400).json({
        success: false,
        message: `This date is unavailable: ${holiday.reason || 'Doctor unavailable'}`,
      });
    }

    const config = await getConfig();
    const startTime = session === 'Morning'
      ? config.morningSessionStart
      : config.eveningSessionStart;

    const activeCount = await Appointment.countDocuments({
      date,
      session,
      status: 'Pending',
    });
  
    const estimatedTime = calculateEstimatedTime(startTime, activeCount);

    res.status(200).json({
      success: true,
      data: {
        date,
        session,
        startTime,
        activeCount,
        estimatedTime,
      },
    });

  } catch (error) {
    console.error('getSessionInfo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const bookAppointment = async (req, res) => {
  try {
    const { date, session } = req.body;
    const patientId   = req.user.userId;
    const patientName = req.user.name;

    if (!date || !session) {
      return res.status(400).json({
        success: false,
        message: 'Date and session are required',
      });
    }

    if (isSunday(date)) {
      return res.status(400).json({
        success: false,
        message: 'Medical center is closed on Sundays',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates',
      });
    }

    const holiday = await Holiday.findOne({ date });
    if (holiday) {
      return res.status(400).json({
        success: false,
        message: `This date is unavailable: ${holiday.reason || 'Doctor unavailable'}`,
      });
    }

    const duplicate = await Appointment.findOne({
      patientId,
      date,
      session,
      status: 'Pending',
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking for this date and session',
      });
    }

    const config = await getConfig();
    const startTime = session === 'Morning'
      ? config.morningSessionStart
      : config.eveningSessionStart;

    const lastAppointment = await Appointment.findOne({ date, session })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastAppointment?.channelingNo) {
      const lastNum = parseInt(lastAppointment.channelingNo.replace(/[ME]/, ''));
      nextNumber = lastNum + 1;
    }

    const prefix = session === 'Morning' ? 'M' : 'E';
    const channelingNo = `${prefix}${String(nextNumber).padStart(3, '0')}`;

    const activeCount = await Appointment.countDocuments({
      date,
      session,
      status: 'Pending',
    });

    const estimatedTime = calculateEstimatedTime(startTime, activeCount);
    const appointmentId = await Appointment.generateAppointmentId();

    const appointment = await Appointment.create({
      appointmentId,
      patientId,
      patientName,
      date,
      session,
      channelingNo,
      estimatedTime,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });

  } catch (error) {
    console.error('bookAppointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.patientId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments',
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });

  } catch (error) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error('getMyAppointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// ══════════════════════════════════════════════════════════════
// DOCTOR — Get today's appointment list (for dashboard)
// GET /api/appointments/today
// ══════════════════════════════════════════════════════════════
export const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const appointments = await Appointment.find({
      date:   today,
      status: { $ne: 'Cancelled' }, // exclude cancelled from schedule
    }).sort({ channelingNo: 1 });   // sort by channeling number order

    // Summary counts
    const total      = appointments.length;
    const pending    = appointments.filter(a => a.status === 'Pending').length;
    const inProgress = appointments.filter(a => a.status === 'In Progress').length;
    const completed  = appointments.filter(a => a.status === 'Completed').length;
    const remaining  = pending + inProgress;

    res.status(200).json({
      success: true,
      appointments,
      stats: { total, pending, inProgress, completed, remaining },
    });

  } catch (error) {
    console.error('getTodayAppointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// ══════════════════════════════════════════════════════════════
// DOCTOR — Start an appointment (Pending → In Progress)
// PATCH /api/appointments/:id/start
// ══════════════════════════════════════════════════════════════
export const startAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot start — current status is "${appointment.status}"`,
      });
    }

    appointment.status = 'In Progress';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment started',
      appointment,
    });

  } catch (error) {
    console.error('startAppointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// ══════════════════════════════════════════════════════════════
// DOCTOR — Complete an appointment (In Progress → Completed)
// PATCH /api/appointments/:id/complete
// ══════════════════════════════════════════════════════════════
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already completed',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled appointment',
      });
    }

    appointment.status = 'Completed';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment completed',
      appointment,
    });

  } catch (error) {
    console.error('completeAppointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const markHoliday = async (req, res) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    if (isSunday(date)) {
      return res.status(400).json({
        success: false,
        message: 'Sunday is already closed — no need to mark it',
      });
    }

    const existing = await Holiday.findOne({ date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This date is already marked as a holiday',
      });
    }

    const holiday = await Holiday.create({
      date,
      reason: reason || '',
      markedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Holiday marked successfully',
      holiday,
    });

  } catch (error) {
    console.error('markHoliday error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().select('date reason -_id');

    res.status(200).json({
      success: true,
      holidays,
    });

  } catch (error) {
    console.error('getHolidays error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


export const updateSessionConfig = async (req, res) => {
  try {
    const { morningSessionStart, eveningSessionStart, minutesPerPatient } = req.body;

    const config = await getConfig();

    if (morningSessionStart) config.morningSessionStart = morningSessionStart;
    if (eveningSessionStart) config.eveningSessionStart = eveningSessionStart;
    if (minutesPerPatient)   config.minutesPerPatient   = minutesPerPatient;

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Session configuration updated',
      config,
    });

  } catch (error) {
    console.error('updateSessionConfig error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// ── PDF generation ─────────────────────────────────────────────
export const getAppointmentPDF = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.patientId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const patient = await User.findOne({ userId: appointment.patientId });

    let age = 'N/A';
    if (patient?.patientDetails?.birthday) {
      const today = new Date();
      const birth = new Date(patient.patientDetails.birthday);
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      age = `${years} years`;
    }

    const bloodGroup = patient?.patientDetails?.bloodGroup || 'N/A';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="appointment-${appointment.appointmentId}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    doc.rect(0, 0, 595, 80).fill('#0D2137');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text("People's Health Care", 50, 20);
    doc.fontSize(10).font('Helvetica').text('Booking Confirmation', 50, 48);
    doc.fillColor('#1a1a1a');
    doc.moveDown(3);
    doc.roundedRect(50, 100, 495, 50, 8).fill('#E8F5E9');
    doc.fillColor('#2E7D32').fontSize(14).font('Helvetica-Bold')
      .text('✓  Appointment Booked Successfully', 50, 115, { width: 495, align: 'center' });
    doc.fillColor('#1a1a1a');
    doc.fontSize(13).font('Helvetica-Bold').text('Appointment Details', 50, 175);
    doc.moveTo(50, 192).lineTo(545, 192).strokeColor('#E0E0E0').stroke();

    const drawRow = (label, value, y) => {
      doc.fontSize(10).font('Helvetica').fillColor('#757575').text(label, 50, y);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text(value, 220, y);
    };

    let y = 205;
    const gap = 28;
    drawRow('Appointment ID',   appointment.appointmentId,  y); y += gap;
    drawRow('Channeling No.',   appointment.channelingNo,   y); y += gap;
    drawRow('Date',             appointment.date,           y); y += gap;
    drawRow('Session',          appointment.session,        y); y += gap;
    drawRow('Estimated Time',   appointment.estimatedTime,  y); y += gap;
    drawRow('Status',           appointment.status,         y); y += gap;

    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#E0E0E0').stroke();
    y += 20;
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a1a').text('Patient Details', 50, y);
    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#E0E0E0').stroke();
    y += 15;
    drawRow('Patient ID',    appointment.patientId,   y); y += gap;
    drawRow('Full Name',     appointment.patientName, y); y += gap;
    drawRow('Age',           age,                     y); y += gap;
    drawRow('Blood Group',   bloodGroup,              y); y += gap;

    y += 20;
    doc.roundedRect(50, y, 495, 70, 8).fill('#FFF8E1');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#F57F17').text('Important', 65, y + 12);
    doc.fontSize(9).font('Helvetica').fillColor('#5D4037')
      .text(
        'Please arrive 10 minutes before your estimated time. ' +
        'Bring this confirmation and any previous medical records. ' +
        'Contact us if you need to cancel.',
        65, y + 27, { width: 465 }
      );

    doc.fontSize(8).font('Helvetica').fillColor('#9E9E9E')
      .text(
        `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} · People's Health Care Management System`,
        50, 750,
        { align: 'center', width: 495 }
      );

    doc.end();

  } catch (error) {
    console.error('getAppointmentPDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating PDF',
      error: error.message,
    });
  }
};