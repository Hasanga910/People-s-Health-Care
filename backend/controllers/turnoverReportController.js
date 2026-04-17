import TurnoverReport from '../models/TurnoverReport.js';
import PharmacyBill   from '../models/Pharmacybill.js';

// Sri Lanka Standard Time = UTC+5:30
const SL_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function slTodayStr() {
  const nowSL = new Date(Date.now() + SL_OFFSET_MS);
  return nowSL.toISOString().slice(0, 10);
}

function slDayRange(dateStr) {
  // dateStr is SL local date e.g. "2026-03-31"
  // SL midnight = that date at 00:00 SL = UTC 00:00 - 5:30 = previous day UTC 18:30
  const [y, m, d] = dateStr.split('-').map(Number);
  const slMidnight = new Date(Date.UTC(y, m - 1, d)); // midnight UTC of that date
  const dayStart   = new Date(slMidnight.getTime() - SL_OFFSET_MS); // shift to SL midnight in UTC
  const dayEnd     = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { dayStart, dayEnd };
}

const DOCTOR_CHARGE = 1000;

function computeTotal(billObj) {
  const drugTotal = (billObj.lines    || []).reduce((s, l) => s + l.lineTotal, 0);
  const labTotal  = (billObj.labLines || []).reduce((s, l) => s + l.price,     0);
  return drugTotal + labTotal + (billObj.doctorCharge ?? DOCTOR_CHARGE);
}

