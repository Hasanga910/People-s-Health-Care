import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

const LAB_REQUESTS = [
  {
    id: "LR-2026-041",
    patient: "Nimal Fernando",
    age: 61,
    channeling: "003",
    date: "15 Feb 2026",
    tests: ["CBC (Full Blood Count)", "Fasting Blood Sugar", "Creatinine"],
    status: "Results Ready",
    priority: "Routine",
    notes: "Patient has hypertension. Check kidney function.",
    labNotes: "All values within expected range except slightly elevated glucose.",
    results: { "CBC": "Normal", "Fasting Blood Sugar": "148 mg/dL (High)", "Creatinine": "1.1 mg/dL (Normal)" },
  },
  {
    id: "LR-2026-040",
    patient: "Kamal Perera",
    age: 54,
    channeling: "001",
    date: "15 Feb 2026",
    tests: ["ECG", "Lipid Profile"],
    status: "In Progress",
    priority: "Urgent",
    notes: "Patient complains of occasional chest tightness. Evaluate cardiac risk.",
    results: {},
  },
  {
    id: "LR-2026-039",
    patient: "Amali Jayasena",
    age: 33,
    channeling: "006",
    date: "15 Feb 2026",
    tests: ["Thyroid Function (TSH)", "CBC (Full Blood Count)"],
    status: "Pending",
    priority: "Routine",
    notes: "Rule out thyroid disorder. Patient reports fatigue and weight gain.",
    results: {},
  },
  {
    id: "LR-2026-038",
    patient: "Dilani Wickrama",
    age: 38,
    channeling: "004",
    date: "14 Feb 2026",
    tests: ["Urine Analysis"],
    status: "Results Ready",
    priority: "Routine",
    notes: "Suspected UTI. Check for infection markers.",
    labNotes: "Positive for leukocytes and nitrites. Consistent with UTI.",
    results: { "Urine Analysis": "Positive – Leukocytes, Nitrites detected" },
  },
  {
    id: "LR-2026-037",
    patient: "Ruwan Bandara",
    age: 45,
    channeling: "009",
    date: "13 Feb 2026",
    tests: ["Liver Function Test (LFT)", "Lipid Profile"],
    status: "Completed",
    priority: "Routine",
    notes: "Routine check. Patient on long-term medication.",
    labNotes: "All values within normal limits. Continue current management.",
    results: { "LFT": "Normal", "Lipid Profile": "Total Cholesterol: 185 mg/dL (Normal)" },
  },
];

const AVAILABLE_TESTS = [
  "CBC (Full Blood Count)",
  "Fasting Blood Sugar",
  "Random Blood Sugar",
  "HbA1c",
  "Lipid Profile",
  "Liver Function Test (LFT)",
  "Kidney Function Test (KFT)",
  "Creatinine",
  "Thyroid Function (TSH)",
  "Urine Analysis",
  "Urine Culture",
  "ECG",
  "Blood Culture",
  "Serum Electrolytes",
  "Iron Studies",
  "Vitamin B12",
  "Vitamin D",
  "Widal Test",
  "Dengue NS1 Antigen",
];

const STATUS_CONFIG = {
  "Results Ready": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "✅" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: "🔬" },
  Pending: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: "⏳" },
  Completed: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", icon: "🗂️" },
};

const PRIORITY_CONFIG = {
  Urgent: { bg: "bg-red-100", text: "text-red-600" },
  Routine: { bg: "bg-slate-100", text: "text-slate-600" },
};

