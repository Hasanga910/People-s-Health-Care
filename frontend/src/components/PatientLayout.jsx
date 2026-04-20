import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// APPLE LIQUID-GLASS TOAST SYSTEM
// Two notification types share the same component:
//   "cancellation" — red  — doctor marked a session as holiday (appointment cancelled)
//   "precheck"     — purple — lab sent pre-conditions for a lab test
// ─────────────────────────────────────────────────────────────────────────────

const TOAST_CFG = {
  cancellation: {
    bg:     "rgba(220,38,38,0.13)",
    border: "rgba(239,68,68,0.35)",
    text:   "#7f1d1d",
    accent: "#ef4444",
    label:  "Appointment Cancelled",
  },
  precheck: {
  bg:     "rgba(37,99,235,0.12)",     // blue-600 soft
  border: "rgba(59,130,246,0.35)",    // blue-500
  text:   "#1e3a8a",                  // blue-900
  accent: "#2563eb",                  // blue-600
  label:  "Lab Pre-Check Required",
},
  info: {
    bg:     "rgba(100,116,139,0.10)",
    border: "rgba(148,163,184,0.3)",
    text:   "#1e293b",
    accent: "#64748b",
    label:  "Notice",
  },
};

// Inject keyframe animation once (shared id so no duplicate if DoctorLayout did it first)
if (typeof document !== "undefined" && !document.getElementById("__toast_kf")) {
  const s = document.createElement("style");
  s.id = "__toast_kf";
  s.textContent = `
    @keyframes toast-shrink { from { transform:scaleX(1); } to { transform:scaleX(0); } }
    .toast-progress { animation: toast-shrink linear forwards; transform-origin: left; }
  `;
  document.head.appendChild(s);
}

// Icons per type
const ToastIcon = {
  cancellation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  precheck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Single liquid-glass toast ──────────────────────────────────────────────────
function LiquidToast({ toast, onDismiss }) {
  const cfg = TOAST_CFG[toast.type] ?? TOAST_CFG.info;
  const [out, setOut] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVis(true));
    const t = setTimeout(() => {
      setOut(true);
      setTimeout(() => onDismiss(toast.id), 420);
    }, toast.duration ?? 9000);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setOut(true);
    setTimeout(() => onDismiss(toast.id), 420);
  };

  return (
    <div
      onClick={() => { dismiss(); toast.onClick?.(); }}
      style={{
        transform:  vis && !out ? "translateX(0) scale(1)" : "translateX(115%) scale(0.9)",
        opacity:    vis && !out ? 1 : 0,
        transition: "transform 0.44s cubic-bezier(0.34,1.56,0.64,1), opacity 0.36s ease",
        background: cfg.bg,
        backdropFilter:       "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        border:     `1.5px solid ${cfg.border}`,
        boxShadow:  "0 8px 40px rgba(0,0,0,0.13),0 2px 8px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,0.45)",
        cursor:     "pointer",
      }}
      className="w-[360px] rounded-[20px] p-4 flex items-start gap-3 relative overflow-hidden">

      {/* Shimmer */}
      <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0))", pointerEvents: "none" }}
        className="absolute inset-0 rounded-[20px]" />

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{ background: `${cfg.accent}22`, border: `1px solid ${cfg.accent}44` }}>
        <span style={{ color: cfg.accent }}>
          {ToastIcon[toast.type] ?? ToastIcon.info}
        </span>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-ping"
          style={{ background: cfg.accent }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ color: cfg.accent }}>
            {cfg.label}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white animate-pulse"
            style={{ background: cfg.accent }}>
            IMPORTANT
          </span>
        </div>
        {toast.title && (
          <div className="text-[13px] font-semibold leading-snug" style={{ color: cfg.text }}>
            {toast.title}
          </div>
        )}
        {toast.subtitle && (
          <div className="text-[12px] mt-1 leading-relaxed opacity-80" style={{ color: cfg.text }}>
            {toast.subtitle}
          </div>
        )}
        {/* "Tap to view" hint for precheck toasts */}
        {toast.type === "precheck" && (
          <div className="text-[11px] mt-1.5 font-semibold" style={{ color: cfg.accent }}>
            Tap to view pre-conditions →
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="flex-shrink-0 opacity-35 hover:opacity-60 transition mt-0.5 relative"
        style={{ color: cfg.text }}>
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M4.293 4.293a1 1 0 011.414 0L8 6.586l2.293-2.293a1 1 0 111.414 1.414L9.414 8l2.293 2.293a1 1 0 01-1.414 1.414L8 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L6.586 8 4.293 5.707a1 1 0 010-1.414z"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[20px] overflow-hidden">
        <div className="h-full toast-progress rounded-full"
          style={{ background: cfg.accent, animationDuration: `${toast.duration ?? 9000}ms` }} />
      </div>
    </div>
  );
}

