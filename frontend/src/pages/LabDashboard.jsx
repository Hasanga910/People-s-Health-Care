import DashboardLayout from "../components/DashboardLayout";

const testRequests = [
  { id: "LAB-2026-0098", patient: "Nimesha Silva", patientId: "PHC-0091", tests: ["FBC", "Urine Analysis"], ordered: "Today, 9:15 AM", status: "Pending", urgent: false },
  { id: "LAB-2026-0099", patient: "Ruwan Fernando", patientId: "PHC-0018", tests: ["Lipid Profile", "Serum Creatinine"], ordered: "Today, 9:40 AM", status: "In Progress", urgent: true },
  { id: "LAB-2026-0100", patient: "Dilani Bandara", patientId: "PHC-0054", tests: ["ECG", "Blood Glucose"], ordered: "Today, 10:10 AM", status: "Pending", urgent: false },
  { id: "LAB-2026-0101", patient: "Suresh Jayasinghe", patientId: "PHC-0067", tests: ["Thyroid Function"], ordered: "Today, 10:30 AM", status: "Sample Received", urgent: false },
];

const completedResults = [
  { id: "LAB-2026-0095", patient: "Kamal Perera", tests: ["FBC", "HbA1c"], completedAt: "Today, 8:20 AM", uploaded: true },
  { id: "LAB-2026-0096", patient: "Priya Gamage", tests: ["Lipid Panel"], completedAt: "Yesterday, 4:50 PM", uploaded: true },
  { id: "LAB-2026-0097", patient: "Anura Dissanayake", tests: ["ECG"], completedAt: "Yesterday, 3:30 PM", uploaded: false },
];

const equipment = [
  { name: "Haematology Analyzer", model: "Sysmex KX-21N", status: "Operational", lastService: "Jan 15, 2026" },
  { name: "ECG Machine", model: "Cardimax FX-8222", status: "Operational", lastService: "Dec 10, 2025" },
  { name: "Chemistry Analyzer", model: "Erba Chem 7", status: "Maintenance Due", lastService: "Nov 5, 2025" },
  { name: "Centrifuge", model: "Remi R-8C", status: "Operational", lastService: "Feb 1, 2026" },
];

const statusBadge = {
  "Pending": "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Sample Received": "bg-cyan-100 text-cyan-700",
  "Completed": "bg-emerald-100 text-emerald-700",
  "Operational": "bg-emerald-100 text-emerald-700",
  "Maintenance Due": "bg-red-100 text-red-600",
};

export default function LabDashboard() {
  return (
    <DashboardLayout role="lab" pageTitle="Laboratory Overview">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-violet-800 to-violet-700 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-violet-200 text-sm mb-1">People's Health Care</p>
            <h2 className="text-xl font-black text-white">Diagnostic Laboratory</h2>
            <p className="text-violet-300 text-xs mt-1">
              {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white font-black text-3xl">4</p>
            <p className="text-violet-200 text-xs">active test requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Requests", value: "4", icon: "🧪", color: "violet" },
            { label: "Tests Completed Today", value: "11", icon: "✅", color: "emerald" },
            { label: "Results Awaiting Upload", value: "1", icon: "📤", color: "amber" },
            { label: "Equipment Active", value: "3/4", icon: "⚙", color: "blue" },
          ].map((s) => {
            const colors = {
              violet: "bg-violet-50 border-violet-100 text-violet-700",
              emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
              amber: "bg-amber-50 border-amber-100 text-amber-700",
              blue: "bg-blue-50 border-blue-100 text-blue-700",
            };
            return (
              <div key={s.label} className={`rounded-2xl p-5 border ${colors[s.color]}`}>
                <span className="text-2xl block mb-2">{s.icon}</span>
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Test Requests */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Active Test Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">From doctor's consultations today</p>
              </div>
              <button className="text-xs font-semibold text-violet-700 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {testRequests.map((req) => (
                <div key={req.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{req.patient}</p>
                        {req.urgent && (
                          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Urgent</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{req.patientId} · {req.id}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.tests.map((test) => (
                          <span key={test} className="text-xs bg-violet-100 text-violet-700 font-semibold px-2.5 py-0.5 rounded-full">
                            {test}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Ordered: {req.ordered}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[req.status]}`}>
                        {req.status}
                      </span>
                      {req.status === "Pending" && (
                        <button className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-xl transition-all">
                          Start
                        </button>
                      )}
                      {req.status === "In Progress" && (
                        <button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all">
                          Upload Result
                        </button>
                      )}
                      {req.status === "Sample Received" && (
                        <button className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-all">
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: "📤", label: "Upload Test Result", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
                  { icon: "📋", label: "View All Requests", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                  { icon: "⚙", label: "Equipment Status", color: "bg-slate-50 text-slate-700 hover:bg-slate-100" },
                  { icon: "📊", label: "Lab Activity Report", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${action.color}`}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Status */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Equipment Status</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {equipment.map((equip) => (
                  <div key={equip.name} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{equip.name}</p>
                        <p className="text-xs text-slate-400">{equip.model}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Serviced: {equip.lastService}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[equip.status]}`}>
                        {equip.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Completed Results */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Recently Completed</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest test results</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {completedResults.map((result) => (
              <div key={result.id} className="px-6 py-5">
                <p className="text-xs font-mono text-slate-400">{result.id}</p>
                <p className="text-base font-bold text-slate-800 mt-1">{result.patient}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.tests.map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">{result.completedAt}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${result.uploaded ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {result.uploaded ? "Uploaded" : "Pending Upload"}
                  </span>
                  {!result.uploaded && (
                    <button className="text-xs font-bold text-violet-700 hover:underline">Upload Now</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
