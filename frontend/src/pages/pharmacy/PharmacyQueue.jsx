import { useState } from "react";
import PharmacyLayout from "../../components/PharmacyLayout";

const ALL_RX = [
  {
    rxId: "RX-2026-0092", patient: "Nimesha Silva", age: 29, channeling: "019",
    orderedAt: "09:10 AM", doctor: "Dr. M.T.D. Jayaweera",
    medications: [
      { name: "Amoxicillin 500mg", qty: 21, unit: "capsules", price: 315 },
      { name: "Paracetamol 500mg", qty: 10, unit: "tablets", price: 120 },
    ],
    notes: "Complete full antibiotic course. Take with food.",
    status: "Pending", priority: false,
  },
  {
    rxId: "RX-2026-0091", patient: "Ruwan Fernando", age: 47, channeling: "017",
    orderedAt: "09:35 AM", doctor: "Dr. M.T.D. Jayaweera",
    medications: [
      { name: "Atorvastatin 10mg", qty: 30, unit: "tablets", price: 420 },
      { name: "Amlodipine 5mg", qty: 30, unit: "tablets", price: 360 },
      { name: "Aspirin 75mg", qty: 30, unit: "tablets", price: 180 },
      { name: "Ramipril 5mg", qty: 30, unit: "tablets", price: 390 },
    ],
    notes: "Patient is on multiple antihypertensives. Counsel on interactions.",
    status: "Processing", priority: true,
  },
  {
    rxId: "RX-2026-0090", patient: "Dilani Bandara", age: 38, channeling: "016",
    orderedAt: "10:05 AM", doctor: "Dr. M.T.D. Jayaweera",
    medications: [
      { name: "Metformin 500mg", qty: 60, unit: "tablets", price: 720 },
      { name: "Glipizide 5mg", qty: 30, unit: "tablets", price: 480 },
    ],
    notes: "Take Metformin with meals. Monitor blood glucose weekly.",
    status: "Ready", priority: false,
  },
  {
    rxId: "RX-2026-0089", patient: "Kamal Perera", age: 54, channeling: "012",
    orderedAt: "08:20 AM", doctor: "Dr. M.T.D. Jayaweera",
    medications: [
      { name: "Metformin 500mg", qty: 60, unit: "tablets", price: 720 },
      { name: "Lisinopril 10mg", qty: 30, unit: "tablets", price: 480 },
    ],
    notes: "Long-term diabetes management. Regular 30-day supply.",
    status: "Dispensed", priority: false,
  },
  {
    rxId: "RX-2026-0088", patient: "Suresh Jayasinghe", age: 52, channeling: "015",
    orderedAt: "10:30 AM", doctor: "Dr. M.T.D. Jayaweera",
    medications: [
      { name: "Omeprazole 20mg", qty: 30, unit: "capsules", price: 390 },
    ],
    notes: "Take 30 min before breakfast.",
    status: "Pending", priority: false,
  },
];

