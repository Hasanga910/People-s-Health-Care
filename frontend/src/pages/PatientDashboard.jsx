import DashboardLayout from "../components/DashboardLayout";

const upcomingAppointments = [
  { date: "Feb 18, 2026", time: "9:00 AM", doctor: "Dr. M.T.D. Jayaweera", type: "Follow-up", channel: "#013", status: "Confirmed" },
  { date: "Mar 5, 2026", time: "10:30 AM", doctor: "Dr. M.T.D. Jayaweera", type: "Lab Review", channel: "#021", status: "Scheduled" },
];

const prescriptions = [
  {
    date: "Feb 12, 2026",
    id: "RX-20260212-001",
    medicines: [
      { name: "Metformin", dose: "500mg", freq: "Twice daily", duration: "30 days" },
      { name: "Lisinopril", dose: "10mg", freq: "Once daily", duration: "30 days" },
    ],
    status: "Dispensed",
  },
  {
    date: "Jan 28, 2026",
    id: "RX-20260128-002",
    medicines: [
      { name: "Amoxicillin", dose: "500mg", freq: "Three times daily", duration: "7 days" },
    ],
    status: "Completed",
  },
];

const labResults = [
  { test: "Full Blood Count", date: "Feb 10, 2026", status: "Ready", reportId: "LAB-2026-0089" },
  { test: "Blood Glucose (Fasting)", date: "Feb 10, 2026", status: "Ready", reportId: "LAB-2026-0090" },
  { test: "Lipid Profile", date: "Jan 25, 2026", status: "Ready", reportId: "LAB-2026-0071" },
  { test: "ECG", date: "Jan 25, 2026", status: "Ready", reportId: "LAB-2026-0072" },
];

const statusBadge = {
  "Confirmed": "bg-emerald-100 text-emerald-700",
  "Scheduled": "bg-blue-100 text-blue-700",
  "Dispensed": "bg-cyan-100 text-cyan-700",
  "Completed": "bg-slate-100 text-slate-600",
  "Ready": "bg-emerald-100 text-emerald-700",
  "Pending": "bg-amber-100 text-amber-700",
};

export default function PatientDashboard() {
  return (
    <DashboardLayout role="patient" pageTitle="My Health Portal">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-cyan-100 text-sm mb-1">Good morning 👋</p>
              <h2 className="text-xl font-black text-white">Kamal Perera</h2>
              <p className="text-cyan-200 text-xs mt-1">Patient ID: PHC-IT24100962 · Blood Group: B+</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all text-sm shadow">
                📅 Book Appointment
              </button>
              <button className="px-5 py-2.5 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
                My Profile
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Upcoming Visits", value: "2", icon: "📅", color: "blue" },
            { label: "Active Prescriptions", value: "2", icon: "💊", color: "cyan" },
            { label: "Lab Reports Ready", value: "4", icon: "🧪", color: "violet" },
            { label: "Pending Bills", value: "1", icon: "🧾", color: "emerald" },
          ].map((s) => {
            const colors = {
              blue: "bg-blue-50 border-blue-100 text-blue-700",
              cyan: "bg-cyan-50 border-cyan-100 text-cyan-700",
              violet: "bg-violet-50 border-violet-100 text-violet-700",
              emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
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
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Appointments + Prescriptions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Your scheduled consultations</p>
                </div>
                <button className="text-xs font-semibold text-blue-700 hover:underline">Book New</button>
              </div>
              <div className="divide-y divide-slate-50">
                {upcomingAppointments.map((apt, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-900">{apt.date.split(" ")[0]}</span>
                      <span className="text-lg font-black text-blue-900">{apt.date.split(" ")[1].replace(",", "")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{apt.doctor}</p>
                      <p className="text-xs text-slate-400">{apt.time} · {apt.type} · Channel {apt.channel}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[apt.status]}`}>
                        {apt.status}
                      </span>
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-2.5 bg-blue-900 text-white font-bold rounded-xl text-sm hover:bg-blue-800 transition-all">
                  + Book New Appointment
                </button>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">My Prescriptions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Issued by Dr. M.T.D. Jayaweera</p>
                </div>
                <button className="text-xs font-semibold text-blue-700 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-mono text-slate-400">{rx.id}</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{rx.date}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[rx.status]}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {rx.medicines.map((med) => (
                        <div key={med.name} className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-bold text-slate-700">{med.name} {med.dose}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{med.freq} · {med.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Lab Results + Health Notices */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lab Results */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Lab Reports</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Your diagnostic results</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                  4 Ready
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {labResults.map((lab) => (
                  <div key={lab.reportId} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{lab.test}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{lab.date}</p>
                        <p className="text-xs font-mono text-slate-300 mt-0.5">{lab.reportId}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge[lab.status]}`}>
                          {lab.status}
                        </span>
                        <button className="text-xs text-blue-700 font-semibold hover:underline">View →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Info Card */}
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-3xl p-6 text-white">
              <h4 className="font-bold mb-1">Your Health Summary</h4>
              <p className="text-blue-300 text-xs mb-5">Last updated Feb 12, 2026</p>
              <div className="space-y-3">
                {[
                  { label: "Blood Group", value: "B+" },
                  { label: "Last Visit", value: "Feb 12, 2026" },
                  { label: "Next Visit", value: "Feb 18, 2026" },
                  { label: "Active Conditions", value: "Diabetes (Type 2)" },
                  { label: "Known Allergies", value: "Penicillin" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-blue-300 text-xs">{item.label}</span>
                    <span className="text-white text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">Payment Due</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    You have an outstanding bill of <strong>LKR 3,200</strong> for your visit on Feb 12, 2026.
                  </p>
                  <button className="mt-3 text-xs font-bold text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all">
                    View Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
