import LabLayout from "../../components/LabLayout";

const ACTIVE_REQUESTS = [
  { id: "LR-2026-045", patient: "Nimesha Silva", channeling: "019", tests: ["CBC (Full Blood Count)", "Urine Analysis"], ordered: "Today, 09:15 AM", status: "Pending", priority: "Routine" },
  { id: "LR-2026-044", patient: "Ruwan Fernando", channeling: "017", tests: ["Lipid Profile", "Serum Creatinine"], ordered: "Today, 09:40 AM", status: "In Progress", priority: "Urgent" },
  { id: "LR-2026-043", patient: "Dilani Bandara", channeling: "016", tests: ["ECG", "Fasting Blood Glucose"], ordered: "Today, 10:10 AM", status: "Sample Received", priority: "Routine" },
  { id: "LR-2026-042", patient: "Suresh Jayasinghe", channeling: "015", tests: ["Thyroid Function (TSH)"], ordered: "Today, 10:30 AM", status: "Pending", priority: "Routine" },
];

const COMPLETED_TODAY = [
  { id: "LR-2026-041", patient: "Kamal Perera", tests: ["CBC", "Fasting Blood Glucose"], completedAt: "08:20 AM", uploaded: true },
  { id: "LR-2026-040", patient: "Amali Jayasena", tests: ["Lipid Profile"], completedAt: "09:00 AM", uploaded: true },
  { id: "LR-2026-039", patient: "Anura Dissanayake", tests: ["ECG"], completedAt: "09:45 AM", uploaded: false },
];

const EQUIPMENT = [
  { name: "Haematology Analyzer", model: "Sysmex KX-21N", status: "Operational", lastService: "15 Jan 2026" },
  { name: "ECG Machine", model: "Cardimax FX-8222", status: "Operational", lastService: "10 Dec 2025" },
  { name: "Chemistry Analyzer", model: "Erba Chem 7", status: "Maintenance Due", lastService: "05 Nov 2025" },
  { name: "Centrifuge", model: "Remi R-8C", status: "Operational", lastService: "01 Feb 2026" },
];

const STATUS_CONFIG = {
  Pending: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", bar: "#fbbf24" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", bar: "#60a5fa" },
  "Sample Received": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", bar: "#22d3ee" },
  Completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "#4ade80" },
  Operational: { bg: "bg-green-100", text: "text-green-700" },
  "Maintenance Due": { bg: "bg-red-100", text: "text-red-600" },
};

export default function LabDashboard() {
  const pendingCount = ACTIVE_REQUESTS.filter(r => r.status === "Pending").length;
  const urgentCount = ACTIVE_REQUESTS.filter(r => r.priority === "Urgent").length;

  return (
    <LabLayout activePage="Dashboard">
      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #0D47A1 60%, #1565C0 100%)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <svg viewBox="0 0 200 200" fill="white"><circle cx="150" cy="100" r="90" /><circle cx="40" cy="40" r="50" /></svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">Good Morning 👋</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Diagnostic Laboratory
            </h2>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-yellow-300 font-bold">{pendingCount} tests pending</span>
              {urgentCount > 0 && <span className="ml-2 text-red-300 font-bold">· {urgentCount} urgent</span>}
              {" · "}1 result awaiting upload
            </p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <a href="/lab/requests"
              className="px-5 py-2.5 bg-white text-blue-900 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow">
              🧪 View Requests
            </a>
            <a href="/lab/upload"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition">
              📤 Upload Result
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Tests", value: pendingCount, icon: "⏳", color: "#E65100", bg: "#FFF3E0" },
            { label: "Completed Today", value: COMPLETED_TODAY.length, icon: "✅", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Awaiting Upload", value: COMPLETED_TODAY.filter(r => !r.uploaded).length, icon: "📤", color: "#0D47A1", bg: "#E3F2FD" },
            { label: "Equipment Active", value: `${EQUIPMENT.filter(e => e.status === "Operational").length}/${EQUIPMENT.length}`, icon: "⚙️", color: "#1565C0", bg: "#E3F2FD" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.8rem", color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Active requests – 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Active Test Requests</h3>
                <p className="text-xs text-gray-400 mt-0.5">From today's consultations</p>
              </div>
              <a href="/lab/requests" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
            </div>

            <div className="divide-y divide-gray-50">
              {ACTIVE_REQUESTS.map((req) => {
                const style = STATUS_CONFIG[req.status];
                return (
                  <div key={req.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                    <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }} />

                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "#E3F2FD", color: "#0D47A1" }}>
                      {req.channeling}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-800">{req.patient}</span>
                        {req.priority === "Urgent" && (
                          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
                            🚨 Urgent
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {req.tests.map(t => (
                          <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{req.ordered} · {req.id}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {req.status}
                      </span>
                      {req.status === "Pending" && (
                        <button className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                          style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
                          Start
                        </button>
                      )}
                      {req.status === "In Progress" && (
                        <a href="/lab/upload" className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                          style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
                          Upload
                        </a>
                      )}
                      {req.status === "Sample Received" && (
                        <button className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                          style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Upload Test Result", href: "/lab/upload", icon: "📤", color: "#0D47A1", bg: "#E3F2FD" },
                  { label: "View All Requests", href: "/lab/requests", icon: "🧪", color: "#1565C0", bg: "#E3F2FD" },
                  { label: "All Lab Reports", href: "/lab/reports", icon: "📋", color: "#1565C0", bg: "#E3F2FD" },
                  { label: "Equipment Status", href: "/lab/equipment", icon: "⚙️", color: "#E65100", bg: "#FFF3E0" },
                ].map((action) => (
                  <a key={action.label} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: action.bg }}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{action.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-gray-500">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Equipment status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Equipment Status</h3>
                <a href="/lab/equipment" className="text-xs text-blue-600 font-medium hover:underline">Manage</a>
              </div>
              <div className="divide-y divide-gray-50">
                {EQUIPMENT.map((eq) => {
                  const style = STATUS_CONFIG[eq.status];
                  return (
                    <div key={eq.name} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${eq.status === "Operational" ? "bg-green-400" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{eq.name}</div>
                        <div className="text-xs text-gray-400">{eq.model}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${style.bg} ${style.text}`}>
                        {eq.status === "Operational" ? "OK" : "⚠️"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload pending alert */}
            {COMPLETED_TODAY.filter(r => !r.uploaded).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-xl flex-shrink-0">📤</div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Result Pending Upload</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {COMPLETED_TODAY.filter(r => !r.uploaded).length} completed test(s) not yet uploaded.
                    Doctor and patient cannot view results until uploaded.
                  </p>
                  <a href="/lab/upload"
                    className="inline-block mt-3 text-xs font-semibold text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
                    Upload Now →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completed today */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800">Completed Today</h3>
              <p className="text-xs text-gray-400 mt-0.5">{COMPLETED_TODAY.length} tests processed</p>
            </div>
            <a href="/lab/reports" className="text-sm font-medium text-blue-600 hover:underline">All Reports</a>
          </div>
          <div className="divide-y divide-gray-50">
            {COMPLETED_TODAY.map((result) => (
              <div key={result.id} className="flex items-center gap-5 px-6 py-3.5 hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
                  {result.patient.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{result.patient}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.tests.map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400 hidden md:block">{result.completedAt}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    result.uploaded
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}>
                    {result.uploaded ? "✅ Uploaded" : "⏳ Pending"}
                  </span>
                  {!result.uploaded && (
                    <a href="/lab/upload" className="text-xs font-semibold text-blue-600 hover:underline">Upload →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </LabLayout>
  );
}