// ── POST /api/turnover-reports  (cashier only) ────────────────────
export const submitTurnoverReport = async (req, res) => {
  try {
    const { note = '', reportDate } = req.body;
    const dateStr = reportDate || slTodayStr();
    const { dayStart, dayEnd } = slDayRange(dateStr);

    // Bills paid TODAY (SL time) + ALL unpaid bills
    const rawBills = await PharmacyBill.find({
      $or: [
        { paymentStatus: 'paid',   paidAt: { $gte: dayStart, $lte: dayEnd } },
        { paymentStatus: 'unpaid' },
      ]
    }).sort({ createdAt: 1 });

    const bills = rawBills.map(b => {
      const obj = b.toObject();
      // Paid bills: use stored totalAmount (correct at payment time)
      // Unpaid bills: always recompute (stored totalAmount may be missing doctorCharge)
      obj.totalAmount = obj.paymentStatus === 'paid' && obj.totalAmount > 0
        ? obj.totalAmount
        : computeTotal(obj);
      return obj;
    });

    let totalCollected = 0, totalOutstanding = 0;
    let paidBills = 0, unpaidBills = 0;

    for (const b of bills) {
      if (b.paymentStatus === 'paid') {
        paidBills++;
        totalCollected += b.totalAmount;
      } else if (b.paymentStatus === 'unpaid') {
        unpaidBills++;
        totalOutstanding += b.totalAmount;
      }
    }

    const reportNumber = await TurnoverReport.generateReportNumber();

    const report = await TurnoverReport.create({
      reportNumber,
      reportDate:   dateStr,
      totalBills:   bills.length,
      paidBills,
      unpaidBills,
      totalCollected,
      totalOutstanding,
      billSnapshot: bills.map(b => ({
        billNumber:    b.billNumber,
        patientName:   b.patientName,
        doctorName:    b.doctorName,
        totalAmount:   b.totalAmount,
        paymentStatus: b.paymentStatus,
        paidAt:        b.paidAt,
      })),
      note,
      submittedBy:     req.user._id,
      submittedByName: req.user.name || '',
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('submitTurnoverReport error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── GET /api/turnover-reports  (admin + cashier) ─────────────────
export const getTurnoverReports = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const [reports, totalBillCount, unpaidBillCount, paidBillCount, liveAmounts] = await Promise.all([
      TurnoverReport.find({})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('submittedBy', 'name'),
      PharmacyBill.countDocuments({}),
      PharmacyBill.countDocuments({ paymentStatus: 'unpaid' }),
      PharmacyBill.countDocuments({ paymentStatus: 'paid' }),
      // Aggregate live totals: for paid use stored totalAmount, for unpaid recompute
      PharmacyBill.aggregate([
        {
          $group: {
            _id: '$paymentStatus',
            total: {
              $sum: {
                $cond: [
                  // Paid bills with stored totalAmount → trust it
                  { $and: [
                    { $eq: ['$paymentStatus', 'paid'] },
                    { $gt: ['$totalAmount', 0] }
                  ]},
                  '$totalAmount',
                  // Unpaid/zero → recompute: drugs + labs + doctorCharge
                  { $add: [
                    { $reduce: { input: { $ifNull: ['$lines',    []] }, initialValue: 0, in: { $add: ['$$value', '$$this.lineTotal'] } } },
                    { $reduce: { input: { $ifNull: ['$labLines', []] }, initialValue: 0, in: { $add: ['$$value', '$$this.price']     } } },
                    { $ifNull: ['$doctorCharge', 1000] },
                  ]}
                ]
              }
            }
          }
        }
      ]),
    ]);

    // Build live amount map from aggregation result
    const amountMap = {};
    for (const g of liveAmounts) amountMap[g._id] = g.total;

    const totalCollected   = amountMap['paid']   || 0;
    const totalOutstanding = amountMap['unpaid']  || 0;
    const unreadCount      = reports.filter(r => !r.readByAdmin).length;

    res.status(200).json({
      success: true,
      reports,
      stats: {
        totalBillCount,
        unpaidBillCount,
        paidBillCount,
        totalCollected,
        totalOutstanding,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('getTurnoverReports error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── GET /api/turnover-reports/:id  (admin + cashier) ─────────────
export const getTurnoverReport = async (req, res) => {
  try {
    const report = await TurnoverReport.findById(req.params.id)
      .populate('submittedBy', 'name');
    if (!report)
      return res.status(404).json({ success: false, message: 'Report not found' });

    if (req.user.role === 'admin' && !report.readByAdmin) {
      report.readByAdmin = true;
      report.readAt      = new Date();
      await report.save();
    }

    // Fetch live unpaid bills to replace stale snapshot outstanding values
    const unpaidRaw = await PharmacyBill.find({ paymentStatus: 'unpaid' });
    const liveUnpaidTotal = unpaidRaw.reduce((s, b) => {
      const obj = b.toObject();
      const amt = obj.paymentStatus === 'paid' && obj.totalAmount > 0
        ? obj.totalAmount
        : computeTotal(obj);
      return s + amt;
    }, 0);
    const liveUnpaidCount = unpaidRaw.length;

    // Also update the bill snapshot to reflect current payment status
    const reportObj = report.toObject();
    const billNums  = reportObj.billSnapshot.map(b => b.billNumber);
    const liveBills = await PharmacyBill.find({ billNumber: { $in: billNums } })
      .select('billNumber paymentStatus totalAmount lines labLines doctorCharge');

    const liveBillMap = {};
    for (const b of liveBills) {
      const obj = b.toObject();
      liveBillMap[obj.billNumber] = {
        paymentStatus: obj.paymentStatus,
        totalAmount:   obj.paymentStatus === 'paid' && obj.totalAmount > 0
          ? obj.totalAmount
          : computeTotal(obj),
      };
    }

    // Merge live status into snapshot
    reportObj.billSnapshot = reportObj.billSnapshot.map(snap => ({
      ...snap,
      ...(liveBillMap[snap.billNumber] || {}),
    }));

    // Override outstanding with live values
    reportObj.totalOutstanding = liveUnpaidTotal;
    reportObj.unpaidBills      = liveUnpaidCount;

    res.status(200).json({ success: true, report: reportObj });
  } catch (error) {
    console.error('getTurnoverReport error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── GET /api/turnover-reports/preview  (cashier) ─────────────────
export const previewTodayBilling = async (req, res) => {
  try {
    const dateStr = req.query.date || slTodayStr();
    const { dayStart, dayEnd } = slDayRange(dateStr);

    // Fetch bills PAID today (by paidAt) AND all unpaid bills (any age)
    const [paidTodayRaw, allUnpaidRaw] = await Promise.all([
      PharmacyBill.find({
        paymentStatus: 'paid',
        paidAt: { $gte: dayStart, $lte: dayEnd },
      }).sort({ paidAt: 1 }),
      PharmacyBill.find({ paymentStatus: 'unpaid' }).sort({ createdAt: 1 }),
    ]);

    // Compute amounts
    const paidToday = paidTodayRaw.map(b => {
      const obj = b.toObject();
      obj.totalAmount = obj.totalAmount > 0 ? obj.totalAmount : computeTotal(obj);
      return obj;
    });

    const allUnpaid = allUnpaidRaw.map(b => {
      const obj = b.toObject();
      obj.totalAmount = computeTotal(obj);
      return obj;
    });

    const totalCollected   = paidToday.reduce((s, b) => s + b.totalAmount, 0);
    const totalOutstanding = allUnpaid.reduce((s, b) => s + b.totalAmount, 0);
    const paidBills        = paidToday.length;
    const unpaidBills      = allUnpaid.length;

    // Bills today = paid today + unpaid (all outstanding)
    // For the snapshot we combine both
    const allBillsForReport = [
      ...paidToday,
      ...allUnpaid,
    ];

    res.status(200).json({
      success: true,
      preview: {
        reportDate:       dateStr,
        totalBills:       paidBills + unpaidBills,
        paidBills,
        unpaidBills,
        totalCollected,
        totalOutstanding,
        bills: allBillsForReport.map(b => ({
          billNumber:    b.billNumber,
          patientName:   b.patientName,
          doctorName:    b.doctorName,
          totalAmount:   b.totalAmount,
          paymentStatus: b.paymentStatus,
          paidAt:        b.paidAt,
        })),
      }
    });
  } catch (error) {
    console.error('previewTodayBilling error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};