import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

const PRESCRIPTIONS = [
  {
    id: "RX-2026-0089",
    patient: "Kamal Perera",
    age: 54,
    date: "15 Feb 2026",
    time: "08:45 AM",
    medications: [{ name: "Metformin 500mg", dosage: "1 tablet twice daily", duration: "30 days" }],
    notes: "Monitor blood sugar weekly. Low-carb diet advised.",
    status: "Dispensed",
    channeling: "#001",
  },
  {
    id: "RX-2026-0088",
    patient: "Sumudu Silva",
    age: 29,
    date: "15 Feb 2026",
    time: "09:15 AM",
    medications: [
      { name: "Amoxicillin 250mg", dosage: "1 capsule three times daily", duration: "7 days" },
      { name: "Paracetamol 500mg", dosage: "1 tablet when needed", duration: "7 days" },
    ],
    notes: "Complete the full antibiotic course.",
    status: "Dispensed",
    channeling: "#002",
  },
  {
    id: "RX-2026-0087",
    patient: "Nimal Fernando",
    age: 61,
    date: "15 Feb 2026",
    time: "09:40 AM",
    medications: [{ name: "Amlodipine 5mg", dosage: "1 tablet once daily (morning)", duration: "60 days" }],
    notes: "Measure BP daily. Reduce salt intake. Return in 2 months.",
    status: "Pending",
    channeling: "#003",
  },
  {
    id: "RX-2026-0086",
    patient: "Dilani Wickrama",
    age: 38,
    date: "14 Feb 2026",
    time: "02:30 PM",
    medications: [
      { name: "Paracetamol 500mg", dosage: "1 tablet every 6 hours", duration: "5 days" },
      { name: "Cetirizine 10mg", dosage: "1 tablet at bedtime", duration: "5 days" },
    ],
    notes: "Rest and adequate hydration recommended.",
    status: "Dispensed",
    channeling: "#012",
  },
  {
    id: "RX-2026-0085",
    patient: "Ruwan Bandara",
    age: 45,
    date: "14 Feb 2026",
    time: "11:00 AM",
    medications: [{ name: "Omeprazole 20mg", dosage: "1 capsule before breakfast", duration: "14 days" }],
    notes: "Avoid spicy foods. Return if symptoms persist.",
    status: "Dispensed",
    channeling: "#009",
  },
];

const STATUS_CONFIG = {
  Dispensed: { class: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  Pending: { class: "bg-orange-100 text-orange-600 border-orange-200", dot: "bg-orange-500" },
  Cancelled: { class: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-500" },
};

// Modal for New/Edit Prescription
function PrescriptionModal({ onClose, existing = null }) {
  const [medications, setMedications] = useState(
    existing?.medications || [{ name: "", dosage: "", duration: "" }]
  );

  const addMedication = () => setMedications([...medications, { name: "", dosage: "", duration: "" }]);
  const removeMedication = (i) => setMedications(medications.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => {
    const updated = [...medications];
    updated[i][field] = val;
    setMedications(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {existing ? "Edit Prescription" : "Issue New Prescription"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">People's Health Care — Dr. M.T.D. Jayaweera</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient info */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Information</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Patient Name</label>
                <input
                  type="text"
                  defaultValue={existing?.patient || ""}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Channeling No.</label>
                <input
                  type="text"
                  defaultValue={existing?.channeling || ""}
                  placeholder="#000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medications</label>
              <button
                onClick={addMedication}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Add Medication
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 relative">
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(i)}
                      className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded-lg transition text-red-400"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-3 pr-6">
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Medicine Name & Strength</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMed(i, "name", e.target.value)}
                        placeholder="e.g. Metformin 500mg"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Dosage Instructions</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMed(i, "dosage", e.target.value)}
                        placeholder="e.g. 1 tablet twice daily"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMed(i, "duration", e.target.value)}
                        placeholder="e.g. 7 days"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Test checkbox */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Associated Lab Tests</label>
            <div className="flex flex-wrap gap-2">
              {["CBC (Full Blood Count)", "Fasting Blood Sugar", "Lipid Profile", "ECG", "Urine Analysis", "Creatinine"].map((test) => (
                <label key={test} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition text-sm">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                  {test}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Clinical Notes</label>
            <textarea
              defaultValue={existing?.notes || ""}
              placeholder="Additional instructions, dietary advice, follow-up schedule..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
            >
              {existing ? "Save Changes" : "Issue Prescription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPrescriptions() {
  const [showModal, setShowModal] = useState(false);
  const [editRx, setEditRx] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = PRESCRIPTIONS.filter((rx) => {
    const matchSearch = rx.patient.toLowerCase().includes(search.toLowerCase()) || rx.id.includes(search);
    const matchStatus = statusFilter === "All" || rx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DoctorLayout activePage="Prescriptions">
      {(showModal || editRx) && (
        <PrescriptionModal
          onClose={() => { setShowModal(false); setEditRx(null); }}
          existing={editRx}
        />
      )}

      <div className="p-6 space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Prescription Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">Issue and manage patient prescriptions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Issue Prescription
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total This Month", value: "47", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Pending Dispensal", value: "3", color: "#E65100", bg: "#FFF3E0" },
            { label: "Dispensed Today", value: "2", color: "#00897B", bg: "#E0F2F1" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search by patient or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Dispensed", "Pending"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <input type="date" className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Prescriptions list */}
        <div className="space-y-3">
          {filtered.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
              >
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[rx.status]?.dot}`} />

                {/* RX ID */}
                <div className="text-xs font-mono text-gray-400 w-32 flex-shrink-0">{rx.id}</div>

                {/* Patient */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                    {rx.patient.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{rx.patient}</div>
                    <div className="text-xs text-gray-400">Age {rx.age} · Ch. {rx.channeling}</div>
                  </div>
                </div>

                {/* Medications count */}
                <div className="hidden md:block text-sm text-gray-500">
                  {rx.medications.length} medication{rx.medications.length > 1 ? "s" : ""}
                </div>

                {/* Date */}
                <div className="hidden md:block text-sm text-gray-400">{rx.date} · {rx.time}</div>

                {/* Status badge */}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_CONFIG[rx.status]?.class}`}>
                  {rx.status}
                </span>

                {/* Expand icon */}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === rx.id ? "rotate-180" : ""}`}
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Expanded details */}
              {expandedId === rx.id && (
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Medications */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Medications</p>
                      <div className="space-y-2">
                        {rx.medications.map((med, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                            <div className="font-semibold text-sm text-gray-800">💊 {med.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{med.dosage}</div>
                            <div className="text-xs text-blue-600 mt-0.5">Duration: {med.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clinical Notes</p>
                      <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm text-gray-700 mb-4">
                        {rx.notes}
                      </div>

                      <div className="flex gap-2">
                        {rx.status === "Pending" && (
                          <button
                            onClick={() => setEditRx(rx)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition"
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            Edit
                          </button>
                        )}
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                          Print
                        </button>
                        {rx.status === "Pending" && (
                          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            Cancel Rx
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-gray-500 font-medium">No prescriptions found</div>
              <div className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
