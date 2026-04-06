import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

const STAT_CARDS = [
  {
    label: "Today's Appointments",
    value: "12",
    sub: "3 remaining",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    color: "#1565C0",
    bg: "#E3F2FD",
    trend: "+2",
    trendUp: true,
  },
  {
    label: "Prescriptions Issued",
    value: "47",
    sub: "This month",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: "#00897B",
    bg: "#E0F2F1",
    trend: "+8",
    trendUp: true,
  },
  {
    label: "Lab Requests",
    value: "18",
    sub: "6 pending results",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4" />
      </svg>
    ),
    color: "#7B1FA2",
    bg: "#F3E5F5",
    trend: "-2",
    trendUp: false,
  },
  {
    label: "Patients Seen",
    value: "9",
    sub: "Today",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: "#E65100",
    bg: "#FFF3E0",
    trend: "+1",
    trendUp: true,
  },
];

const TODAY_APPOINTMENTS = [
  { time: "08:30 AM", name: "Kamal Perera", reason: "Diabetes Follow-up", status: "Completed", channeling: "#001" },
  { time: "09:00 AM", name: "Sumudu Silva", reason: "General Consultation", status: "Completed", channeling: "#002" },
  { time: "09:30 AM", name: "Nimal Fernando", reason: "Blood Pressure Check", status: "In Progress", channeling: "#003" },
  { time: "10:00 AM", name: "Dilani Wickrama", reason: "Follow-up Visit", status: "Waiting", channeling: "#004" },
  { time: "10:30 AM", name: "Ruwan Bandara", reason: "Prescription Renewal", status: "Waiting", channeling: "#005" },
  { time: "11:00 AM", name: "Amali Jayasena", reason: "Skin Concern", status: "Scheduled", channeling: "#006" },
];

const RECENT_PRESCRIPTIONS = [
  { patient: "Kamal Perera", medication: "Metformin 500mg", date: "Today 08:45 AM", status: "Dispensed" },
  { patient: "Sumudu Silva", medication: "Amoxicillin 250mg", date: "Today 09:15 AM", status: "Dispensed" },
  { patient: "Nimal Fernando", medication: "Amlodipine 5mg", date: "Today 09:40 AM", status: "Pending" },
  { patient: "Dilani Wickrama", medication: "Paracetamol 500mg", date: "Yesterday", status: "Dispensed" },
];

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  Scheduled: "bg-gray-100 text-gray-600",
  Dispensed: "bg-green-100 text-green-700",
  Pending: "bg-orange-100 text-orange-600",
};

export default function DoctorDashboard() {
  const [tab, setTab] = useState("appointments");

  return (
    <DoctorLayout activePage="Dashboard">
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
            <svg viewBox="0 0 200 200" fill="white">
              <circle cx="150" cy="100" r="80" />
              <circle cx="50" cy="50" r="50" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">Good Morning,</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Dr. Jayaweera 👋
            </h2>
            <p className="text-white/60 text-sm mt-1">
              You have <span className="text-cyan-300 font-bold">3 appointments</span> remaining today.
              <span className="ml-2 text-white/60">6 pending lab results.</span>
            </p>
          </div>
          <div className="hidden md:block relative">
            <div className="flex gap-3">
              <a
                href="/doctor/appointments"
                className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/25 transition"
              >
                View Schedule
              </a>
              <a
                href="/doctor/prescriptions"
                className="px-5 py-2.5 bg-white text-blue-800 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
              >
                New Prescription
              </a>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${card.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                >
                  {card.trend}
                </span>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.8rem", color: "#0D2137" }}>
                {card.value}
              </div>
              <div className="text-gray-500 text-sm mt-0.5">{card.label}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule - takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <a href="/doctor/appointments" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
            </div>

            <div className="divide-y divide-gray-50">
              {TODAY_APPOINTMENTS.map((appt, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition cursor-pointer">
                  {/* Time */}
                  <div className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">{appt.time}</div>

                  {/* Channel number */}
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                    {appt.channeling.replace("#", "")}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{appt.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{appt.reason}</div>
                  </div>

                  {/* Status */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[appt.status]}`}>
                    {appt.status}
                  </span>

                  {/* Actions */}
                  {(appt.status === "Waiting" || appt.status === "Scheduled") && (
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex-shrink-0">
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Recent Prescriptions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Recent Prescriptions</h3>
                <a href="/doctor/prescriptions" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
              </div>
              <div className="divide-y divide-gray-50">
                {RECENT_PRESCRIPTIONS.map((rx, i) => (
                  <div key={i} className="px-5 py-3 hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{rx.patient}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[rx.status]}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{rx.medication}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{rx.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Issue Prescription", href: "/doctor/prescriptions/new", color: "#1565C0", icon: "📋" },
                  { label: "Request Lab Test", href: "/doctor/lab-requests/new", color: "#7B1FA2", icon: "🧪" },
                  { label: "View Lab Results", href: "/doctor/lab-requests", color: "#00897B", icon: "📊" },
                  { label: "Patient History", href: "/doctor/patients", color: "#E65100", icon: "👤" },
                ].map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${action.color}15` }}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Lab Alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                Lab Alerts
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">2</span>
              </h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-800">CBC Results Ready</div>
                  <div className="text-xs text-purple-600 mt-0.5">Patient: Nimal Fernando</div>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  <div className="text-xs font-semibold text-yellow-800">ECG Report Pending Review</div>
                  <div className="text-xs text-yellow-600 mt-0.5">Patient: Kamal Perera</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
