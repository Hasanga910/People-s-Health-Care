import { useState } from "react";
import LabLayout from "../../components/LabLayout";

const ALL_REQUESTS = [
  { id: "LR-2026-045", patient: "Nimesha Silva", age: 29, channeling: "019", date: "15 Feb 2026", time: "09:15 AM", tests: ["CBC (Full Blood Count)", "Urine Analysis"], status: "Pending", priority: "Routine", notes: "Routine pre-op workup.", preTestInstructions: "No special preparation needed." },
  { id: "LR-2026-044", patient: "Ruwan Fernando", age: 47, channeling: "017", date: "15 Feb 2026", time: "09:40 AM", tests: ["Lipid Profile", "Serum Creatinine"], status: "In Progress", priority: "Urgent", notes: "Patient on antihypertensives. Check kidney and lipid baseline.", preTestInstructions: "Fasting required for 12 hours before lipid profile." },
  { id: "LR-2026-043", patient: "Dilani Bandara", age: 38, channeling: "016", date: "15 Feb 2026", time: "10:10 AM", tests: ["ECG", "Fasting Blood Glucose"], status: "Sample Received", priority: "Routine", notes: "Suspected diabetes. Patient reports increased thirst and fatigue.", preTestInstructions: "Fasting required for 8 hours for blood glucose." },
  { id: "LR-2026-042", patient: "Suresh Jayasinghe", age: 52, channeling: "015", date: "15 Feb 2026", time: "10:30 AM", tests: ["Thyroid Function (TSH)"], status: "Pending", priority: "Routine", notes: "Patient reports fatigue and weight gain. Rule out hypothyroidism.", preTestInstructions: "No fasting required. Best collected in morning." },
  { id: "LR-2026-041", patient: "Kamal Perera", age: 54, channeling: "012", date: "15 Feb 2026", time: "08:20 AM", tests: ["CBC (Full Blood Count)", "Fasting Blood Glucose"], status: "Completed", priority: "Routine", notes: "Diabetes follow-up.", preTestInstructions: "Fasting for 8 hours." },
  { id: "LR-2026-039", patient: "Anura Dissanayake", age: 61, channeling: "011", date: "14 Feb 2026", time: "03:30 PM", tests: ["ECG"], status: "Completed", priority: "Urgent", notes: "Chest tightness evaluation.", preTestInstructions: "Rest for 10 minutes before ECG." },
];

const STATUS_CONFIG = {
  Pending: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", bar: "#fbbf24", icon: "⏳" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", bar: "#60a5fa", icon: "🔬" },
  "Sample Received": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", bar: "#22d3ee", icon: "💉" },
  Completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "#4ade80", icon: "✅" },
};

function RequestDetailModal({ request, onClose }) {
  const [status, setStatus] = useState(request.status);
  const style = STATUS_CONFIG[status];

  const FLOW = ["Pending", "Sample Received", "In Progress", "Completed"];
  const currentIdx = FLOW.indexOf(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #006064)" }}>
          <div>
            <p className="text-white/60 text-xs">Lab Request</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {request.id}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{request.date} · {request.time} · Ch. #{request.channeling}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
              {request.patient.split(" ").map(n => n[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{request.patient}</div>
              <div className="text-xs text-gray-500">Age {request.age} · Ch. #{request.channeling}</div>
            </div>
            {request.priority === "Urgent" && (
              <span className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full border border-red-200">🚨 Urgent</span>
            )}
          </div>

          {/* Progress tracker */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Test Progress</p>
            <div className="flex items-center gap-2">
              {FLOW.map((s, i) => {
                const done = FLOW.indexOf(status) >= i;
                const active = status === s;
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`flex flex-col items-center flex-1`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        done ? "text-white" : "bg-gray-100 text-gray-400"
                      }`} style={done ? { background: "linear-gradient(135deg, #006064, #00838F)" } : {}}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs mt-1 text-center leading-tight ${active ? "text-teal-700 font-semibold" : "text-gray-400"}`}>
                        {s}
                      </span>
                    </div>
                    {i < FLOW.length - 1 && <div className={`h-0.5 flex-1 mb-4 ${done && FLOW.indexOf(status) > i ? "bg-teal-400" : "bg-gray-100"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tests */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tests Requested</p>
            <div className="flex flex-wrap gap-2">
              {request.tests.map(t => (
                <span key={t} className="text-sm bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1.5 rounded-xl font-medium">
                  🧪 {t}
                </span>
              ))}
            </div>
          </div>

          {/* Pre-test instructions */}
          {request.preTestInstructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Pre-Test Instructions</p>
              <p className="text-sm text-blue-800">{request.preTestInstructions}</p>
            </div>
          )}

          {/* Doctor's notes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700">
              📝 {request.notes}
            </div>
          </div>

          {/* Update status */}
          {status !== "Completed" && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex gap-2">
                {FLOW.filter((_, i) => i > FLOW.indexOf(status)).map(nextStatus => (
                  <button
                    key={nextStatus}
                    onClick={() => setStatus(nextStatus)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload result action */}
          {(status === "In Progress" || status === "Completed") && (
            <a href="/lab/upload"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00897B, #1565C0)" }}>
              📤 Upload Test Results
            </a>
          )}

          <button onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LabTestRequests() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_REQUESTS.filter(r => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <LabLayout activePage="Test Requests">
      {selectedRequest && <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Test Requests
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage and process incoming laboratory test requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pending", value: ALL_REQUESTS.filter(r => r.status === "Pending").length, color: "#E65100", bg: "#FFF3E0" },
            { label: "In Progress", value: ALL_REQUESTS.filter(r => r.status === "In Progress").length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Sample Received", value: ALL_REQUESTS.filter(r => r.status === "Sample Received").length, color: "#00ACC1", bg: "#E0F7FA" },
            { label: "Completed", value: ALL_REQUESTS.filter(r => r.status === "Completed").length, color: "#00897B", bg: "#E0F2F1" },
          ].map(s => (
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
            <input type="text" placeholder="Search patient or ID..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {["All", "Pending", "Sample Received", "In Progress", "Completed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  statusFilter === s ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={statusFilter === s ? { background: "linear-gradient(135deg, #006064, #00838F)" } : {}}>
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPriorityFilter(priorityFilter === "Urgent" ? "All" : "Urgent")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              priorityFilter === "Urgent" ? "bg-red-500 text-white border-red-400" : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
            }`}>
            🚨 Urgent Only
          </button>
        </div>

        {/* Requests list */}
        <div className="space-y-3">
          {filtered.map(req => {
            const style = STATUS_CONFIG[req.status];
            return (
              <div key={req.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => setSelectedRequest(req)}>
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                    {req.patient.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{req.patient}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Age {req.age}</span>
                      <span className="font-mono text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Ch. #{req.channeling}</span>
                      {req.priority === "Urgent" && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">🚨 Urgent</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {req.tests.slice(0,3).map(t => (
                        <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                      {req.tests.length > 3 && <span className="text-xs text-gray-400">+{req.tests.length - 3}</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{req.date} · {req.time} · {req.id}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}>
                      <span>{style.icon}</span> {req.status}
                    </span>
                    <span className="text-xs text-gray-400">View Details →</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">🧪</div>
              <div className="text-gray-500 font-medium">No requests found</div>
            </div>
          )}
        </div>
      </div>
    </LabLayout>
  );
}
