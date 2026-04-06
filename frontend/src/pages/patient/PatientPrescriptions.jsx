import { useState } from "react";
import PatientLayout from "../../components/PatientLayout";

const PRESCRIPTIONS = [
  {
    id: "RX-2026-0089",
    date: "12 Feb 2026",
    channeling: "012",
    visitType: "General Consultation",
    medications: [
      { name: "Metformin 500mg", dosage: "1 tablet twice daily (morning & evening)", duration: "30 days", withFood: true },
      { name: "Lisinopril 10mg", dosage: "1 tablet once daily (morning)", duration: "30 days", withFood: false },
    ],
    notes: "Monitor blood sugar levels weekly. Maintain a low-carb diet. Return if dizziness occurs.",
    labTests: ["Fasting Blood Glucose", "Kidney Function Test"],
    status: "Dispensed",
  },
  {
    id: "RX-2026-0071",
    date: "28 Jan 2026",
    channeling: "009",
    visitType: "Follow-up Visit",
    medications: [
      { name: "Amoxicillin 500mg", dosage: "1 capsule three times daily", duration: "7 days", withFood: true },
      { name: "Paracetamol 500mg", dosage: "1 tablet every 6 hours when needed", duration: "5 days", withFood: false },
    ],
    notes: "Complete the full antibiotic course even if symptoms improve. Rest and stay hydrated.",
    labTests: [],
    status: "Completed",
  },
  {
    id: "RX-2026-0058",
    date: "10 Jan 2026",
    channeling: "003",
    visitType: "Annual Health Check",
    medications: [
      { name: "Vitamin D3 1000 IU", dosage: "1 tablet once daily", duration: "60 days", withFood: true },
      { name: "Omeprazole 20mg", dosage: "1 capsule 30 min before breakfast", duration: "14 days", withFood: false },
    ],
    notes: "Recheck after 2 months. Increase sun exposure. Take vitamin D with a meal for best absorption.",
    labTests: ["Vitamin D Level", "CBC"],
    status: "Completed",
  },
];

const STATUS_CONFIG = {
  Dispensed: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  Pending: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  Completed: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
};

function PrescriptionCard({ rx }) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_CONFIG[rx.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Card header */}
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rx icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
        >
          Rx
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400">{rx.id}</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Ch. #{rx.channeling}</span>
          </div>
          <div className="text-sm font-semibold text-gray-800 mt-0.5">{rx.visitType}</div>
          <div className="text-xs text-gray-400">{rx.date} · {rx.medications.length} medication{rx.medications.length > 1 ? "s" : ""}</div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
            {rx.status}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-5">
          {/* Medications */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prescribed Medications</p>
            <div className="space-y-3">
              {rx.medications.map((med, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "#E3F2FD" }}
                  >
                    💊
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">{med.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{med.dosage}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">⏱ {med.duration}</span>
                      {med.withFood && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">🍽 Take with food</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab tests */}
          {rx.labTests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Associated Lab Tests</p>
              <div className="flex flex-wrap gap-2">
                {rx.labTests.map((test) => (
                  <span key={test} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full">
                    🧪 {test}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Doctor notes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed">
              📝 {rx.notes}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientPrescriptions() {
  const [filter, setFilter] = useState("All");

  const filtered = PRESCRIPTIONS.filter((rx) => filter === "All" || rx.status === filter);

  return (
    <PatientLayout activePage="My Prescriptions">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Prescriptions
          </h1>
          <p className="text-sm text-gray-400 mt-1">Prescribed by Dr. M.T.D. Jayaweera · People's Health Care</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Prescriptions", value: PRESCRIPTIONS.length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Dispensed", value: PRESCRIPTIONS.filter(r => r.status === "Dispensed").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Active Medications", value: 2, color: "#7B1FA2", bg: "#F3E5F5" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Important reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="text-xl flex-shrink-0">⚠️</div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Medication Reminder</p>
            <p className="text-xs text-amber-700 mt-1">
              Never stop or change your medication dosage without consulting Dr. Jayaweera.
              Contact the clinic at <strong>0777 883 343</strong> if you experience any side effects.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Dispensed", "Pending", "Completed"].map((f) => (
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

        {/* Prescription cards */}
        <div className="space-y-3">
          {filtered.map((rx) => <PrescriptionCard key={rx.id} rx={rx} />)}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">💊</div>
              <div className="text-gray-500 font-medium">No prescriptions found</div>
              <div className="text-gray-400 text-sm mt-1">Prescriptions will appear here after your consultations.</div>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
