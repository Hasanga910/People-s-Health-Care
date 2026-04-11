import { useState, useEffect } from "react";
import PatientLayout from "../../components/PatientLayout";
import api from "../../services/api";


const TODAY = new Date().toISOString().split("T")[0];


const downloadPDF = async (appointmentId, filename) => {
  try {
    const response = await api.get(`/appointments/${appointmentId}/pdf`, {
      responseType: "blob",
     
    });

   
    const url = window.URL.createObjectURL(new Blob([response.data]));

    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

   
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Could not download PDF. Please try again.");
  }
};


const STATUS_CONFIG = {
  Pending:   { bg: "bg-blue-100",  text: "text-blue-700",  border: "border-blue-200",  bar: "#60a5fa" },
  Completed: { bg: "bg-gray-100",  text: "text-gray-600",  border: "border-gray-200",  bar: "#9ca3af" },
  Cancelled: { bg: "bg-red-100",   text: "text-red-600",   border: "border-red-200",   bar: "#f87171" },
};


function isSunday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function BookingModal({ onClose, onBooked, holidays }) {
  const [step, setStep]             = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [sessionInfo, setSessionInfo]   = useState(null);
  
  const [loadingInfo, setLoadingInfo]   = useState(false);
  const [infoError, setInfoError]       = useState("");
  const [booking, setBooking]           = useState(false);
  const [bookingError, setBookingError] = useState("");

 
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();

  // ── Fetch session info when date and session selected ─
  useEffect(() => {
    if (!selectedDate || !selectedSession) {
      setSessionInfo(null);
      return;
    }
    const fetch = async () => {
      setLoadingInfo(true);
      setInfoError("");
      try {
        const res = await api.get("/appointments/session-info", {
          params: { date: selectedDate, session: selectedSession },
        });
        setSessionInfo(res.data.data);
      } catch (err) {
        setInfoError(
          err.response?.data?.message || "Could not load session info"
        );
        setSessionInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetch();
  }, [selectedDate, selectedSession]);

  // ── Date validation ────────────────────────────────────
  const dateError = (() => {
    if (!selectedDate) return "";
    if (selectedDate < TODAY) return "Cannot book past dates.";
    if (isSunday(selectedDate)) return "Medical center is closed on Sundays.";
    if (holidays.includes(selectedDate)) return "This date is a holiday. Doctor unavailable.";
    return "";
  })();

  const dateValid = selectedDate && !dateError;

  // ── Confirm booking ────────────────────────────────────
  const handleBook = async () => {
    setBooking(true);
    setBookingError("");
    try {
      const res = await api.post("/appointments/book", {
        date:    selectedDate,
        session: selectedSession,
      });
      onBooked(res.data.appointment);
      // Pass booked appointment back to parent
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  // ── Step indicator ─────────────────────────────────────
  const STEPS = ["Select Date", "Select Session", "Confirm"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg
                      max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100
                        flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-gray-800 text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Book an Appointment
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              People's Health Care · Mon–Sat only
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => {
              const idx  = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                   text-xs font-bold flex-shrink-0 transition ${
                    done   ? "bg-green-500 text-white" :
                    active ? "text-white" : "bg-gray-100 text-gray-400"
                  }`}
                    style={active
                      ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" }
                      : {}}>
                    {done ? "✓" : idx}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    active ? "text-gray-800" : "text-gray-400"
                  }`}>{label}</span>
                  {i < 2 && <div className="flex-1 h-0.5 bg-gray-100 mx-1" />}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Select Date ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  uppercase tracking-wide mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={TODAY}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSession("");
                    setSessionInfo(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-blue-500 transition"
                />
                {/* Show error if Sunday or holiday */}
                {dateError && (
                  <p className="text-xs text-red-500 mt-2">⚠️ {dateError}</p>
                )}
                {/* Show day name if valid date selected */}
                {dateValid && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ {formatDate(selectedDate)}
                  </p>
                )}
              </div>

              {/* Session time info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  Session Times
                </p>
                <p className="text-xs text-blue-600">
                  🌅 Morning Session — starts at <strong>7:00 AM </strong> to 8:00 AM
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  🌆 Evening Session — starts at <strong>5:00 PM </strong> to 8:00 PM
                </p>
              </div>

              <button
                disabled={!dateValid}
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold
                           disabled:opacity-40 disabled:cursor-not-allowed transition"
                style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                Next — Choose Session
              </button>
            </div>
          )}

          {/* ── STEP 2: Select Session ── */}
          {step === 2 && (
            <div className="space-y-4">

              {/* Selected date reminder */}
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
                📅 {formatDate(selectedDate)}
              </div>

              <label className="block text-xs font-semibold text-gray-500
                                uppercase tracking-wide">
                Choose Session
              </label>

              {/* Morning session card */}
              <button
                onClick={() => setSelectedSession("Morning")}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                  selectedSession === "Morning"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      Morning Session
                    </div>
                    <div className="text-xs text-gray-400">Starts at 7:00 AM</div>
                  </div>
                  {selectedSession === "Morning" && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-blue-500
                                    flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
              </button>

              {/* Evening session card */}
              <button
                onClick={() => setSelectedSession("Evening")}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                  selectedSession === "Evening"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌆</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      Evening Session
                    </div>
                    <div className="text-xs text-gray-400">Starts at 5:00 PM</div>
                  </div>
                  {selectedSession === "Evening" && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-blue-500
                                    flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
              </button>

              {/* Session info box — shows after session selected */}
              {selectedSession && (
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  {loadingInfo && (
                    <p className="text-xs text-gray-400">Loading session info...</p>
                  )}
                  {infoError && (
                    <p className="text-xs text-red-500">⚠️ {infoError}</p>
                  )}
                  {sessionInfo && !loadingInfo && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Active bookings:</span>
                        <span className="font-semibold text-gray-800">
                          {sessionInfo.activeCount} patients
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Your estimated time:</span>
                        <span className="font-semibold text-blue-700">
                          {sessionInfo.estimatedTime}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {infoError && (
                <p className="text-xs text-red-500 text-center">{infoError}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200
                             text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                  Back
                </button>
                <button
                  disabled={!selectedSession || !!infoError || loadingInfo}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold
                             disabled:opacity-40 disabled:cursor-not-allowed transition"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                  Next — Confirm
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Summary card */}
              <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50 space-y-3">
                <p className="text-sm font-semibold text-blue-800">
                  Booking Summary
                </p>
                {[
                  { label: "Patient",   val: user?.name },
                  { label: "Patient ID", val: user?.userId },
                  { label: "Date",      val: formatDate(selectedDate) },
                  { label: "Session",   val: selectedSession },
                  { label: "Est. Time", val: sessionInfo?.estimatedTime },
                  { label: "Queue",
                    val: sessionInfo
                      ? `${sessionInfo.activeCount} patients ahead`
                      : null },
                ].filter(r => r.val).map((row) => (
                  <div key={row.label}
                    className="flex justify-between text-xs border-b
                               border-blue-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-blue-600">{row.label}</span>
                    <span className="font-semibold text-blue-900">{row.val}</span>
                  </div>
                ))}
              </div>

              {bookingError && (
                <p className="text-xs text-red-500 text-center">
                  ⚠️ {bookingError}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-gray-200
                             text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                  Back
                </button>
                <button
                  disabled={booking}
                  onClick={handleBook}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold
                             disabled:opacity-60 transition"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                  {booking ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUCCESS MODAL — shown after successful booking
// ══════════════════════════════════════════════════════════
function BookingSuccessModal({ appointment, onClose }) {
 const handleDownloadPDF = () => {
  downloadPDF(appointment._id, `appointment-${appointment.appointmentId}.pdf`);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center
                        justify-center text-3xl mx-auto mb-4">
          ✓
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Appointment Booked!
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Your appointment has been confirmed successfully.
        </p>

        {/* Appointment details */}
        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6">
          {[
            { label: "Appointment ID",  val: appointment.appointmentId },
            { label: "Channeling No.",  val: appointment.channelingNo },
            { label: "Date",            val: appointment.date },
            { label: "Session",         val: appointment.session },
            { label: "Estimated Time",  val: appointment.estimatedTime },
          ].map((row) => (
            <div key={row.label}
              className="flex justify-between text-xs border-b
                         border-gray-100 pb-2 last:border-0">
              <span className="text-gray-400">{row.label}</span>
              <span className="font-semibold text-gray-800">{row.val}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold
                       flex items-center justify-center gap-2 transition"
            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
            📄 Download PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200
                       text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════
export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [holidays, setHolidays]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");
  const [showBooking, setShowBooking]   = useState(false);
  const [bookedAppt, setBookedAppt]     = useState(null);
  // bookedAppt holds the just-booked appointment to show success modal
  const [cancelId, setCancelId]         = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  // ── Fetch appointments and holidays on load ────────────
  useEffect(() => {
    fetchAppointments();
    fetchHolidays();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await api.get("/appointments/holidays");
      // Extract just the date strings into a simple array
      setHolidays((res.data.holidays || []).map((h) => h.date));
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    }
  };

  // ── Called when booking succeeds ──────────────────────
  const handleBooked = (appointment) => {
    setShowBooking(false);
    setBookedAppt(appointment);
    // Refresh appointment list to show the new booking
    fetchAppointments();
  };

  // ── Cancel appointment ─────────────────────────────────
  const handleCancel = async (id) => {
    setCancelling(true);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      // Refresh list after cancel
      fetchAppointments();
      setCancelId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Filter appointments ────────────────────────────────
  const filtered = filter === "All"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  // ── Stats ──────────────────────────────────────────────
  const upcoming  = appointments.filter((a) => a.status === "Pending").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const total     = appointments.length;

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <PatientLayout activePage="My Appointments">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading appointments...</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout activePage="My Appointments">
      <div className="p-6 space-y-5">

        {/* ── Modals ── */}
        {showBooking && (
          <BookingModal
            onClose={() => setShowBooking(false)}
            onBooked={handleBooked}
            holidays={holidays}
          />
        )}
        {bookedAppt && (
          <BookingSuccessModal
            appointment={bookedAppt}
            onClose={() => setBookedAppt(null)}
          />
        )}

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              My Appointments
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your consultations
            </p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white
                       text-sm font-semibold shadow-lg transition-transform
                       hover:scale-105"
            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd" />
            </svg>
            Book Appointment
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming",    value: upcoming,  color: "#1565C0", bg: "#E3F2FD" },
            { label: "Completed",   value: completed, color: "#00897B", bg: "#E0F2F1" },
            { label: "Total Visits",value: total,     color: "#7B1FA2", bg: "#F3E5F5" },
          ].map((s) => (
            <div key={s.label}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Info banner ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4
                        flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center
                          justify-center text-base flex-shrink-0">ℹ️</div>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Consultation Hours
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Available <strong>Monday to Saturday</strong>.
              Morning session starts <strong>7:00 AM</strong>.
              Evening session starts <strong>5:00 PM</strong>.
            </p>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100
                        shadow-sm flex flex-wrap gap-2">
          {["All", "Pending", "Completed", "Cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? "text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f
                ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" }
                : {}}>
              {f}
            </button>
          ))}
        </div>

        {/* ── Appointment list ── */}
        <div className="space-y-3">
          {filtered.map((appt) => {
            const style = STATUS_CONFIG[appt.status] || STATUS_CONFIG.Pending;
            const dateParts = appt.date
              ? appt.date.split("-")
              : ["", "", ""];
            // dateParts from "2026-03-10" → ["2026","03","10"]

            return (
              <div key={appt._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                           overflow-hidden hover:shadow-md transition">
                <div className="flex items-center gap-4 px-5 py-4">

                  {/* Date block */}
                  <div className="w-14 h-14 rounded-xl flex flex-col items-center
                                  justify-center flex-shrink-0 text-white"
                    style={
                      appt.status === "Completed" || appt.status === "Cancelled"
                        ? { background: "#e5e7eb", color: "#6b7280" }
                        : { background: "linear-gradient(135deg, #1565C0, #00ACC1)" }
                    }>
                    <span className="text-xs font-bold opacity-80">
                      {dateParts[1]}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {dateParts[2]}
                    </span>
                  </div>

                  {/* Status bar */}
                  <div className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ background: style.bar }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-800">
                        {appt.session} Session
                      </span>
                      <span className="font-mono text-xs bg-gray-100 text-gray-500
                                       px-2 py-0.5 rounded-full">
                        {appt.channelingNo}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {appt.date} · Est. {appt.estimatedTime}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      ID: {appt.appointmentId}
                    </div>
                  </div>

                  {/* Status and actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full
                                      border ${style.bg} ${style.text} ${style.border}`}>
                      {appt.status}
                    </span>

                    {/* Cancel button — only for Pending */}
                    {appt.status === "Pending" && (
                      <button
                        onClick={() => setCancelId(appt._id)}
                        className="text-xs text-red-500 hover:text-red-700
                                   font-medium transition">
                        Cancel
                      </button>
                    )}

                    {/* PDF download — always available */}
                    <button
  onClick={() => downloadPDF(
    appt._id,
    `appointment-${appt.appointmentId}.pdf`
  )}
  className="text-xs text-blue-600 hover:text-blue-800
             font-medium transition">
  📄 PDF
</button>
                  </div>
                </div>

                {/* Cancel confirmation inline */}
                {cancelId === appt._id && (
                  <div className="border-t border-red-100 bg-red-50 px-5 py-3
                                  flex items-center justify-between">
                    <p className="text-sm text-red-700 font-medium">
                      Cancel this appointment?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCancelId(null)}
                        className="text-xs px-3 py-1.5 rounded-lg border
                                   border-gray-300 text-gray-600
                                   hover:bg-gray-100 transition">
                        Keep it
                      </button>
                      <button
                        disabled={cancelling}
                        onClick={() => handleCancel(appt._id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500
                                   text-white font-semibold hover:bg-red-600
                                   disabled:opacity-60 transition">
                        {cancelling ? "Cancelling..." : "Yes, Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100
                            p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-gray-500 font-medium">
                No appointments found
              </div>
              <button
                onClick={() => setShowBooking(true)}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold
                           text-white"
                style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                Book Now
              </button>
            </div>
          )}
        </div>

      </div>
    </PatientLayout>
  );
}