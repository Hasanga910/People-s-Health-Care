import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/DoctorLayout";
import api from "../../services/api";

// ── Helpers ────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDoctorName() {
  try { return JSON.parse(localStorage.getItem("user"))?.name || "Doctor"; }
  catch { return "Doctor"; }
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return "Just now";
  if (diff < 120) return "1 min ago";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return formatTime(iso);
}

// ── Determine which session tab to auto-select based on system time ──
// morningStart/eveningStart are "HH:MM" strings e.g. "07:00", "17:00"
// Logic: before midpoint between morning-end and evening-start → Morning tab
//        from that midpoint onwards → Evening tab
function detectActiveSession(morningStart = "07:00", eveningStart = "17:00") {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [eH, eM] = eveningStart.split(":").map(Number);
  const eveningMins = eH * 60 + eM;
  // Default: before evening session starts → show Morning tab; after → Evening
  return nowMins < eveningMins ? "Morning" : "Evening";
}

// ── Check if a session is actively happening RIGHT NOW ─────────
// Used for the green "live" dot on the tab.
// morningStart = "07:00", morningEnd = "08:00"
// eveningStart = "17:00", eveningEnd = "20:00"
function isSessionLive(session, morningStart, morningEnd, eveningStart, eveningEnd) {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const toMins = (hhmm) => {
    const [h, m] = (hhmm || "00:00").split(":").map(Number);
    return h * 60 + m;
  };

  if (session === "Morning") {
    return nowMins >= toMins(morningStart) && nowMins < toMins(morningEnd);
  }
  if (session === "Evening") {
    return nowMins >= toMins(eveningStart) && nowMins < toMins(eveningEnd);
  }
  return false;
}

// Format "HH:MM" → "7:00 AM" / "5:00 PM"
function fmtSessionTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ── Status config ──────────────────────────────────────────────
const APPT_STATUS = {
  Pending:       { pill: "bg-amber-50 text-amber-700 border border-amber-200",  dot: "bg-amber-400" },
  "In Progress": { pill: "bg-blue-50 text-blue-700 border border-blue-200",     dot: "bg-blue-500"  },
  Completed:     { pill: "bg-green-50 text-green-700 border border-green-200",  dot: "bg-green-500" },
  Cancelled:     { pill: "bg-gray-100 text-gray-500 border border-gray-200",    dot: "bg-gray-400"  },
};

const RX_STATUS = {
  pending:     { pill: "bg-orange-50 text-orange-600 border border-orange-200", label: "Pending"     },
  in_progress: { pill: "bg-blue-50 text-blue-700 border border-blue-200",       label: "In Progress" },
  dispensed:   { pill: "bg-green-50 text-green-700 border border-green-200",    label: "Dispensed"   },
};

