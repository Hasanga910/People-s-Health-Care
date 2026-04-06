import { useState } from "react";
import PatientLayout from "../../components/PatientLayout";

const BILLS = [
  {
    id: "BILL-2026-0089",
    date: "12 Feb 2026",
    channeling: "012",
    visitType: "General Consultation",
    items: [
      { description: "Doctor Consultation Fee", amount: 1500 },
      { description: "Metformin 500mg × 60 tablets", amount: 720 },
      { description: "Lisinopril 10mg × 30 tablets", amount: 480 },
      { description: "Fasting Blood Glucose Test", amount: 350 },
      { description: "Full Blood Count (CBC)", amount: 550 },
    ],
    subtotal: 3600,
    discount: 400,
    total: 3200,
    status: "Unpaid",
    dueDate: "28 Feb 2026",
  },
  {
    id: "BILL-2026-0071",
    date: "28 Jan 2026",
    channeling: "009",
    visitType: "Follow-up Visit",
    items: [
      { description: "Doctor Consultation Fee", amount: 1500 },
      { description: "Amoxicillin 500mg × 21 capsules", amount: 315 },
      { description: "Paracetamol 500mg × 20 tablets", amount: 185 },
    ],
    subtotal: 2000,
    discount: 0,
    total: 2000,
    status: "Paid",
    paidOn: "29 Jan 2026",
  },
  {
    id: "BILL-2026-0058",
    date: "10 Jan 2026",
    channeling: "003",
    visitType: "Annual Health Check",
    items: [
      { description: "Doctor Consultation Fee", amount: 1500 },
      { description: "Vitamin D3 1000 IU × 60 tablets", amount: 420 },
      { description: "Vitamin D Level Test", amount: 800 },
      { description: "ECG", amount: 600 },
      { description: "Lipid Profile", amount: 700 },
    ],
    subtotal: 4020,
    discount: 520,
    total: 3500,
    status: "Paid",
    paidOn: "10 Jan 2026",
  },
];

const STATUS_CONFIG = {
  Unpaid: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  Paid: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  Partial: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

function BillDetailModal({ bill, onClose }) {
  if (!bill) return null;
  const statusStyle = STATUS_CONFIG[bill.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #1565C0)" }}
        >
          <div>
            <p className="text-white/60 text-xs">Invoice</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {bill.id}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{bill.date} · Ch. #{bill.channeling}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {bill.status}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Clinic & Patient info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">From</p>
              <p className="text-sm font-semibold text-gray-800">People's Health Care</p>
              <p className="text-xs text-gray-500">Dr. M.T.D. Jayaweera</p>
              <p className="text-xs text-gray-500">Matara, Sri Lanka</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Billed To</p>
              <p className="text-sm font-semibold text-gray-800">Kamal Perera</p>
              <p className="text-xs text-gray-500">PHC-2026-0012</p>
              <p className="text-xs text-gray-500">Visit: {bill.visitType}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Itemised Charges</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {bill.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <span className="text-sm text-gray-700">{item.description}</span>
                  <span className="text-sm font-semibold text-gray-800">LKR {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>LKR {bill.subtotal.toLocaleString()}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- LKR {bill.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base text-gray-800">
              <span>Total</span>
              <span style={{ color: "#1565C0" }}>LKR {bill.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Status info */}
          {bill.status === "Paid" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Paid on {bill.paidOn} · Thank you!</span>
            </div>
          )}

          <div className="flex gap-3">
            {bill.status === "Unpaid" && (
              <button
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
              >
                Pay Now — LKR {bill.total.toLocaleString()}
              </button>
            )}
            <button className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientBilling() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [filter, setFilter] = useState("All");

  const unpaid = BILLS.filter(b => b.status === "Unpaid");
  const totalPaid = BILLS.filter(b => b.status === "Paid").reduce((sum, b) => sum + b.total, 0);
  const totalDue = unpaid.reduce((sum, b) => sum + b.total, 0);

  const filtered = BILLS.filter(b => filter === "All" || b.status === filter);

  return (
    <PatientLayout activePage="Billing & Payments">
      {selectedBill && <BillDetailModal bill={selectedBill} onClose={() => setSelectedBill(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Billing & Payments
          </h1>
          <p className="text-sm text-gray-400 mt-1">View and manage your medical bills</p>
        </div>

        {/* Summary cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-base">🧾</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount Due</span>
            </div>
            <div className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Playfair Display', serif" }}>
              LKR {totalDue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">{unpaid.length} unpaid invoice{unpaid.length > 1 ? "s" : ""}</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-base">✅</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Paid</span>
            </div>
            <div className="text-2xl font-bold text-green-700" style={{ fontFamily: "'Playfair Display', serif" }}>
              LKR {totalPaid.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">{BILLS.filter(b => b.status === "Paid").length} settled invoices</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base">📋</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Bills</span>
            </div>
            <div className="text-2xl font-bold text-blue-700" style={{ fontFamily: "'Playfair Display', serif" }}>
              {BILLS.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Across all visits</div>
          </div>
        </div>

        {/* Unpaid alert */}
        {unpaid.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-xl flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Payment Due</p>
              <p className="text-xs text-amber-700 mt-1">
                You have an outstanding balance of <strong>LKR {totalDue.toLocaleString()}</strong>.
                Due by {unpaid[0].dueDate}. Please settle at the clinic or contact us.
              </p>
            </div>
            <button
              onClick={() => setSelectedBill(unpaid[0])}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800 transition"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Unpaid", "Paid"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bills list */}
        <div className="space-y-3">
          {filtered.map((bill) => {
            const statusStyle = STATUS_CONFIG[bill.status];
            return (
              <div key={bill.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${
                bill.status === "Unpaid" ? "border-red-100" : "border-gray-100"
              }`}>
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: bill.status === "Unpaid" ? "#FFEBEE" : "#E0F2F1" }}>
                    {bill.status === "Unpaid" ? "🧾" : "✅"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-xs text-gray-400">{bill.id}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Ch. #{bill.channeling}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{bill.visitType}</div>
                    <div className="text-xs text-gray-400">{bill.date}</div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-bold" style={{ color: bill.status === "Unpaid" ? "#DC2626" : "#00897B" }}>
                      LKR {bill.total.toLocaleString()}
                    </div>
                    {bill.discount > 0 && (
                      <div className="text-xs text-green-600">- LKR {bill.discount.toLocaleString()} off</div>
                    )}
                  </div>

                  {/* Status & Action */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {bill.status}
                    </span>
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="border-t border-gray-50 px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                  {bill.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {item.description}
                    </span>
                  ))}
                  {bill.items.length > 3 && (
                    <span className="text-xs text-gray-400">+{bill.items.length - 3} more items</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-600">
            💳 Payments are currently accepted at the clinic in <strong>cash</strong>.
            Please bring your invoice or quote your bill ID at the pharmacy counter.
          </p>
        </div>
      </div>
    </PatientLayout>
  );
}
