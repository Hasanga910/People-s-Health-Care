import PatientLayout from "../../components/PatientLayout";

const UPCOMING = [
  { id: 1, channeling: "018", date: "18 Feb", month: "FEB", day: "Wed", time: "09:00 AM", type: "Follow-up Visit", status: "Confirmed" },
  { id: 2, channeling: "021", date: "5 Mar", month: "MAR", day: "Thu", time: "10:30 AM", type: "Lab Results Review", status: "Scheduled" },
];

const PRESCRIPTIONS = [
  {
    id: "RX-2026-0089",
    date: "12 Feb 2026",
    medicines: [
      { name: "Metformin 500mg", freq: "Twice daily", duration: "30 days" },
      { name: "Lisinopril 10mg", freq: "Once daily", duration: "30 days" },
    ],
    status: "Dispensed",
  },
  {
    id: "RX-2026-0071",
    date: "28 Jan 2026",
    medicines: [{ name: "Amoxicillin 500mg", freq: "Three times daily", duration: "7 days" }],
    status: "Completed",
  },
];

const LAB_RESULTS = [
  { test: "Full Blood Count", date: "10 Feb 2026", id: "LR-2026-041", status: "Ready", flag: false },
  { test: "Fasting Blood Glucose", date: "10 Feb 2026", id: "LR-2026-042", status: "Ready", flag: true },
  { test: "Lipid Profile", date: "25 Jan 2026", id: "LR-2026-031", status: "Ready", flag: false },
  { test: "ECG Report", date: "25 Jan 2026", id: "LR-2026-032", status: "Ready", flag: false },
];

const STATUS_STYLES = {
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  Dispensed: "bg-teal-100 text-teal-700 border-teal-200",
  Completed: "bg-gray-100 text-gray-600 border-gray-200",
  Ready: "bg-green-100 text-green-700 border-green-200",
};

export default function PatientDashboard() {
  return (
    <PatientLayout activePage="My Dashboard">
      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <svg viewBox="0 0 200 200" fill="white">
              <circle cx="150" cy="100" r="90" />
              <circle cx="40" cy="40" r="50" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">Welcome back 👋</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Kamal Perera
            </h2>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { label: "Patient ID", val: "PHC-2026-0012" },
                { label: "Blood Group", val: "B+" },
                { label: "Last Visit", val: "12 Feb 2026" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                  <span className="text-white/50 text-xs">{item.label}:</span>
                  <span className="text-white text-xs font-semibold">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <a
              href="/patient/appointments"
              className="px-5 py-2.5 bg-white text-blue-800 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow"
            >
              📅 Book Appointment
            </a>
            <a
              href="/patient/profile"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition"
            >
              My Profile
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Upcoming Appointments", value: "2", icon: "📅", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Active Prescriptions", value: "2", icon: "💊", color: "#00897B", bg: "#E0F2F1" },
            { label: "Lab Reports Ready", value: "4", icon: "🧪", color: "#7B1FA2", bg: "#F3E5F5" },
            { label: "Pending Bill", value: "1", icon: "🧾", color: "#E65100", bg: "#FFF3E0" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer"
            >
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

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left col – 2/3 width */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
                  <p className="text-xs text-gray-400 mt-0.5">With Dr. M.T.D. Jayaweera</p>
                </div>
                <a href="/patient/appointments" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
              </div>

              <div className="divide-y divide-gray-50">
                {UPCOMING.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                    {/* Date block */}
                    <div
                      className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                      style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
                    >
                      <span className="text-xs font-bold opacity-80">{appt.month}</span>
                      <span className="text-xl font-bold leading-none">{appt.date.split(" ")[0]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">{appt.type}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{appt.day} · {appt.time} · Channeling #{appt.channeling}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[appt.status]}`}>
                        {appt.status}
                      </span>
                      {appt.status !== "Completed" && (
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <a
                  href="/patient/appointments"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Book New Appointment
                </a>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800">My Prescriptions</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Issued by Dr. M.T.D. Jayaweera</p>
                </div>
                <a href="/patient/prescriptions" className="text-sm font-medium text-blue-600 hover:underline">View All</a>
              </div>

              <div className="divide-y divide-gray-100">
                {PRESCRIPTIONS.map((rx) => (
                  <div key={rx.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-mono text-xs text-gray-400">{rx.id}</span>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{rx.date}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[rx.status]}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {rx.medicines.map((med) => (
                        <div key={med.name} className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-700">💊 {med.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{med.freq} · {med.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">

            {/* Health Summary */}
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(180deg, #0D2137 0%, #1565C0 100%)" }}
            >
              <h3 className="font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Health Summary
              </h3>
              <p className="text-white/40 text-xs mb-4">Last updated 12 Feb 2026</p>
              <div className="space-y-3">
                {[
                  { label: "Blood Group", val: "B+" },
                  { label: "Age", val: "54 years" },
                  { label: "Active Conditions", val: "Type 2 Diabetes" },
                  { label: "Known Allergies", val: "Penicillin" },
                  { label: "Next Appointment", val: "18 Feb 2026" },
                  { label: "Doctor", val: "Dr. M.T.D. Jayaweera" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-white/50 text-xs">{item.label}</span>
                    <span className="text-white text-xs font-semibold text-right max-w-[55%] truncate">{item.val}</span>
                  </div>
                ))}
              </div>
              <a
                href="/patient/profile"
                className="block mt-4 text-center py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition border border-white/20"
              >
                View Full Profile
              </a>
            </div>

            {/* Lab Results */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Lab Reports</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Your diagnostic results</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                  4 Ready
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {LAB_RESULTS.map((lab) => (
                  <div key={lab.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lab.flag ? "bg-red-400" : "bg-green-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{lab.test}</div>
                      <div className="text-xs text-gray-400">{lab.date}</div>
                    </div>
                    <a href="/patient/lab-results" className="text-xs text-blue-600 font-semibold hover:underline flex-shrink-0">
                      View →
                    </a>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100">
                <a href="/patient/lab-results" className="text-xs font-semibold text-blue-600 hover:underline">
                  View all reports →
                </a>
              </div>
            </div>

            {/* Bill alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
                  🧾
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Payment Due</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Outstanding bill of <strong>LKR 3,200</strong> for your visit on 12 Feb 2026.
                  </p>
                  <a
                    href="/patient/billing"
                    className="inline-block mt-3 text-xs font-semibold text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                  >
                    View & Pay →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