const STATUS_CONFIG = {
  Pending:    { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200",  bar: "#fbbf24", icon: "⏳" },
  Processing: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   bar: "#60a5fa", icon: "🔄" },
  Ready:      { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  bar: "#4ade80", icon: "✅" },
  Dispensed:  { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200",   bar: "#d1d5db", icon: "📦" },
};

function DispenseModal({ rx, onClose }) {
  const total = rx.medications.reduce((s, m) => s + m.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
          <div>
            <p className="text-white/60 text-xs">Dispense Prescription</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {rx.rxId}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{rx.patient} · Age {rx.age} · Ch. #{rx.channeling}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient & doctor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Patient</p>
              <p className="font-bold text-gray-800">{rx.patient}</p>
              <p className="text-xs text-gray-500">Age {rx.age} · Ch. #{rx.channeling}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prescribed By</p>
              <p className="font-bold text-gray-800 text-sm">{rx.doctor}</p>
              <p className="text-xs text-gray-500">Ordered: {rx.orderedAt}</p>
            </div>
          </div>

          {/* Medications */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Medications to Dispense</p>
            <div className="space-y-2">
              {rx.medications.map((med) => (
                <div key={med.name} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-500">Qty: {med.qty} {med.unit}</p>
                  </div>
                  <p className="text-sm font-bold text-green-700 flex-shrink-0">LKR {med.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor notes */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Doctor's Instructions</p>
            <p className="text-sm text-blue-800">{rx.notes}</p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Total Amount</span>
            <span className="text-xl font-bold text-green-700" style={{ fontFamily: "'Playfair Display', serif" }}>
              LKR {total.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
              ✅ Confirm & Dispense
            </button>
            <button onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyQueue() {
  const [filter, setFilter] = useState("All");
  const [dispenseRx, setDispenseRx] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = ALL_RX.filter(rx => filter === "All" || rx.status === filter);

  return (
    <PharmacyLayout activePage="Dispensing Queue">
      {dispenseRx && <DispenseModal rx={dispenseRx} onClose={() => setDispenseRx(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dispensing Queue
            </h1>
            <p className="text-sm text-gray-400 mt-1">Process prescriptions from today's consultations</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pending", value: ALL_RX.filter(r => r.status === "Pending").length, color: "#E65100", bg: "#FFF3E0" },
            { label: "Processing", value: ALL_RX.filter(r => r.status === "Processing").length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Ready", value: ALL_RX.filter(r => r.status === "Ready").length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Dispensed Today", value: ALL_RX.filter(r => r.status === "Dispensed").length, color: "#37474F", bg: "#ECEFF1" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Priority alert */}
        {ALL_RX.some(r => r.priority && r.status !== "Dispensed") && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl flex-shrink-0">🚨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Priority Prescription</p>
              <p className="text-xs text-red-700 mt-0.5">
                {ALL_RX.filter(r => r.priority && r.status !== "Dispensed").map(r => r.patient).join(", ")} — process immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Pending", "Processing", "Ready", "Dispensed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg, #2E7D32, #00897B)" } : {}}>
              {f}
            </button>
          ))}
        </div>

        {/* Rx list */}
        <div className="space-y-3">
          {filtered.map(rx => {
            const style = STATUS_CONFIG[rx.status];
            const isExpanded = expandedId === rx.rxId;
            const total = rx.medications.reduce((s, m) => s + m.price, 0);

            return (
              <div key={rx.rxId}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${
                  rx.priority ? "border-red-200" : "border-gray-100"
                }`}>
                {/* Row */}
                <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : rx.rxId)}>
                  <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                    💊
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-800">{rx.patient}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Age {rx.age}</span>
                      <span className="font-mono text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Ch. #{rx.channeling}</span>
                      {rx.priority && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">🚨 Priority</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {rx.medications.map(m => m.name).join(" · ")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{rx.orderedAt} · {rx.rxId} · {rx.medications.length} items</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}>
                      {style.icon} {rx.status}
                    </span>
                    <span className="text-sm font-bold text-gray-700">LKR {total.toLocaleString()}</span>
                  </div>

                  <svg viewBox="0 0 20 20" fill="currentColor"
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Medication list */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medications</p>
                        <div className="space-y-2">
                          {rx.medications.map(med => (
                            <div key={med.name} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">💊 {med.name}</p>
                                <p className="text-xs text-gray-400">Qty: {med.qty} {med.unit}</p>
                              </div>
                              <p className="text-sm font-bold text-green-700">LKR {med.price.toLocaleString()}</p>
                            </div>
                          ))}
                          <div className="flex justify-between px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-sm font-semibold text-gray-700">Total</span>
                            <span className="text-sm font-bold text-green-700">LKR {total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes & doctor */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
                            📝 {rx.notes}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prescribed By</p>
                          <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm text-gray-700">
                            {rx.doctor} · {rx.orderedAt}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {rx.status === "Pending" && (
                        <button onClick={() => setDispenseRx(rx)}
                          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                          🔄 Start Preparing
                        </button>
                      )}
                      {rx.status === "Ready" && (
                        <button onClick={() => setDispenseRx(rx)}
                          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                          ✅ Dispense to Patient
                        </button>
                      )}
                      {rx.status === "Processing" && (
                        <button onClick={() => setDispenseRx(rx)}
                          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                          ✅ Mark Ready
                        </button>
                      )}
                      <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                        </svg>
                        Print Label
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">💊</div>
              <div className="text-gray-500 font-medium">No prescriptions found</div>
            </div>
          )}
        </div>
      </div>
    </PharmacyLayout>
  );
}