// ── Toast stack — top-right ────────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed top-[72px] right-4 z-[300] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <LiquidToast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function prettyDate(ymd) {
  if (!ymd) return "";
  try {
    return new Date(ymd + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return ymd; }
}

// ── Seen-ID persistence — scoped per patient userId ────────────────────────────
// Separate keys for cancellations and pre-checks so they never collide.
const SEEN_CANCEL_PREFIX  = "phc_seen_cancellations_";
const SEEN_PRECHECK_PREFIX = "phc_seen_prechecks_";

const cancelKey   = (uid) => `${SEEN_CANCEL_PREFIX}${uid  || "anon"}`;
const precheckKey = (uid) => `${SEEN_PRECHECK_PREFIX}${uid || "anon"}`;

function loadSeen(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function persistSeen(key, setOfIds) {
  try {
    localStorage.setItem(key, JSON.stringify([...setOfIds]));
  } catch { /* quota — ignore */ }
}

// ── Logout modal (unchanged) ───────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-red-500">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </div>
        <h3 className="text-center text-gray-800 font-bold text-lg mb-1">Sign Out</h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          Are you sure you want to log out of your account?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Nav items (unchanged) ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "My Dashboard",      href: "/patient/dashboard",    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>) },
  { label: "My Appointments",   href: "/patient/appointments", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>) },
  { label: "My Prescriptions",  href: "/patient/prescriptions",icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>) },
  { label: "Lab Results",       href: "/patient/lab-results",  icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4" /></svg>) },
  { label: "Billing & Payments",href: "/patient/billing",      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>) },
  { label: "My Profile",        href: "/patient/profile",      icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>) },
  { label: "Feedback & Ratings",href: "/patient/feedback",     icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>) },
];