// ── SVG icons ──────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const PrescriptionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LabIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4"/>
  </svg>
);
const PatientsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const QA_ICONS = {
  prescription: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  lab: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
      <path d="M6 2v6l-4 8a2 2 0 001.8 3h12.4A2 2 0 0018 16l-4-8V2"/>
      <line x1="6" y1="2" x2="18" y2="2"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  patient: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

// ── Skeleton loaders ───────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
    <div className="w-14 h-4 bg-gray-100 rounded"/>
    <div className="w-9 h-9 bg-gray-100 rounded-xl"/>
    <div className="flex-1 space-y-1.5">
      <div className="w-32 h-3.5 bg-gray-100 rounded"/>
      <div className="w-24 h-3 bg-gray-100 rounded"/>
    </div>
    <div className="w-20 h-6 bg-gray-100 rounded-full"/>
    <div className="w-16 h-7 bg-gray-100 rounded-xl"/>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-gray-100 rounded-xl"/>
      <div className="w-10 h-5 bg-gray-100 rounded-full"/>
    </div>
    <div className="w-16 h-8 bg-gray-100 rounded mb-2"/>
    <div className="w-28 h-3.5 bg-gray-100 rounded mb-1"/>
    <div className="w-20 h-3 bg-gray-100 rounded"/>
  </div>
);

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════
export default function DoctorDashboard() {
  const navigate   = useNavigate();
  const doctorName = getDoctorName();

  // ── Session config — start & end times ───────────────────────
  // Defaults match the clinic's fixed schedule:
  //   Morning  7:00 AM – 8:00 AM
  //   Evening  5:00 PM – 8:00 PM
  const [morningStart, setMorningStart] = useState("07:00");
  const [morningEnd,   setMorningEnd]   = useState("08:00");
  const [eveningStart, setEveningStart] = useState("17:00");
  const [eveningEnd,   setEveningEnd]   = useState("20:00");

  // ── Active session tab — null while config is loading ─────
  const [activeSession, setActiveSession] = useState(null);

  // ── Data state ────────────────────────────────────────────
  const [appointments, setAppointments]     = useState([]);
  const [apptStats, setApptStats]           = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, remaining: 0 });
  const [recentRx, setRecentRx]             = useState([]);
  const [labPending, setLabPending]         = useState(0);
  const [monthlyRxCount, setMonthlyRxCount] = useState(0);
  const [loadingAppts, setLoadingAppts]     = useState(true);
  const [loadingRx, setLoadingRx]           = useState(true);
  const [startingId, setStartingId]         = useState(null);
  const [toast, setToast]                   = useState(null);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch session config → derive active session ──────────
  // Calls session-info for both sessions to retrieve the real
  // morningSessionStart / eveningSessionStart from the Config doc.
  const loadSessionConfig = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [mRes, eRes] = await Promise.allSettled([
        api.get(`/appointments/session-info?date=${today}&session=Morning`),
        api.get(`/appointments/session-info?date=${today}&session=Evening`),
      ]);

      const mStart = mRes.status === "fulfilled"
        ? mRes.value.data?.data?.startTime || "07:00"
        : "07:00";
      const eStart = eRes.status === "fulfilled"
        ? eRes.value.data?.data?.startTime || "17:00"
        : "17:00";

      setMorningStart(mStart);
      setEveningStart(eStart);
      setActiveSession(detectActiveSession(mStart, eStart));
    } catch {
      setActiveSession(detectActiveSession("07:00", "17:00"));
    }
  }, []);

  // ── Fetch today's appointments ────────────────────────────
  const loadAppointments = useCallback(async () => {
    try {
      const res = await api.get("/appointments/today");
      setAppointments(res.data.appointments || []);
      setApptStats(res.data.stats || {});
    } catch {
      showToast("Failed to load today's schedule", "error");
    } finally {
      setLoadingAppts(false);
    }
  }, []);

  // ── Fetch recent prescriptions (last 30 min) ──────────────
  const loadRecentRx = useCallback(async () => {
    try {
      const res = await api.get("/prescriptions?recent=true&limit=8");
      setRecentRx(res.data.prescriptions || []);
    } catch { /* silently ignore */ }
    finally { setLoadingRx(false); }
  }, []);

  // ── Fetch lab pending count ───────────────────────────────
  const loadLabStats = useCallback(async () => {
    try {
      const res = await api.get("/lab-requests?status=pending&limit=1");
      setLabPending(res.data.count || 0);
    } catch { /* keep 0 */ }
  }, []);

  // ── Fetch this-month prescription count ───────────────────
  const loadMonthlyRx = useCallback(async () => {
    try {
      const res = await api.get("/prescriptions?limit=200");
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const count = (res.data.prescriptions || []).filter(
        rx => new Date(rx.createdAt) >= monthStart
      ).length;
      setMonthlyRxCount(count);
    } catch { /* keep 0 */ }
  }, []);

  // ── Initial load ─────────────────────────────────────────
  useEffect(() => {
    loadSessionConfig();
    loadAppointments();
    loadRecentRx();
    loadLabStats();
    loadMonthlyRx();
  }, [loadSessionConfig, loadAppointments, loadRecentRx, loadLabStats, loadMonthlyRx]);

  // ── Auto-refresh every 30 seconds ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadAppointments();
      loadRecentRx();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadAppointments, loadRecentRx]);

  // ── Filtered list by selected session tab ─────────────────
  const sessionAppointments = activeSession
    ? appointments.filter(a => a.session === activeSession)
    : appointments;

  // Per-session counts for tab badges
  const morningAppts    = appointments.filter(a => a.session === "Morning");
  const eveningAppts    = appointments.filter(a => a.session === "Evening");
  const morningRemaining = morningAppts.filter(a => a.status === "Pending" || a.status === "In Progress").length;
  const eveningRemaining = eveningAppts.filter(a => a.status === "Pending" || a.status === "In Progress").length;

  // ── Build prefill URL params from an appointment ──────────
  const buildPrefillParams = (appt) =>
    new URLSearchParams({
      prefill:       "1",
      appointmentId: appt.appointmentId,
      patientName:   appt.patientName,
      patientId:     appt.patientId || "",
      channelingNo:  appt.channelingNo || "",
    }).toString();

  // ── START: Pending → In Progress, then open Rx form ───────
  const handleStart = async (appt) => {
    setStartingId(appt._id);
    try {
      const res     = await api.patch(`/appointments/${appt._id}/start`);
      const updated = res.data.appointment;

      setAppointments(prev => prev.map(a => a._id === updated._id ? updated : a));
      setApptStats(prev => ({
        ...prev,
        pending:    Math.max(0, prev.pending - 1),
        inProgress: prev.inProgress + 1,
      }));

      navigate(`/doctor/prescriptions?${buildPrefillParams(updated)}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to start appointment", "error");
    } finally {
      setStartingId(null);
    }
  };

  // ── CONTINUE: already In Progress — just reopen Rx form ───
  // No status change needed. Re-navigates with same prefill data
  // so if the doctor accidentally closed the prescription form,
  // they can reopen it with all fields already populated.
  const handleContinue = (appt) => {
    navigate(`/doctor/prescriptions?${buildPrefillParams(appt)}`);
  };

  // ── Stat cards ────────────────────────────────────────────
  const STAT_CARDS = [
    {
      label: "Today's Appointments",
      value: loadingAppts ? "—" : apptStats.total,
      sub:   loadingAppts ? "Loading…" : `${apptStats.remaining} remaining`,
      icon: <CalendarIcon />,
      color: "#1565C0", bg: "#E3F2FD",
      trend: `+${apptStats.completed || 0}`,
      trendUp: (apptStats.completed || 0) > 0,
    },
    {
      label: "Prescriptions Issued",
      value: monthlyRxCount || "—",
      sub:   "This month",
      icon: <PrescriptionIcon />,
      color: "#00897B", bg: "#E0F2F1",
      trend: `+${recentRx.length}`,
      trendUp: recentRx.length > 0,
    },
    {
      label: "Lab Requests",
      value: labPending || "—",
      sub:   `${labPending} pending results`,
      icon: <LabIcon />,
      color: "#1565C0", bg: "#E3F2FD",
      trend: `${labPending || 0}`,
      trendUp: false,
    },
    {
      label: "Patients Seen",
      value: loadingAppts ? "—" : apptStats.completed,
      sub:   "Today",
      icon: <PatientsIcon />,
      color: "#E65100", bg: "#FFF3E0",
      trend: `+${apptStats.completed || 0}`,
      trendUp: (apptStats.completed || 0) > 0,
    },
  ];

  // ── Which session is live RIGHT NOW (for green dot) ──────────
  // clockSession (for tab auto-select) still uses detectActiveSession
  const clockSession = detectActiveSession(morningStart, eveningStart);

  // ── Session tab definitions ───────────────────────────────
  const SESSION_TABS = [
    {
      key:       "Morning",
      label:     "Morning",
      timeRange: `${fmtSessionTime(morningStart)} – ${fmtSessionTime(morningEnd)}`,
      sunIcon:   true,
      remaining: morningRemaining,
      count:     morningAppts.length,
      isLive:    isSessionLive("Morning", morningStart, morningEnd, eveningStart, eveningEnd),
    },
    {
      key:       "Evening",
      label:     "Evening",
      timeRange: `${fmtSessionTime(eveningStart)} – ${fmtSessionTime(eveningEnd)}`,
      sunIcon:   false,
      remaining: eveningRemaining,
      count:     eveningAppts.length,
      isLive:    isSessionLive("Evening", morningStart, morningEnd, eveningStart, eveningEnd),
    },
  ];

  return (
    <DoctorLayout activePage="Dashboard">

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-medium transition-all ${
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="p-6 space-y-6">

        {/* ── Welcome Banner ──────────────────────────────── */}
        <div
          className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="white">
              <circle cx="150" cy="100" r="80"/>
              <circle cx="50" cy="50" r="50"/>
            </svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">{getGreeting()},</p>
            <h2 className="text-white font-bold text-2xl mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dr. {doctorName} 👋
            </h2>
            <p className="text-white/60 text-sm mt-1.5">
              {loadingAppts ? (
                <span className="animate-pulse">Loading schedule…</span>
              ) : (
                <>
                  You have{" "}
                  <span className="text-cyan-300 font-bold">
                    {apptStats.remaining} appointment{apptStats.remaining !== 1 ? "s" : ""}
                  </span>{" "}
                  remaining today
                  {labPending > 0 && (
                    <span className="ml-2 text-white/60">· {labPending} pending lab results</span>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="hidden md:flex gap-3 relative">
            <a href="/doctor/appointments"
              className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/25 transition">
              View Schedule
            </a>
            <a href="/doctor/prescriptions"
              className="px-5 py-2.5 bg-white text-blue-800 rounded-xl text-sm font-semibold hover:bg-blue-50 transition">
              New Prescription
            </a>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingAppts
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : STAT_CARDS.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    card.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                  }`}>
                    {card.trend}
                  </span>
                </div>
                <div className="font-bold" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#0D2137" }}>
                  {card.value}
                </div>
                <div className="text-gray-500 text-sm mt-0.5">{card.label}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </div>
            ))
          }
        </div>

        {/* ── Main Grid ──────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Today's Schedule (2 cols) ──────────────── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card header + session tabs */}
            <div className="px-6 pt-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Today's Schedule</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                <a href="/doctor/appointments" className="text-sm text-blue-600 font-medium hover:underline mt-0.5">
                  View All
                </a>
              </div>

              {/* ── Session Tabs ─────────────────────────── */}
              <div className="flex gap-1">
                {SESSION_TABS.map((tab) => {
                  const isActive      = activeSession === tab.key;
                  const isCurrentTime = tab.isLive; // green dot = session is happening right now

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSession(tab.key)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
                        isActive
                          ? "border-blue-600 text-blue-700 bg-blue-50/50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {/* Sun / Moon icon */}
                      {tab.sunIcon ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-amber-500" : "text-gray-400"}`}>
                          <circle cx="12" cy="12" r="4"/>
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-500" : "text-gray-400"}`}>
                          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                        </svg>
                      )}

                      <div className="text-left">
                        <div>{tab.label}</div>
                        <div className={`text-xs font-normal leading-none mt-0.5 ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                          {tab.timeRange}
                        </div>
                      </div>

                      {/* Remaining count badge */}
                      {tab.remaining > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                          isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          {tab.remaining}
                        </span>
                      )}

                      {/* Green dot = currently active clock session */}
                      {isCurrentTime && (
                        <span
                          title="Current session"
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Appointments list */}
            {loadingAppts ? (
              <div className="divide-y divide-gray-50">
                {Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : sessionAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 text-2xl">
                  {activeSession === "Morning" ? "🌤️" : "🌙"}
                </div>
                <p className="text-gray-500 font-medium">
                  No {activeSession?.toLowerCase()} appointments today
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeSession === "Morning"
                    ? `Morning session: ${fmtSessionTime(morningStart)} – ${fmtSessionTime(morningEnd)}`
                    : `Evening session: ${fmtSessionTime(eveningStart)} – ${fmtSessionTime(eveningEnd)}`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">

                {/* Mini summary strip */}
                <div className="flex items-center gap-5 px-6 py-2 bg-gray-50/60 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"/>
                    {sessionAppointments.filter(a => a.status === "Pending").length} Pending
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block"/>
                    {sessionAppointments.filter(a => a.status === "In Progress").length} In Progress
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>
                    {sessionAppointments.filter(a => a.status === "Completed").length} Completed
                  </span>
                </div>

                {sessionAppointments.map((appt) => {
                  const statusStyle = APPT_STATUS[appt.status] || APPT_STATUS.Pending;
                  const isStarting  = startingId === appt._id;
                  const isInProgress = appt.status === "In Progress";

                  return (
                    <div
                      key={appt._id}
                      className={`flex items-center gap-3 px-6 py-3.5 transition ${
                        isInProgress
                          ? "bg-blue-50/30 border-l-2 border-l-blue-400 hover:bg-blue-50/50"
                          : "hover:bg-gray-50/70"
                      }`}
                    >
                      {/* Estimated time */}
                      <div className="text-sm font-medium text-gray-500 w-14 flex-shrink-0 tabular-nums">
                        {appt.estimatedTime || "—"}
                      </div>

                      {/* Channeling badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
                        isInProgress
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {appt.channelingNo || "?"}
                      </div>

                      {/* Patient info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{appt.patientName}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          {appt.patientId && (
                            <span className="font-mono">{appt.patientId}</span>
                          )}
                          {appt.patientId && <span className="text-gray-200">·</span>}
                          <span className="font-mono truncate">{appt.appointmentId}</span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusStyle.pill}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isInProgress ? `${statusStyle.dot} animate-pulse` : statusStyle.dot
                        }`}/>
                        {appt.status}
                      </span>

                      {/* ── Action button ──────────────────────── */}

                      {/* START — Pending only → changes status + opens Rx form */}
                      {appt.status === "Pending" && (
                        <button
                          onClick={() => handleStart(appt)}
                          disabled={isStarting || startingId !== null}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex-shrink-0 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                          style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
                        >
                          {isStarting ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                              Starting…
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                              </svg>
                              Start
                            </>
                          )}
                        </button>
                      )}

                      {/* CONTINUE — In Progress only
                          No API call needed — appointment is already In Progress.
                          Opens the prescription form pre-filled with this patient's
                          data so the doctor can resume if they closed it accidentally. */}
                      {isInProgress && (
                        <button
                          onClick={() => handleContinue(appt)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex-shrink-0 transition shadow-sm hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #0D47A1, #1976D2)" }}
                          title="Reopen prescription form for this patient"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                          Continue
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right sidebar ──────────────────────────── */}
          <div className="space-y-5">

            {/* ── Recent Prescriptions (last 30 min) ───── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Recent Prescriptions</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Issued in last 30 minutes</p>
                </div>
                <a href="/doctor/prescriptions" className="text-xs text-blue-600 font-medium hover:underline flex-shrink-0">
                  View All
                </a>
              </div>

              {loadingRx ? (
                <div className="divide-y divide-gray-50">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="px-5 py-3.5 animate-pulse space-y-2">
                      <div className="flex justify-between">
                        <div className="w-28 h-3.5 bg-gray-100 rounded"/>
                        <div className="w-16 h-5 bg-gray-100 rounded-full"/>
                      </div>
                      <div className="w-20 h-3 bg-gray-100 rounded"/>
                      <div className="w-32 h-3 bg-gray-100 rounded"/>
                    </div>
                  ))}
                </div>
              ) : recentRx.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                    <PrescriptionIcon />
                  </div>
                  <p className="text-gray-400 text-xs">No prescriptions in the last 30 min</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentRx.map((rx) => {
                    const rxSt = RX_STATUS[rx.pharmacyStatus] || RX_STATUS.pending;
                    return (
                      <div key={rx._id} className="px-5 py-3 hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800 truncate mr-2">{rx.patientName}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${rxSt.pill}`}>
                            {rxSt.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                          {rx.patientId && (
                            <span className="font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                              {rx.patientId}
                            </span>
                          )}
                          {rx.appointmentId && (
                            <span className="font-mono bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-600">
                              {rx.appointmentId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {/* Clickable RX ID → opens that prescription in the prescriptions page */}
                          <button
                            onClick={() => navigate(`/doctor/prescriptions?open=${rx.prescriptionId}`)}
                            className="text-xs font-mono text-blue-500 hover:text-blue-700 hover:underline transition text-left"
                            title="View this prescription"
                          >
                            {rx.prescriptionId}
                          </button>
                          <span className="text-xs text-gray-400">{formatRelativeTime(rx.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Quick Actions ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { label: "Issue Prescription", href: "/doctor/prescriptions", color: "#1565C0", bg: "#E3F2FD", icon: QA_ICONS.prescription },
                  { label: "Request Lab Test",    href: "/doctor/lab-requests",  color: "#7B1FA2", bg: "#F3E5F5", icon: QA_ICONS.lab },
                  { label: "View Lab Results",    href: "/doctor/lab-requests",  color: "#00897B", bg: "#E0F2F1", icon: QA_ICONS.chart },
                  { label: "Patient History",     href: "/doctor/patients",      color: "#E65100", bg: "#FFF3E0", icon: QA_ICONS.patient },
                ].map((action) => (
                  <a key={action.label} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: action.bg, color: action.color }}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">
                      {action.label}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor"
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-transform group-hover:translate-x-0.5">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Lab Alerts (static — update later) ─── */}
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