function NewRequestModal({ onClose }) {
  const [selectedTests, setSelectedTests] = useState([]);
  const toggleTest = (test) =>
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Request Laboratory Tests
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">People's Health Care — Laboratory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Name</label>
              <input type="text" placeholder="Full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Channeling No.</label>
              <input type="text" placeholder="#000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</label>
            <div className="flex gap-3">
              {["Routine", "Urgent"].map((p) => (
                <label key={p} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition text-sm font-medium ${p === "Urgent" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  <input type="radio" name="priority" value={p} className="accent-blue-600" />
                  {p === "Urgent" ? "🚨" : "📋"} {p}
                </label>
              ))}
            </div>
          </div>

          {/* Test selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Tests</label>
              {selectedTests.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {selectedTests.length} selected
                </span>
              )}
            </div>

            {selectedTests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                {selectedTests.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                    {t}
                    <button onClick={() => toggleTest(t)} className="hover:text-blue-200">×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {AVAILABLE_TESTS.map((test) => (
                <label
                  key={test}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition text-sm ${
                    selectedTests.includes(test)
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test)}
                    onChange={() => toggleTest(test)}
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                  {test}
                </label>
              ))}
            </div>
          </div>

          {/* Pre-test instructions */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pre-Test Instructions for Patient</label>
            <textarea
              placeholder="e.g. Fasting required for 8 hours before blood sugar test..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Clinical notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Clinical Notes for Lab</label>
            <textarea
              placeholder="Reason for tests, relevant clinical history..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}
            >
              Submit Lab Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsModal({ request, onClose }) {
  if (!request) return null;
  const statusStyle = STATUS_CONFIG[request.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
          <div>
            <p className="text-white/60 text-xs">Laboratory Report</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{request.id}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {request.patient.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="font-bold text-gray-800">{request.patient}</div>
              <div className="text-sm text-gray-500">Age {request.age} · Ch. #{request.channeling}</div>
              <div className="text-sm text-gray-500">{request.date}</div>
            </div>
            <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {request.status}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Test Results</p>
            {Object.entries(request.results || {}).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(request.results).map(([test, result]) => (
                  <div key={test} className={`flex items-start justify-between p-3 rounded-xl border ${result.includes("High") || result.includes("Positive") ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                    <span className="text-sm font-medium text-gray-700">{test}</span>
                    <span className={`text-sm font-semibold ml-4 text-right ${result.includes("High") || result.includes("Positive") ? "text-red-600" : "text-green-700"}`}>
                      {result}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 text-center">
                ⏳ Results are not yet available
              </div>
            )}
          </div>

          {request.labNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lab Notes</p>
              <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                {request.labNotes}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
              Download Report
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorLabRequests() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = LAB_REQUESTS.filter((r) => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DoctorLayout activePage="Lab Requests">
      {showNewModal && <NewRequestModal onClose={() => setShowNewModal(false)} />}
      {selectedRequest && <ResultsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Laboratory Requests
            </h1>
            <p className="text-sm text-gray-400 mt-1">Request and track patient laboratory tests</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Lab Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Results Ready", value: LAB_REQUESTS.filter(r => r.status === "Results Ready").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "In Progress", value: LAB_REQUESTS.filter(r => r.status === "In Progress").length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Pending", value: LAB_REQUESTS.filter(r => r.status === "Pending").length, color: "#E65100", bg: "#FFF3E0" },
            { label: "Total This Month", value: LAB_REQUESTS.length, color: "#7B1FA2", bg: "#F3E5F5" },
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
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="flex gap-2">
            {["All", "Results Ready", "In Progress", "Pending", "Completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  statusFilter === s ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={statusFilter === s ? { background: "linear-gradient(135deg, #7B1FA2, #1565C0)" } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Lab request cards */}
        <div className="space-y-3">
          {filtered.map((req) => {
            const statusStyle = STATUS_CONFIG[req.status];
            const priorityStyle = PRIORITY_CONFIG[req.priority];
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Left accent */}
                  <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${statusStyle.bg.replace("bg-", "bg-").replace("100", "400")}`}
                    style={{ background: req.status === "Results Ready" ? "#4ade80" : req.status === "In Progress" ? "#60a5fa" : req.status === "Pending" ? "#fbbf24" : "#9ca3af" }}
                  />

                  {/* ID + patient */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-xs text-gray-400">{req.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{req.patient}</div>
                    <div className="text-xs text-gray-400">Age {req.age} · Ch. #{req.channeling} · {req.date}</div>
                  </div>

                  {/* Tests */}
                  <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {req.tests.slice(0, 3).map((test) => (
                        <span key={test} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          {test}
                        </span>
                      ))}
                      {req.tests.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          +{req.tests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      <span>{statusStyle.icon}</span>
                      {req.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {req.status === "Results Ready" || req.status === "Completed" ? (
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}
                      >
                        View Results
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>

                {/* Clinical notes preview */}
                {req.notes && (
                  <div className="px-6 pb-4">
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>{req.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">🧪</div>
              <div className="text-gray-500 font-medium">No lab requests found</div>
              <div className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new request</div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
