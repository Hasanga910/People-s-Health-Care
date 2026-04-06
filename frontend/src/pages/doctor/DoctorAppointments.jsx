import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const ALL_APPOINTMENTS = [
  { id: 1, channeling: "001", patient: "Kamal Perera", age: 54, phone: "0712345678", reason: "Diabetes Follow-up", date: "2026-02-15", time: "08:30 AM", status: "Completed", gender: "M" },
  { id: 2, channeling: "002", patient: "Sumudu Silva", age: 29, phone: "0723456789", reason: "General Consultation", date: "2026-02-15", time: "09:00 AM", status: "Completed", gender: "F" },
  { id: 3, channeling: "003", patient: "Nimal Fernando", age: 61, phone: "0734567890", reason: "Blood Pressure Check", date: "2026-02-15", time: "09:30 AM", status: "In Progress", gender: "M" },
  { id: 4, channeling: "004", patient: "Dilani Wickrama", age: 38, phone: "0745678901", reason: "Follow-up Visit", date: "2026-02-15", time: "10:00 AM", status: "Waiting", gender: "F" },
  { id: 5, channeling: "005", patient: "Ruwan Bandara", age: 45, phone: "0756789012", reason: "Prescription Renewal", date: "2026-02-15", time: "10:30 AM", status: "Waiting", gender: "M" },
  { id: 6, channeling: "006", patient: "Amali Jayasena", age: 33, phone: "0767890123", reason: "Skin Concern", date: "2026-02-15", time: "11:00 AM", status: "Scheduled", gender: "F" },
  { id: 7, channeling: "007", patient: "Chamara Ranasinghe", age: 52, phone: "0778901234", reason: "Chest Pain Evaluation", date: "2026-02-16", time: "08:30 AM", status: "Scheduled", gender: "M" },
  { id: 8, channeling: "008", patient: "Nadeeka Jayawardena", age: 41, phone: "0789012345", reason: "Thyroid Check", date: "2026-02-16", time: "09:00 AM", status: "Scheduled", gender: "F" },
  { id: 9, channeling: "009", patient: "Lasith Mendis", age: 27, phone: "0790123456", reason: "Annual Health Check", date: "2026-02-17", time: "10:00 AM", status: "Scheduled", gender: "M" },
];

const STATUS_COLORS = {
  Completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "bg-green-400" },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", bar: "bg-blue-400" },
  Waiting: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-400" },
  Scheduled: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", bar: "bg-gray-400" },
  Cancelled: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200", bar: "bg-red-400" },
};

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2);
}

function AppointmentDetailModal({ appt, onClose }) {
  if (!appt) return null;
  const statusStyle = STATUS_COLORS[appt.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0D2137, #1565C0)" }}>
          <div>
            <p className="text-white/60 text-xs">Appointment Details</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Channeling #{appt.channeling}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white" style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
              {getInitials(appt.patient)}
            </div>
            <div>
              <div className="font-bold text-gray-800">{appt.patient}</div>
              <div className="text-sm text-gray-500">Age {appt.age} · {appt.gender === "M" ? "Male" : "Female"}</div>
              <div className="text-sm text-gray-500">{appt.phone}</div>
            </div>
            <div className="ml-auto">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {appt.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Date", value: appt.date, icon: "📅" },
              { label: "Time", value: appt.time, icon: "🕐" },
              { label: "Reason", value: appt.reason, icon: "📋" },
              { label: "Channeling No.", value: `#${appt.channeling}`, icon: "🔢" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">{item.icon} {item.label}</div>
                <div className="text-sm font-semibold text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {appt.status !== "Completed" && appt.status !== "Cancelled" && (
              <button className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg" style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                Start Consultation
              </button>
            )}
            {(appt.status === "Waiting" || appt.status === "Scheduled") && (
              <button className="px-5 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition">
                Cancel
              </button>
            )}
            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 15)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState("2026-02-15");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or calendar

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDayAppointments = (dateStr) => ALL_APPOINTMENTS.filter((a) => a.date === dateStr);
  const selectedAppts = getDayAppointments(selectedDate);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDateStr = (d) => {
    const dd = String(d).padStart(2, "0");
    const mm = String(month + 1).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const todayAppts = getDayAppointments(selectedDate);
  const completed = todayAppts.filter((a) => a.status === "Completed").length;
  const waiting = todayAppts.filter((a) => a.status === "Waiting" || a.status === "In Progress").length;

  return (
    <DoctorLayout activePage="My Schedule">
      {selectedAppt && <AppointmentDetailModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Appointment Schedule
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage your daily channeling sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === "list" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
                List
              </button>
              <button onClick={() => setViewMode("calendar")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === "calendar" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Today", value: todayAppts.length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Completed", value: completed, color: "#00897B", bg: "#E0F2F1" },
            { label: "Awaiting", value: waiting, color: "#E65100", bg: "#FFF3E0" },
            { label: "Scheduled Ahead", value: ALL_APPOINTMENTS.filter(a => a.date > selectedDate).length, color: "#7B1FA2", bg: "#F3E5F5" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </button>
              <span className="font-semibold text-gray-800 text-sm">{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = formatDateStr(day);
                const dayAppts = getDayAppointments(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === "2026-02-15";

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition ${
                      isSelected
                        ? "text-white shadow-lg"
                        : isToday
                        ? "border-2 border-blue-500 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    style={isSelected ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}
                  >
                    {day}
                    {dayAppts.length > 0 && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Availability</p>
              {[
                { label: "Mon–Sat: 8:00 AM – 7:00 PM", icon: "✅" },
                { label: "Sunday: Closed", icon: "❌" },
                { label: "Emergency: Always available", icon: "🚨" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment list for selected date */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedAppts.length} appointments</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedAppts.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-500">{completed} done</span>
                  </div>
                )}
              </div>
            </div>

            {selectedAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="text-5xl mb-3">📅</div>
                <div className="font-medium text-sm">No appointments scheduled</div>
                <div className="text-xs mt-1">Select a different date to view appointments</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {selectedAppts.map((appt) => {
                  const style = STATUS_COLORS[appt.status];
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedAppt(appt)}
                    >
                      {/* Time */}
                      <div className="text-sm text-gray-500 font-medium w-20 flex-shrink-0">{appt.time}</div>

                      {/* Status bar */}
                      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${style.bar}`} />

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                        {getInitials(appt.patient)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{appt.patient}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Age {appt.age} · Ch. #{appt.channeling} · {appt.reason}</div>
                      </div>

                      {/* Status */}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                        {appt.status}
                      </span>

                      {/* Arrow */}
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 flex-shrink-0">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming appointments teaser */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Upcoming Appointments (Next 7 Days)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Ch. No.", "Patient", "Date", "Time", "Reason", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ALL_APPOINTMENTS.filter((a) => a.date >= "2026-02-15").map((appt) => {
                  const style = STATUS_COLORS[appt.status];
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold">#{appt.channeling}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800">{appt.patient}</div>
                        <div className="text-xs text-gray-400">Age {appt.age}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{appt.date}</td>
                      <td className="px-5 py-3.5 text-gray-600">{appt.time}</td>
                      <td className="px-5 py-3.5 text-gray-600">{appt.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-blue-600 text-xs font-semibold hover:underline">Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
