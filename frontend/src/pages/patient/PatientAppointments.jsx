import { useState } from "react";
import PatientLayout from "../../components/PatientLayout";

const APPOINTMENTS = [
  { id: 1, channeling: "018", date: "18 Feb 2026", day: "Wednesday", time: "09:00 AM", type: "Follow-up Visit", reason: "Diabetes management review", status: "Confirmed" },
  { id: 2, channeling: "021", date: "5 Mar 2026", day: "Thursday", time: "10:30 AM", type: "Lab Results Review", reason: "Review CBC and blood sugar results", status: "Scheduled" },
  { id: 3, channeling: "012", date: "12 Feb 2026", day: "Thursday", time: "09:30 AM", type: "General Consultation", reason: "Chest tightness and fatigue", status: "Completed" },
  { id: 4, channeling: "009", date: "28 Jan 2026", day: "Wednesday", time: "11:00 AM", type: "Follow-up Visit", reason: "Medication adjustment", status: "Completed" },
  { id: 5, channeling: "003", date: "5 Jan 2026", day: "Monday", time: "08:30 AM", type: "General Consultation", reason: "Annual health check", status: "Completed" },
];

const STATUS_CONFIG = {
  Confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "#4ade80" },
  Scheduled: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", bar: "#60a5fa" },
  Completed: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", bar: "#9ca3af" },
  Cancelled: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200", bar: "#f87171" },
};

const TIME_SLOTS = [
  "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM",
  "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM",
  "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

// Simulate booked slots
const BOOKED = ["09:00 AM", "09:30 AM", "11:00 AM"];

function BookingModal({ onClose }) {
  const [step, setStep] = useState(1); // 1=date, 2=details, 3=confirm
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [name] = useState("Kamal Perera");

  const canNext = step === 1 ? selectedDate && selectedTime : step === 2 ? reason.trim().length > 3 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Book an Appointment
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Dr. M.T.D. Jayaweera · People's Health Care</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 mb-6">
            {["Choose Date & Time", "Visit Details", "Confirm"].map((label, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                    done ? "bg-green-500 text-white" : active ? "text-white" : "bg-gray-100 text-gray-400"
                  }`} style={active ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}>
                    {done ? "✓" : idx}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
                  {i < 2 && <div className="flex-1 h-0.5 bg-gray-100 mx-1" />}
                </div>
              );
            })}
          </div>

          {/* Step 1 – Date & Time */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2026-02-16"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Available Time Slots
                  <span className="ml-2 normal-case font-normal text-gray-400">(Mon–Sat only)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const booked = BOOKED.includes(slot);
                    const selected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                          booked
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                            : selected
                            ? "text-white border-transparent shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                        style={selected ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">Strikethrough slots are already booked.</p>
              </div>
            </div>
          )}

          {/* Step 2 – Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
                  <span>📅</span>
                  {selectedDate} · {selectedTime}
                </div>
                <p className="text-blue-600 text-xs">Please complete your visit details below.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Visit Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["General Consultation", "Follow-up Visit", "Lab Results Review", "Prescription Renewal"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition text-sm text-gray-700"
                    >
                      <input type="radio" name="visitType" value={type} className="accent-blue-600" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Reason for Visit <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your symptoms or the purpose of your visit..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3 – Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-3" style={{ background: "#E3F2FD" }}>
                  ✅
                </div>
                <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Review Your Booking
                </h3>
                <p className="text-gray-500 text-sm mt-1">Please confirm your appointment details below.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                {[
                  { label: "Patient", val: name },
                  { label: "Doctor", val: "Dr. M.T.D. Jayaweera" },
                  { label: "Date", val: selectedDate },
                  { label: "Time", val: selectedTime },
                  { label: "Reason", val: reason },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</span>
                    <span className="text-sm text-gray-800 font-semibold text-right max-w-[60%]">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                📋 A channeling number will be assigned upon confirmation. Please arrive 10 minutes early.
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-white px-6 py-5 border-t border-gray-100 flex gap-3 mt-5">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
            >
              Confirm Appointment ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  const [showBooking, setShowBooking] = useState(false);
  const [filter, setFilter] = useState("All");
  const [cancelId, setCancelId] = useState(null);

  const filtered = APPOINTMENTS.filter((a) => filter === "All" || a.status === filter);

  return (
    <PatientLayout activePage="My Appointments">
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              My Appointments
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage your consultations with Dr. Jayaweera</p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Book Appointment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", value: APPOINTMENTS.filter(a => a.status !== "Completed" && a.status !== "Cancelled").length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Completed", value: APPOINTMENTS.filter(a => a.status === "Completed").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Total Visits", value: APPOINTMENTS.length, color: "#7B1FA2", bg: "#F3E5F5" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-base flex-shrink-0">ℹ️</div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Consultation Hours</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Dr. M.T.D. Jayaweera is available <strong>Monday to Saturday, 8:00 AM – 7:00 PM</strong>.
              Emergency consultations are available 24/7. Call <strong>0777 883 343</strong>.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Confirmed", "Scheduled", "Completed", "Cancelled"].map((f) => (
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

        {/* Appointment list */}
        <div className="space-y-3">
          {filtered.map((appt) => {
            const style = STATUS_CONFIG[appt.status];
            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="flex items-center gap-5 px-5 py-4">
                  {/* Date block */}
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                    style={
                      appt.status === "Completed"
                        ? { background: "#e5e7eb", color: "#6b7280" }
                        : { background: "linear-gradient(135deg, #1565C0, #00ACC1)" }
                    }
                  >
                    <span className="text-xs font-bold opacity-80">{appt.date.split(" ")[1]}</span>
                    <span className="text-xl font-bold leading-none">{appt.date.split(" ")[0]}</span>
                  </div>

                  {/* Status bar */}
                  <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-800">{appt.type}</span>
                      <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        #{appt.channeling}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{appt.day} · {appt.time}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">📋 {appt.reason}</div>
                  </div>

                  {/* Status & actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                      {appt.status}
                    </span>
                    {(appt.status === "Confirmed" || appt.status === "Scheduled") && (
                      <button
                        onClick={() => setCancelId(appt.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                    {appt.status === "Completed" && (
                      <a href="/patient/prescriptions" className="text-xs text-blue-600 font-medium hover:underline">
                        View Rx
                      </a>
                    )}
                  </div>
                </div>

                {/* Cancel confirmation inline */}
                {cancelId === appt.id && (
                  <div className="border-t border-red-100 bg-red-50 px-5 py-3 flex items-center justify-between">
                    <p className="text-sm text-red-700 font-medium">Cancel this appointment?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCancelId(null)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                      >
                        Keep it
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition">
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-gray-500 font-medium">No appointments found</div>
              <button
                onClick={() => setShowBooking(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