function getStoredUser() {
  try {
    const str = sessionStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch { return null; }
}

function getInitials(name) {
  if (!name) return "P";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
export default function PatientLayout({ children, activePage = "My Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const navigate = useNavigate();

  const user        = getStoredUser();
  const displayName = user?.name || "Patient";
  const initials    = getInitials(user?.name);
  const patientId   = user?.userId || "";
  const bloodGroup  = user?.patientDetails?.bloodGroup || "";
  const subline     = [patientId, bloodGroup].filter(Boolean).join(" · ");

  // ── Shared toast state ───────────────────────────────────────────────────────
  const [toasts,    setToasts]    = useState([]);
  const [labNotifs, setLabNotifs] = useState([]);
  // labNotifs drives the bell badge count for pre-check items
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const pushToast = useCallback((cfg) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev.slice(-4), { id, ...cfg }]);
    return id;
  }, []);

  // ── 1. Session cancellation polling ─────────────────────────────────────────
  // Polls /appointments/holiday-cancellations every 90s.
  // Shows a RED liquid-glass toast for each unseen cancelled appointment.
  useEffect(() => {
    if (!user || user.role !== "patient") return;

    let dead = false;
    const seen = loadSeen(cancelKey(user._id));

    const buildCancelText = (c) =>
      `The ${c.session} session of ${prettyDate(c.date)} has been cancelled by the doctor ` +
      `due to ${c.reason || "an unexpected reason"}. ` +
      `Please make an appointment for another day and a session. ` +
      `Sorry for the inconvenience`;

    const poll = async () => {
      try {
        const res = await api.get("/appointments/holiday-cancellations");
        if (dead) return;
        const fresh = (res.data?.cancellations || [])
          .filter(c => !seen.has(String(c._id)));
        if (!fresh.length) return;

        fresh.forEach((c, i) => {
          const key = String(c._id);
          setTimeout(() => {
            pushToast({
              type:     "cancellation",
              title:    `${c.session} session on ${prettyDate(c.date)} cancelled`,
              subtitle: buildCancelText(c),
              duration: 10000,
            });
          }, i * 450);
          seen.add(key);
        });

        persistSeen(cancelKey(user._id), seen);
      } catch (err) {
        if (err?.response?.status !== 401)
          console.warn("Holiday cancellations poll failed:", err.message);
      }
    };

    const first    = setTimeout(poll, 600);
    const interval = setInterval(poll, 90_000);
    return () => { dead = true; clearTimeout(first); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // ── 2. Lab pre-check polling ─────────────────────────────────────────────────
  // Polls /lab-results/patient-notifications every 30s.
  // Shows a PURPLE liquid-glass toast for each new pre-check test.
  // Clicking the toast navigates to /patient/lab-results?tab=pre_check.
  useEffect(() => {
    if (!user || user.role !== "patient") return;

    let dead = false;
    const seen = loadSeen(precheckKey(user._id));

    const poll = async () => {
      try {
        const res = await api.get("/lab-results/patient-notifications");
        if (dead) return;
        const notifs = res.data?.notifications || [];
        setLabNotifs(notifs); // update badge count

        const fresh = notifs.filter(n => !seen.has(String(n._id || n.testId)));
        if (!fresh.length) return;

        fresh.forEach((n, i) => {
          const key = String(n._id || n.testId);
          setTimeout(() => {
            pushToast({
              type:    "precheck",
              title:   n.testName,
              subtitle: n.fastingHours > 0
                ? `${n.fastingHours}-hour fasting required before sample collection`
                : "Please review pre-conditions before visiting the lab",
              duration: 9000,
              onClick:  () => navigate("/patient/lab-results?tab=pre_check"),
            });
          }, i * 400);
          seen.add(key);
        });

        persistSeen(precheckKey(user._id), seen);
      } catch (err) {
        if (err?.response?.status !== 401)
          console.warn("Lab pre-check poll failed:", err.message);
      }
    };

    const first    = setTimeout(poll, 1200); // slightly after cancel poll
    const interval = setInterval(poll, 30_000);
    return () => { dead = true; clearTimeout(first); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const unreadPreChecks = labNotifs.length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="flex h-screen bg-gray-50 overflow-hidden">

      {showLogout && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
      )}

      {/* ── Apple liquid-glass toast stack ── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* ── SIDEBAR ── */}
      <aside
        className={`relative flex flex-col text-white transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}
        style={{ background: "linear-gradient(180deg, #0D2137 0%, #0a1a2e 100%)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/Logo.png" alt="PHC" className="w-full h-full object-contain" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.2 }}>
                People's Health Care
              </div>
              <div className="text-white/40 text-xs">Patient Portal</div>
            </div>
          )}
        </div>

        {/* Patient mini profile */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {user?.photo ? (
                <img src={user.photo} alt={displayName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #00ACC1, #1565C0)" }}>
                  {initials}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate">{displayName}</div>
                <div className="text-white/40 text-xs truncate">{subline || "Patient"}</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 mt-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive      = activePage === item.label;
            const isLabResults  = item.label === "Lab Results";
            return (
              <a key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                } ${!sidebarOpen ? "justify-center" : ""}`}
                style={isActive ? { background: "linear-gradient(135deg, #00ACC1, #1565C0)" } : {}}>
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {/* Purple pre-check badge on Lab Results nav item */}
                    {isLabResults && unreadPreChecks > 0 && (
                      <span className="text-xs text-white px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}>
                        {unreadPreChecks}
                      </span>
                    )}
                  </>
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/patient/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition ${!sidebarOpen ? "justify-center" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </a>

          <button onClick={() => setShowLogout(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition ${!sidebarOpen ? "justify-center" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 rounded-full bg-[#0D2137] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
            {sidebarOpen ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
          </svg>
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="text-xs text-gray-400">Patient Portal</div>
            <div className="font-semibold text-gray-800">{activePage}</div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-400">{today}</div>

            {/* ── Notification Bell ── */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {/* Live purple badge for pre-check count */}
                {unreadPreChecks > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}>
                    {unreadPreChecks > 9 ? "9+" : unreadPreChecks}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 overflow-hidden rounded-2xl shadow-2xl border border-gray-100"
                  style={{ width: 340, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)" }}>

                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">Notifications</span>
                    {unreadPreChecks > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}>
                        {unreadPreChecks} pre-check
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {labNotifs.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className="text-gray-400 text-sm">No new notifications</p>
                      </div>
                    ) : (
                      labNotifs.map((n) => (
                        <div
                          key={String(n._id || n.testId)}
                          onClick={() => {
                            setNotifOpen(false);
                            navigate("/patient/lab-results?tab=pre_check");
                          }}
                          className="flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition hover:bg-purple-50">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}>
                            🧪
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800">Pre-Check Required</div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">{n.testName}</div>
                            {n.fastingHours > 0 && (
                              <div className="text-xs font-medium mt-1" style={{ color: "#7C3AED" }}>
                                ⏱ {n.fastingHours}h fasting required
                              </div>
                            )}
                            {n.isReady ? (
                              <div className="text-xs text-green-600 font-semibold mt-0.5">
                                ✓ Ready to submit sample
                              </div>
                            ) : n.remainingTime && (
                              <div className="text-xs text-amber-600 mt-0.5">
                                Ready in {n.remainingTime}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#7C3AED" }}>
                            View →
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {labNotifs.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/patient/lab-results?tab=pre_check");
                        }}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}>
                        View All Pre-Checks →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2 cursor-pointer">
              {user?.photo ? (
                <img src={user.photo} alt={displayName} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #00ACC1, #1565C0)" }}>
                  {initials}
                </div>
              )}
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-800">{displayName}</div>
                <div className="text-xs text-gray-400">Patient</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}